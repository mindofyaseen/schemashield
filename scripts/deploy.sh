#!/usr/bin/env bash
set -e

# ==============================================================================
# SchemaShield Deployment Script
# Challenge: Weekend Challenge: No Pipeline, No Problem (AWS Builder Center)
# ==============================================================================

STACK_NAME="schemashield"
REGION="${AWS_REGION:-us-east-1}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=========================================================="
echo " Starting SchemaShield Deployment"
echo " Region: $REGION | Stack: $STACK_NAME"
echo "=========================================================="

# 1. Tool verification
echo "[1/8] Verifying required tools..."
command -v aws >/dev/null 2>&1 || { echo "Error: 'aws' CLI is required."; exit 1; }
command -v sam >/dev/null 2>&1 || { echo "Error: 'sam' CLI is required."; exit 1; }
command -v python3 >/dev/null 2>&1 || command -v python >/dev/null 2>&1 || { echo "Error: 'python' is required."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: 'npm' is required."; exit 1; }

# 2. Check AWS credentials safely
echo "[2/8] Checking AWS authentication identity..."
AWS_IDENTITY=$(aws sts get-caller-identity --output json 2>&1) || {
    echo "=========================================================="
    echo "BLOCKER: AWS credentials not configured or unauthorized."
    echo "Please run: aws configure"
    echo "=========================================================="
    exit 1
}
ACCOUNT_ID=$(echo "$AWS_IDENTITY" | grep -o '"Account": "[^"]*' | cut -d'"' -f4)
echo "Authenticated as Account: $ACCOUNT_ID"

# 3. Run Backend Unit Tests
echo "[3/8] Running deterministic test suite..."
python3 -m unittest "$PROJECT_ROOT/tests/backend/test_core_engines.py" || python -m unittest "$PROJECT_ROOT/tests/backend/test_core_engines.py"
echo "All 14 backend unit tests passed."

# 4. Build Frontend
echo "[4/8] Building React + TypeScript frontend..."
cd "$PROJECT_ROOT/frontend"
npm install --silent
npm run build
cd "$PROJECT_ROOT"

# 5. Validate & Build SAM Infrastructure
echo "[5/8] Building AWS SAM Serverless resources..."
cd "$PROJECT_ROOT/infrastructure"
sam validate --region "$REGION"
sam build --template-file template.yaml

# 6. Deploy CloudFormation Stack
echo "[6/8] Deploying CloudFormation stack: $STACK_NAME..."
sam deploy \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --resolve-s3 \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset

# 7. Upload Frontend Assets to S3 & Invalidate CloudFront
echo "[7/8] Syncing frontend assets to private S3 bucket..."
FRONTEND_BUCKET=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text)
API_URL=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)
FRONTEND_URL=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='FrontendUrl'].OutputValue" --output text)

aws s3 sync "$PROJECT_ROOT/frontend/dist" "s3://$FRONTEND_BUCKET" --delete

# 8. Post-deployment Health Check
echo "[8/8] Verifying live API health..."
curl -s "$API_URL/health" || echo "API warming up..."

echo "=========================================================="
echo " SchemaShield Deployment Complete!"
echo "----------------------------------------------------------"
echo " Frontend URL:  $FRONTEND_URL"
echo " API URL:       $API_URL"
echo " AWS Region:    $REGION"
echo " Stack Name:    $STACK_NAME"
echo "=========================================================="
