# Architecture Decision Records (ADRs) — SchemaShield

---

### ADR-001: Deterministic Schema Engine over Large Language Models (LLMs)
* **Status:** Accepted
* **Context:** Modern teams occasionally explore LLMs for schema diffing. However, schema compatibility is a binary, mathematical contract. LLMs suffer from non-deterministic hallucinations, subtle schema misses, latency, and high recurring API token costs.
* **Decision:** We implemented a 100% deterministic Python comparator conforming to JSON Schema Draft 2020-12.
* **Consequences:** 
  - Complete reproducibility: Same schema diff always yields identical findings.
  - Zero token cost.
  - Sub-millisecond execution time.
  - 100% unit-testable rule coverage.

---

### ADR-002: Step Functions Map State for Consumer Isolation
* **Status:** Accepted
* **Context:** In enterprise environments, a producer contract might have dozens of downstream consumers. Evaluating them sequentially inside an API Lambda would risk gateway timeouts (29s limit) and compute bottlenecks.
* **Decision:** We orchestrate the analysis through AWS Step Functions using a bounded-concurrency `Map` state (`MaxConcurrency: 5`). Each consumer is evaluated in an isolated worker Lambda.
* **Consequences:**
  - Consumer failures are isolated: If one consumer has a schema violation, it is recorded as a finding without crashing the orchestration.
  - Bounded concurrency protects DynamoDB and downstream dependencies from throttling spikes.
  - Asynchronous polling pattern ensures snappy API responses for users.

---

### ADR-003: Separation of Proposed Changes from Active Contract Storage
* **Status:** Accepted
* **Context:** A common flaw in contract systems is accidentally modifying the active contract during draft verification.
* **Decision:** Proposed schemas are staged in a dedicated S3 prefix (`proposals/{contractId}/{analysisId}.json`) and evaluated read-only against immutable active schemas in `contracts/{contractId}/versions/`.
* **Consequences:** Production contracts are never mutated by an analysis run.

---

### ADR-004: Pure Serverless & Scale-to-Zero
* **Status:** Accepted
* **Context:** For the AWS Builder Center Weekend Challenge ("No Pipeline, No Problem"), judges and developers need a system that can be deployed without persistent server overhead or complex infrastructure maintenance.
* **Decision:** Amazon API Gateway, AWS Lambda, Amazon DynamoDB (On-Demand), Amazon S3, and Amazon CloudFront. No EC2 instances, containers (ECS/EKS), or relational databases (RDS).
* **Consequences:** Zero idle cost when not actively processing schema verifications.

---

### ADR-005: CloudFront Origin Access Control (OAC)
* **Status:** Accepted
* **Context:** Static single-page applications should not expose public S3 buckets directly to the internet.
* **Decision:** We use Amazon CloudFront with Origin Access Control (OAC) and private S3 bucket policies.
* **Consequences:** High security posture, automatic TLS/SSL termination, and global edge caching without public S3 bucket vulnerabilities.
