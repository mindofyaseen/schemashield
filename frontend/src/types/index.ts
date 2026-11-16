export interface DataContract {
  contractId: string;
  name: string;
  description: string;
  domain: string;
  currentVersion: string;
  schemaS3Key?: string;
  createdAt: string;
  updatedAt: string;
  consumerCount?: number;
  schema?: Record<string, any>;
}

export interface DownstreamConsumer {
  contractId: string;
  consumerId: string;
  name: string;
  type: string;
  expectedSchemaS3Key?: string;
  expected_schema?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SchemaFinding {
  id: string;
  path: string;
  change_type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'BREAKING' | 'RISKY' | 'SAFE';
  message: string;
  old_value: any;
  new_value: any;
  suggested_action: string;
}

export interface ConsumerResult {
  consumer_id: string;
  consumer_name: string;
  consumer_type: string;
  status: 'COMPATIBLE' | 'WARNING' | 'BREAKING';
  affected_fields: string[];
  issues: Array<{
    field_path: string;
    severity: string;
    issue_type: string;
    message: string;
    fix: string;
  }>;
  explanation: string;
  recommended_fix: string;
}

export interface AnalysisReport {
  analysis_id: string;
  contract_id: string;
  contract_name: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  created_at?: string;
  completed_at?: string;
  risk_score: number;
  risk_level: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL RISK';
  release_verdict: 'SAFE TO RELEASE' | 'REVIEW REQUIRED' | 'BLOCK RELEASE';
  summary_explanation: string;
  severity_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  blast_radius_percentage: number;
  total_findings: number;
  total_consumers: number;
  breaking_consumers: number;
  warning_consumers: number;
  compatible_consumers: number;
  schema_findings: SchemaFinding[];
  consumer_results: ConsumerResult[];
  recommended_actions: string[];
}

export interface AnalysisRecord {
  analysisId: string;
  contractId: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  riskScore?: number;
  verdict?: 'SAFE TO RELEASE' | 'REVIEW REQUIRED' | 'BLOCK RELEASE';
  findingsSummary?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  affectedConsumers?: number;
  executionArn?: string;
  reportS3Key?: string;
  createdAt: string;
  completedAt?: string;
}
