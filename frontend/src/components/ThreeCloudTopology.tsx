import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ShieldAlert, ShieldCheck, Activity, RotateCcw, ZoomIn, ZoomOut, Info } from 'lucide-react';

interface NodeData {
  id: string;
  name: string;
  type: 'producer' | 'firewall' | 'consumer-breaking' | 'consumer-safe';
  status: string;
  detail: string;
  position: [number, number, number];
  color: number;
}

export const ThreeCloudTopology: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [isRotating, setIsRotating] = useState(true);

  // Nodes definition
  const nodes: NodeData[] = [
    {
      id: 'producer',
      name: 'Orders Producer Service',
      type: 'producer',
      status: 'PROPOSED DRIFT',
      detail: 'Mutated schema v1.1.0: removed customer_id, changed total from number to string.',
      position: [-8, 0, 0],
      color: 0x38bdf8 // Light Blue
    },
    {
      id: 'firewall',
      name: 'AWS Step Functions (SchemaShield)',
      type: 'firewall',
      status: 'BLOCK RELEASE (Score 100/100)',
      detail: 'Intercepted candidate schema. Executing parallel Lambda Map state against consumer contracts.',
      position: [0, 0, 0],
      color: 0x818cf8 // Indigo / Violet
    },
    {
      id: 'billing',
      name: 'Downstream: Billing Service',
      type: 'consumer-breaking',
      status: 'BLOCKED / OUTAGE PREVENTED',
      detail: 'Requires total as numeric float. Candidate sent string -> WOULD CAUSE CRITICAL 500 INVOICING FAILURE.',
      position: [8, 4, 0],
      color: 0xf43f5e // Rose Red
    },
    {
      id: 'analytics',
      name: 'Downstream: Analytics Warehouse',
      type: 'consumer-breaking',
      status: 'BLOCKED / CORRUPTION PREVENTED',
      detail: 'Queries customer_id foreign key. Candidate renamed to buyer_id -> WOULD BREAK REPORTING ETL PIPELINE.',
      position: [8, 0, 0],
      color: 0xf43f5e // Rose Red
    },
    {
      id: 'notifications',
      name: 'Downstream: Notification Dispatcher',
      type: 'consumer-safe',
      status: 'COMPATIBLE / VERIFIED SAFE',
      detail: 'Requires only order_id and customer_email. Both fields intact -> Zero False Positives.',
      position: [8, -4, 0],
      color: 0x10b981 // Emerald Green
    }
  ];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090d16, 0.025);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Group to hold all rotatable elements
    const world = new THREE.Group();
    scene.add(world);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -6;
    world.add(gridHelper);

    // Ambient & Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x6366f1, 2, 30);
    coreLight.position.set(0, 0, 0);
    world.add(coreLight);

    // Create 3D Nodes
    const meshMap = new Map<THREE.Mesh, NodeData>();
    const nodeMeshes: THREE.Mesh[] = [];

    nodes.forEach(node => {
      let geo: THREE.BufferGeometry;
      if (node.type === 'firewall') {
        geo = new THREE.IcosahedronGeometry(2.4, 2);
      } else if (node.type === 'producer') {
        geo = new THREE.DodecahedronGeometry(1.5, 1);
      } else {
        geo = new THREE.SphereGeometry(1.3, 24, 24);
      }

      // Outer Wireframe
      const wireMat = new THREE.MeshBasicMaterial({
        color: node.color,
        wireframe: true,
        transparent: true,
        opacity: node.type === 'firewall' ? 0.6 : 0.8
      });
      const mesh = new THREE.Mesh(geo, wireMat);
      mesh.position.set(...node.position);
      world.add(mesh);

      // Inner solid glowing sphere
      const innerGeo = new THREE.SphereGeometry(node.type === 'firewall' ? 1.6 : 0.9, 16, 16);
      const innerMat = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.35
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      mesh.add(innerMesh);

      // Orbiting Ring for Firewall Core
      if (node.type === 'firewall') {
        const ringGeo = new THREE.TorusGeometry(3.2, 0.05, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 3;
        mesh.add(ring);

        const ringGeo2 = new THREE.TorusGeometry(3.8, 0.04, 16, 64);
        const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.6 });
        const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
        ring2.rotation.y = Math.PI / 4;
        mesh.add(ring2);
      }

      meshMap.set(mesh, node);
      nodeMeshes.push(mesh);
    });

    // Connecting Lines & Dynamic Particles
    interface Packet {
      curve: THREE.LineCurve3;
      mesh: THREE.Mesh;
      progress: number;
      speed: number;
      isBlocked: boolean;
    }

    const packets: Packet[] = [];
    const packetGeo = new THREE.SphereGeometry(0.18, 8, 8);

    const connectNodes = (startPos: [number, number, number], endPos: [number, number, number], color: number, isBlocked: boolean) => {
      const vStart = new THREE.Vector3(...startPos);
      const vEnd = new THREE.Vector3(...endPos);
      const curve = new THREE.LineCurve3(vStart, vEnd);

      const points = curve.getPoints(30);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: color,
        dashSize: 0.4,
        gapSize: 0.2,
        transparent: true,
        opacity: 0.45
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      world.add(line);

      // Add 2 animated packets per line
      for (let i = 0; i < 2; i++) {
        const pMat = new THREE.MeshBasicMaterial({
          color: isBlocked ? 0xf87171 : 0x34d399,
          transparent: true,
          opacity: 0.9
        });
        const pMesh = new THREE.Mesh(packetGeo, pMat);
        world.add(pMesh);
        packets.push({
          curve,
          mesh: pMesh,
          progress: i * 0.5,
          speed: 0.007 + Math.random() * 0.003,
          isBlocked
        });
      }
    };

    // Producer -> Firewall Core
    connectNodes([-8, 0, 0], [0, 0, 0], 0x38bdf8, false);

    // Firewall Core -> Consumers
    connectNodes([0, 0, 0], [8, 4, 0], 0xf43f5e, true); // Billing (Blocked)
    connectNodes([0, 0, 0], [8, 0, 0], 0xf43f5e, true); // Analytics (Blocked)
    connectNodes([0, 0, 0], [8, -4, 0], 0x10b981, false); // Notifications (Safe)

    // Raycaster for Mouse Hover / Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes, true);

      if (intersects.length > 0) {
        let rootMesh: THREE.Mesh | null = null;
        intersects[0].object.traverseAncestors(ancestor => {
          if (meshMap.has(ancestor as THREE.Mesh)) rootMesh = ancestor as THREE.Mesh;
        });
        if (!rootMesh && meshMap.has(intersects[0].object as THREE.Mesh)) {
          rootMesh = intersects[0].object as THREE.Mesh;
        }

        if (rootMesh && meshMap.has(rootMesh)) {
          setSelectedNode(meshMap.get(rootMesh)!);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // Drag-to-rotate interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      world.rotation.y += deltaX * 0.008;
      world.rotation.x += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(10, Math.min(35, camera.position.z + e.deltaY * 0.02));
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isRotating && !isDragging) {
        world.rotation.y += 0.0025;
      }

      // Rotate individual node meshes
      nodeMeshes.forEach(mesh => {
        mesh.rotation.y += 0.01;
        mesh.rotation.x += 0.005;
      });

      // Animate flowing packets
      packets.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) {
          p.progress = 0;
        }

        // If blocked, packet stops or dissolves at 60% distance from core
        let effectiveProg = p.progress;
        if (p.isBlocked && effectiveProg > 0.6) {
          effectiveProg = 0.6;
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (p.progress - 0.6) * 3);
        } else {
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.9;
        }

        const point = p.curve.getPoint(effectiveProg);
        p.mesh.position.copy(point);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isRotating]);

  return (
    <div className="relative w-full h-[520px] bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden select-none">
      {/* 3D WebGL Canvas container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-mono text-slate-200 flex items-center space-x-2 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="font-bold text-white tracking-wide">3D LIVE FIREWALL TOPOLOGY</span>
        </div>
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md transition shadow ${
            isRotating
              ? 'bg-blue-600/70 border-blue-500 text-white'
              : 'bg-slate-800/80 border-slate-700 text-slate-300'
          }`}
        >
          {isRotating ? 'Auto-Rotate ON' : 'Auto-Rotate PAUSED'}
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <span className="hidden sm:inline-block bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-slate-300">
          💡 Click any node or drag to inspect in 3D
        </span>
      </div>

      {/* Legend Overlay at Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700 text-xs space-y-1.5 shadow-xl max-w-xs">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-sky-400 shrink-0"></span>
          <span className="text-slate-300 font-medium">Upstream Producer (Candidate Drift)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0"></span>
          <span className="text-slate-300 font-medium">AWS Step Functions Core</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
          <span className="text-slate-300 font-medium">Downstream Outage (Blocked by Shield)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="text-slate-300 font-medium">Compatible Consumer (Safe Passthrough)</span>
        </div>
      </div>

      {/* Selected Node Inspector Modal / Drawer */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 z-10 bg-slate-900/95 backdrop-blur-lg p-5 rounded-2xl border border-slate-700 text-white shadow-2xl max-w-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Inspected Cloud Node
              </span>
              <h4 className="text-sm font-bold text-white tracking-tight">{selectedNode.name}</h4>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="my-2">
            <span
              className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                selectedNode.type.includes('breaking') || selectedNode.type === 'firewall'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : selectedNode.type === 'consumer-safe'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-sky-950/80 border-sky-500 text-sky-300'
              }`}
            >
              {selectedNode.status}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-normal bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            {selectedNode.detail}
          </p>
        </div>
      )}
    </div>
  );
};
