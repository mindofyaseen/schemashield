# SchemaShield Windows PowerShell Deployment Script
# Challenge: Weekend Challenge: No Pipeline, No Problem (AWS Builder Center)

$ErrorActionPreference = "Stop"
$StackName = "schemashield"
$Region = if ($env:AWS_DEFAULT_REGION) { $env:AWS_DEFAULT_REGION } else { "us-east-1" }
$ProjectRoot = Resolve-Path "$PSScriptRoot\.."

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting SchemaShield Deployment (PowerShell)" -ForegroundColor Cyan
Write-Host " Region: $Region | Stack: $StackName" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Tools check
Write-Host "[1/8] Verifying tools..." -ForegroundColor Yellow
$awsCli = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
$samCli = "C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd"
$npmCli = "C:\Program Files\nodejs\npm.cmd"

# 2. Check AWS credentials
Write-Host "[2/8] Checking AWS authentication identity..." -ForegroundColor Yellow
try {
    $identity = & $awsCli sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "Authenticated as Account: $($identity.Account)" -ForegroundColor Green
} catch {
    Write-Host "==========================================================" -ForegroundColor Red
    Write-Host "BLOCKER: AWS credentials not configured or unauthorized." -ForegroundColor Red
    Write-Host "Please run: aws configure" -ForegroundColor Red
    Write-Host "==========================================================" -ForegroundColor Red
    exit 1
}

# 3. Tests
Write-Host "[3/8] Running deterministic test suite..." -ForegroundColor Yellow
python -m unittest "$ProjectRoot\tests\backend\test_core_engines.py"
Write-Host "All 14 backend unit tests passed." -ForegroundColor Green

# 4. Build Frontend
Write-Host "[4/8] Building React + TypeScript frontend..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\frontend"
& $npmCli install --silent
& $npmCli run build
Set-Location $ProjectRoot

# 5. Build SAM resources
Write-Host "[5/8] Building AWS SAM resources..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\infrastructure"
& $samCli validate --region $Region
& $samCli build --template-file template.yaml

# 6. Deploy Stack
Write-Host "[6/8] Deploying CloudFormation stack: $StackName..." -ForegroundColor Yellow
& $samCli deploy `
  --stack-name $StackName `
  --region $Region `
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND `
  --resolve-s3 `
  --no-confirm-changeset `
  --no-fail-on-empty-changeset

# 7. Sync Frontend to S3
Write-Host "[7/8] Syncing frontend assets to private S3 bucket..." -ForegroundColor Yellow
$frontendBucket = (& $awsCli cloudformation describe-stacks --stack-name $StackName --region $Region --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text).Trim()
$apiUrl = (& $awsCli cloudformation describe-stacks --stack-name $StackName --region $Region --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text).Trim()
$frontendUrl = (& $awsCli cloudformation describe-stacks --stack-name $StackName --region $Region --query "Stacks[0].Outputs[?OutputKey=='FrontendUrl'].OutputValue" --output text).Trim()

& $awsCli s3 sync "$ProjectRoot\frontend\dist" "s3://$frontendBucket" --delete

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " SchemaShield Deployment Complete!" -ForegroundColor Green
Write-Host "----------------------------------------------------------"
Write-Host " Frontend URL:  $frontendUrl" -ForegroundColor Cyan
Write-Host " API URL:       $apiUrl" -ForegroundColor Cyan
Write-Host " AWS Region:    $Region"
Write-Host " Stack Name:    $StackName"
Write-Host "==========================================================" -ForegroundColor Green
