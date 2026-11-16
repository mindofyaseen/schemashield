import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeFirewallGlobeProps {
  status?: 'BLOCK RELEASE' | 'SAFE TO RELEASE' | 'IDLE';
}

export const ThreeFirewallGlobe: React.FC<ThreeFirewallGlobeProps> = ({ status = 'BLOCK RELEASE' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Color theme based on status
    const isBlocked = status === 'BLOCK RELEASE';
    const primaryColor = isBlocked ? 0xf43f5e : 0x10b981; // Rose vs Emerald
    const secondaryColor = 0x3b82f6; // Blue

    // 1. Central Core Sphere (Shield)
    const coreGeo = new THREE.IcosahedronGeometry(4.5, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // 2. Inner Glowing Core
    const innerGeo = new THREE.SphereGeometry(2.8, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // 3. Orbiting Firewall Rings
    const ringGeo1 = new THREE.TorusGeometry(6.2, 0.05, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      transparent: true,
      opacity: 0.6
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(7.0, 0.04, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.5
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // 4. Data Particle Clouds (Constellation)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 7.5 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      color: isBlocked ? 0xfca5a5 : 0x6ee7b7,
      transparent: true,
      opacity: 0.8
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 5. Interactive Mouse Orbiting
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / width - 0.5) * 2;
      mouseY = ((event.clientY - rect.top) / height - 0.5) * 2;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Rotations
      coreMesh.rotation.y += 0.008;
      coreMesh.rotation.x += 0.004;

      innerMesh.rotation.y -= 0.01;

      ring1.rotation.z += 0.006;
      ring2.rotation.x -= 0.005;

      particleSystem.rotation.y += 0.002;

      // Interactive tilt
      scene.rotation.y = targetX * 0.6;
      scene.rotation.x = -targetY * 0.6;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [status]);

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] flex items-center justify-center overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-2 left-4 text-[10px] font-mono text-slate-400 bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-800">
        3D Interactive WebGL Firewall Core • Hover / Drag to Inspect
      </div>
    </div>
  );
};
