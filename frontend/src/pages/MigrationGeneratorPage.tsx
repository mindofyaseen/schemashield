import React, { useState } from 'react';
import { Wrench, Copy, Check, Code2, Database, Sparkles, FileCode, CheckCircle2 } from 'lucide-react';

export const MigrationGeneratorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sql' | 'pyspark' | 'typescript' | 'glue'>('sql');
  const [copied, setCopied] = useState(false);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sqlCode = `-- ====================================================================
-- SchemaShield Automated Migration Shim (SQL / dbt / Snowflake / Trino)
-- Contract: Order Events (v1.0.0 -> v1.1.0-candidate)
-- Problem: 'customer_id' was renamed to 'buyer_id', 'total' became string.
-- Solution: Backward-compatible projection maintaining legacy consumer contracts.
-- ====================================================================

CREATE OR REPLACE VIEW gold_order_events_compatible AS
SELECT
    order_id,
    -- Backward-compatible shim for Billing & Analytics consumers:
    COALESCE(buyer_id, customer_id) AS customer_id,
    buyer_id,
    
    -- Type-safe numeric cast preventing financial calculation failures:
    TRY_CAST(total AS DOUBLE) AS total,
    
    currency,
    created_at,
    customer_email,
    discount_code,
    
    -- Metadata audit trail
    CURRENT_TIMESTAMP() AS _schemashield_validated_at
FROM raw_stream_order_events;`;

  const pysparkCode = `# ====================================================================
# SchemaShield Automated Migration Shim (Python / PySpark / Databricks)
# Contract: Order Events (Preserves Billing & Analytics contracts)
# ====================================================================

from pyspark.sql import functions as F
from pyspark.sql.types import DoubleType, StringType

def apply_schemashield_compatibility_shim(df):
    """
    Transforms proposed schema drift into backward-compatible contract format
    before publishing to downstream consumer queues (Kafka / EventBridge).
    """
    compatible_df = df \\
        .withColumn(
            "customer_id",
            F.coalesce(F.col("buyer_id"), F.col("customer_id"))
        ) \\
        .withColumn(
            "total",
            F.col("total").cast(DoubleType())
        )
    return compatible_df`;

  const typescriptCode = `// ====================================================================
// SchemaShield TypeScript / Node.js Microservice Adapter Shim
// Protects downstream Consumers from Producer Schema Evolution
// ====================================================================

export interface LegacyOrderEvent {
  order_id: string;
  customer_id: string;
  total: number;
  currency: string;
  created_at: string;
  customer_email: string;
}

export function transformToBackwardCompatible(payload: any): LegacyOrderEvent {
  return {
    order_id: String(payload.order_id),
    // Backward-compatible field resolution
    customer_id: String(payload.buyer_id || payload.customer_id || ''),
    // Ensure numeric total type
    total: typeof payload.total === 'number' ? payload.total : parseFloat(payload.total) || 0,
    currency: payload.currency || 'USD',
    created_at: payload.created_at,
    customer_email: payload.customer_email || ''
  };
}`;

  const glueCode = `# ====================================================================
# SchemaShield AWS Glue ETL Serverless Schema Repair Job
# Runs automatically in AWS to reconcile partitioned S3 data lakes
# ====================================================================

import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql import functions as F

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session

# Read from raw S3 proposal bucket
dynamic_frame = glueContext.create_dynamic_frame.from_catalog(
    database="schemashield_catalog",
    table_name="order_events"
)

df = dynamic_frame.toDF()

# Apply SchemaShield Shim:
repaired_df = df.withColumn(
    "customer_id",
    F.coalesce(F.col("buyer_id"), F.col("customer_id"))
).withColumn(
    "total",
    F.col("total").cast("double")
)

# Output clean data lake parquet to production storage
repaired_df.write.mode("append").parquet("s3://schemashield-storage/clean/order_events/")`;

  const getCode = () => {
    switch (activeTab) {
      case 'sql':
        return sqlCode;
      case 'pyspark':
        return pysparkCode;
      case 'typescript':
        return typescriptCode;
      case 'glue':
        return glueCode;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
          <Wrench className="w-3.5 h-3.5" />
          <span>Automated Engineering Remediation</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Automated Schema Migration & Backward-Compatibility Shims
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          SchemaShield does not just block breaking releases—it automatically synthesizes ready-to-deploy compatibility code shims across SQL, PySpark, TypeScript, and AWS Glue so engineers can resolve drift in minutes.
        </p>
      </div>

      {/* Code Studio Box */}
      <div className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Language Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'sql' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              SQL / dbt View
            </button>
            <button
              onClick={() => setActiveTab('pyspark')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'pyspark' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              Python / PySpark
            </button>
            <button
              onClick={() => setActiveTab('typescript')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'typescript' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              TypeScript Adapter
            </button>
            <button
              onClick={() => setActiveTab('glue')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'glue' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              AWS Glue ETL
            </button>
          </div>

          <button
            onClick={() => copyCode(getCode())}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 self-start sm:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Shim Code'}</span>
          </button>
        </div>

        {/* Code Block */}
        <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed">
          {getCode()}
        </pre>
      </div>

      {/* Feature Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs mb-3">
            01
          </span>
          <h4 className="font-bold text-slate-900 text-sm mb-1">Zero Downtime Migration</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Deploy the generated SQL or PySpark view to bridge legacy consumers while the producer service transitions to v2 schemas.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mb-3">
            02
          </span>
          <h4 className="font-bold text-slate-900 text-sm mb-1">Guaranteed Backward Compatibility</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Preserves numeric constraints and aliased identifiers so Billing and Analytics pipelines never encounter unexpected nulls.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs mb-3">
            03
          </span>
          <h4 className="font-bold text-slate-900 text-sm mb-1">AWS Serverless Native</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Drop the generated AWS Glue script straight into your AWS account for automatic schema self-healing on S3 data lakes.
          </p>
        </div>
      </div>
    </div>
  );
};
