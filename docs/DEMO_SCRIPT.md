# SchemaShield 3-Minute Video Demonstration Script

> **Challenge:** Weekend Challenge: No Pipeline, No Problem (AWS Builder Center)  
> **Target Video Length:** Under 3 minutes (02:50 total runtime)

---

## Video Recording Checklist

- [ ] Browser opened to SchemaShield CloudFront URL.
- [ ] AWS Console tab ready on AWS Step Functions (State Machines).
- [ ] Clean browser window (1080p or 1440p resolution, 100% zoom).
- [ ] Screen recording software (OBS Studio / Loom) active with mic tested.

---

## Demonstration Script & Visual Timeline

### [0:00 – 0:25] The Problem: Silent Schema Outages
* **Visual:** Speaker on camera or title slide with broken downstream pipeline diagram.
* **Narration:**
  > "In microservice architectures, innocent schema changes silently break production. Imagine an e-commerce Orders Service team renaming `customer_id` to `buyer_id` or formatting `total` as a string. Upstream tests pass, but downstream, the Billing Service fails, financial analytics corrupts, and customer notifications halt.
  > Today, we present **SchemaShield: The Serverless Data Contract Firewall**."

---

### [0:25 – 0:50] Introducing SchemaShield & Active Contract
* **Visual:** SchemaShield Dashboard. Click **Load Interactive Demo**.
* **Narration:**
  > "SchemaShield evaluates proposed schema changes *before* they reach production. With one click on our Interactive Demo, we load our active **Order Events** contract in DynamoDB and S3.
  > Notice our active contract: `order_id`, `customer_id`, numeric `total`, `currency` (USD and PKR), `created_at`, and `customer_email`."

---

### [0:50 – 1:15] Inspecting Downstream Consumer Contracts
* **Visual:** Open **Order Events** contract details. Point to the three registered consumers.
* **Narration:**
  > "Three distinct downstream consumers depend on this contract:
  > 1. **Billing Service**, which requires `customer_id` and numeric `total`.
  > 2. **Analytics Warehouse**, which requires `customer_id`, numeric `total`, and timestamp.
  > 3. **Customer Notification Service**, which only depends on `order_id` and `customer_email`."

---

### [1:15 – 1:45] Simulating a Breaking Schema Change
* **Visual:** Click **Load Breaking Scenario** in the editor.
* **Narration:**
  > "Now, let's simulate a dangerous real-world schema proposal:
  > A developer renames `customer_id` to `buyer_id`, turns `total` into a string, and narrows currency enum to USD only.
  > Let's hit **Run Contract Firewall Analysis**."

---

### [1:45 – 2:20] The Analysis: Blast Radius & Release Verdict
* **Visual:** Analysis Report View: Red **BLOCK RELEASE** badge, Risk Score **85/100**, and the interactive **Blast Radius Graph**.
* **Narration:**
  > "Instantly, SchemaShield flags **BLOCK RELEASE** with an 85/100 Critical Risk score.
  > Look at our interactive topology:
  > SchemaShield did **not** blindly flag every consumer. It pinpointed that **Billing Service** and **Analytics Warehouse** are broken due to the missing `customer_id` and string total.
  > Meanwhile, **Customer Notification Service** correctly remains **COMPATIBLE** green because its fields are intact!
  > Below, engineers get exact migration steps: maintain `customer_id` alias and preserve numeric type."

---

### [2:20 – 2:40] Under the Hood: AWS Serverless Orchestration
* **Visual:** Switch to AWS Console tab showing Step Functions Execution graph (Map state in parallel).
* **Narration:**
  > "Under the hood, this is 100% serverless:
  > Amazon API Gateway hands the proposal to AWS Step Functions. A parallel **Map State** validates all downstream consumers concurrently in Lambda. Results and immutable reports are persisted directly to DynamoDB and Amazon S3. No EC2, no containers, scale to zero."

---

### [2:40 – 2:55] Conclusion: No Pipeline, No Problem
* **Visual:** Return to SchemaShield dashboard overview showing historical record.
* **Narration:**
  > "Built for the AWS Weekend Challenge, SchemaShield requires no external CI/CD pipelines—deployed cleanly with AWS SAM.
  > Catch breaking data contracts before they break production. Thank you!"

---

## Post-Recording Submission Steps

1. Upload recorded video to YouTube (set as **Unlisted** or **Public**) or Loom.
2. Paste the video link in `submission/BUILDER_CENTER_SUBMISSION.md`.
3. Submit the post on AWS Builder Center!
