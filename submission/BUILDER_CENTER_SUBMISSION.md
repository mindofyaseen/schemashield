# SchemaShield — The Serverless Data Contract Firewall
### Submission for AWS Builder Center Challenge: Weekend Challenge: "No Pipeline, No Problem"

---

## 1. Project Title & Tagline
**Project Title:** SchemaShield  
**Tagline:** Catch breaking data contracts before they break production.  
**Author:** Muhammad Yaseen ([mindofyaseen](https://github.com/mindofyaseen))  
**Category:** Serverless / Data Reliability / Architecture  
**Live Demo Application:** [https://d39kvugurv6zcx.cloudfront.net](https://d39kvugurv6zcx.cloudfront.net)  
**Live Serverless API Gateway:** [https://3r48tr3ynb.execute-api.us-east-1.amazonaws.com/prod/api](https://3r48tr3ynb.execute-api.us-east-1.amazonaws.com/prod/api)  
**Demo Video:** [Link to 3-Minute Demonstration Video](https://youtu.be/placeholder-demo-schemashield)  
**GitHub Repository:** [https://github.com/mindofyaseen/schemashield](https://github.com/mindofyaseen/schemashield)

---

## 2. Compelling Introduction & Problem Statement
In modern distributed microservice architectures, data contracts are the silent backbone connecting independent teams. However, data engineering teams frequently suffer catastrophic production outages because **upstream producers change their data schemas without visibility into downstream consumer dependencies**.

Consider an e-commerce platform:
1. The **Orders Service** publishes order event payloads containing `order_id`, `customer_id`, `total` (numeric), `currency`, and `customer_email`.
2. Downstream, the **Billing Service** requires `customer_id` and numeric `total` to process transactions.
3. The **Analytics Warehouse** requires `customer_id` and numeric `total` to compute revenue dashboards.
4. The **Customer Notification Service** only requires `order_id` and `customer_email`.

When an upstream developer renames `customer_id` to `buyer_id` or turns `total` into a string, unit tests on the producer service still pass. But the moment the code deploys to production, the Billing and Analytics pipelines crash.

**SchemaShield solves this problem at the root.** It acts as an autonomous serverless firewall, inspecting proposed schema changes *before* production deployment, running parallel consumer validation with AWS Step Functions, calculating an explainable risk score (0–100), and visually mapping the blast radius.

---

## 3. What SchemaShield Does
1. **Authoritative Contract Registry:** Stores production schemas in Amazon S3 and metadata in Amazon DynamoDB with full version history.
2. **Downstream Consumer Registry:** Downstream services register their expected JSON Schema contracts against the producer.
3. **Deterministic Comparison Engine (Python):** Enforces JSON Schema Draft 2020-12 rules to discover removed properties, incompatible type mutations, enum narrowings, and violated guarantees—without LLM hallucinations.
4. **Parallel Consumer Blast-Radius Analysis:** Orchestrated via AWS Step Functions Map state, checking each downstream consumer simultaneously in isolated Lambda functions.
5. **3D Holographic Blast Radius & Serverless Topology:** Real-time interactive WebGL 3D firewall core visualizing cloud packet blockage and consumer impact in real time.
6. **Verification Studio (Upload Lab):** Allows engineers and business judges to upload custom JSON schemas manually or use presets, with an instant Before/After Visual Matrix.
7. **Pre-Merge Firewall Gate & CLI Simulator:** Emulates local CLI runs and GitHub Actions blockers preventing broken PR merges before deployment.
8. **Automated Migration Shims Generator:** Auto-generates backward-compatible adapter code in SQL/dbt, PySpark, TypeScript, and AWS Glue ETL scripts.
9. **Downtime ROI & Incident Cost Calculator:** Interactive financial calculator measuring revenue loss prevented and engineering hours saved.
10. **Actionable Migration Guidance:** Provides concrete fixes (e.g., backward-compatible field aliases and numeric preservation) before release.

---

## 4. AWS Serverless Architecture & Implementation
SchemaShield uses an entirely serverless, scale-to-zero AWS architecture:

```text
                        END USER / BROWSER
                                |
                                v
                     Amazon CloudFront (CDN)
                                |
                                v
                    Private S3 Frontend Bucket
                      (React + TypeScript)
                                |
                                v
                      Amazon API Gateway
                                |
                                v
                         API Lambda
                                |
             +------------------+------------------+
             |                  |                  |
             v                  v                  v
       Amazon DynamoDB      Amazon S3       AWS Step Functions
     (Contracts/Analyses) (Schemas/Reports)   State Machine
                                                   |
                                                   v
                                          LoadAnalysisContext
                                                   |
                                                   v
                                             CompareSchemas
                                                   |
                                                   v
                                             FetchConsumers
                                                   |
                                                   v
                                         Parallel Map State
                                         (Bounded Concurrency)
                                                   |
                             +---------------------+---------------------+
                             |                     |                     |
                             v                     v                     v
                          Billing              Analytics            Notification
                          Checker               Checker               Checker
                             |                     |                     |
                             +---------------------+---------------------+
                                                   |
                                                   v
                                            AggregateResults
                                                   |
                                 +-----------------+-----------------+
                                 |                                   |
                                 v                                   v
                          Amazon DynamoDB                        Amazon S3
                           (Save Status)                       (Save Report)
                                 |                                   |
                                 +-----------------+-----------------+
                                                   |
                                                   v
                                          Frontend Dashboard
```

### AWS Services Employed:
* **AWS Step Functions:** Orchestrates the verification lifecycle. Its bounded parallel `Map` state evaluates consumer contracts simultaneously while safeguarding downstream services from throttling.
* **Amazon API Gateway:** Provides secure, low-latency REST endpoints with CORS preflight and request validation.
* **AWS Lambda (Python 3.12):** Microservice workers executing deterministic schema diffs and compatibility evaluations.
* **Amazon DynamoDB (On-Demand):** Pay-per-request tables for contracts, consumers, and analysis history.
* **Amazon S3:** Dedicated private bucket with server-side encryption storing schemas and durable JSON reports.
* **Amazon CloudFront + Origin Access Control (OAC):** High-speed global edge distribution serving the React single-page dashboard securely from private S3 storage.

---

## 5. Alignment with "No Pipeline, No Problem"
Per the challenge requirements, SchemaShield maintains **no CI/CD deployment pipelines** (no GitHub Actions, CodePipeline, or Jenkins runners).

The complete infrastructure and application code are packaged into an AWS SAM template (`infrastructure/template.yaml`) and deployable with a single command:
```bash
./scripts/deploy.sh
```
or on Windows PowerShell:
```powershell
.\scripts\deploy.ps1
```
The script validates the template, executes unit tests, builds the React frontend, packages Lambda layers, deploys CloudFormation, and synchronizes assets to S3.

---

## 6. Real-World Demonstration Scenario
SchemaShield includes a prominent **LOAD INTERACTIVE DEMO** button.
1. Seeds the **Order Events** contract and 3 downstream consumers: **Billing Service**, **Analytics Warehouse**, and **Customer Notification Service**.
2. Clicking **SIMULATE BREAKING CHANGE** loads a proposed schema renaming `customer_id` to `buyer_id`, turning `total` into a string, and narrowing currency enums.
3. The Step Functions workflow executes and returns:
   - **Billing Service: BREAKING** (missing required `customer_id`, type mismatch on `total`).
   - **Analytics Warehouse: BREAKING** (missing required `customer_id`, type mismatch on `total`).
   - **Customer Notification Service: COMPATIBLE** (its required fields `order_id` and `customer_email` remain intact!).
   - **Release Verdict: BLOCK RELEASE** (Risk Score 85/100).

This demonstrates that SchemaShield does not merely generate blanket warnings—it precisely isolates impacted consumers while leaving compatible consumers green.

---

## 7. Practical Engineering Reusability
Any development team can adapt SchemaShield to protect Kafka event schemas, REST webhooks, GraphQL federated graphs, or S3 data lake ingest pipelines.

---

## 8. Conclusion
SchemaShield brings software engineering rigor and automated contract firewalls to data pipelines—100% serverless, zero idle maintenance, and deployed with **No Pipeline, No Problem**.
