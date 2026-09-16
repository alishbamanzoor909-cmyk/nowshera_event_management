import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Server,
  Database,
  Activity,
  CheckCircle2,
  AlertCircle,
  Download,
  RotateCcw,
  Play,
  Loader2,
  HardDrive,
  Radio,
  Cpu,
  ShieldCheck,
  Code
} from 'lucide-react';

interface BackendStatusData {
  status: string;
  server: {
    engine: string;
    port: number;
    uptimeSeconds: number;
    memoryHeapUsedMb: number;
  };
  database: {
    storageType: string;
    filePath: string;
    fileSizeBytes: number;
    counts: {
      users: number;
      events: number;
      registrations: number;
      activeSessions: number;
    };
  };
  endpoints: {
    method: string;
    path: string;
    access: string;
    desc: string;
  }[];
}

export const BackendConsole: React.FC = () => {
  const [statusData, setStatusData] = useState<BackendStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ latencyMs: number; timestamp: string } | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // Test suite states
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<{
    allPassed: boolean;
    results: {
      testNumber: number;
      name: string;
      description: string;
      passed: boolean;
      details: string;
    }[];
  } | null>(null);

  const fetchStatus = async () => {
    try {
      setError(null);
      const data = await api.getBackendStatus();
      setStatusData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handlePing = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await api.checkHealth();
      const end = performance.now();
      setPingResult({
        latencyMs: Math.round(end - start),
        timestamp: res.timestamp,
      });
    } catch (err: any) {
      setError(err.message || 'Ping failed');
    } finally {
      setIsPinging(false);
    }
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await api.runPrdTestRunner();
      setTestResults(res);
    } catch (err: any) {
      setError(err.message || 'Test runner failed');
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleExportDatabase = () => {
    window.open('/api/admin/database/export', '_blank');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400 mx-auto mb-3" />
        <p className="text-sm text-stone-500 font-medium">Connecting to Express Backend Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-stone-900">Express REST Backend &amp; Database</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live &amp; Online
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Full-stack Node.js + Express service listening on port 3000 with file persistence.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePing}
              disabled={isPinging}
              className="px-3.5 py-2 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition-colors flex items-center gap-1.5"
            >
              {isPinging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5 text-amber-600" />}
              <span>Ping Server</span>
            </button>
            <button
              onClick={handleExportDatabase}
              className="px-3.5 py-2 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Export DB JSON</span>
            </button>
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-3.5 py-2 text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition-colors flex items-center gap-1.5"
            >
              {isRunningTests ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>Run Automated Tests</span>
            </button>
          </div>
        </div>

        {/* Live Ping Output */}
        {pingResult && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>HTTP 200 OK:</strong> Ping successful in <strong>{pingResult.latencyMs} ms</strong>
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-mono">{pingResult.timestamp}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Server Runtime</span>
            <Cpu className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-stone-900 truncate">
            {statusData?.server.engine || 'Express.js'}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Port {statusData?.server.port || 3000} • Uptime {statusData?.server.uptimeSeconds || 0}s
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Database Storage</span>
            <HardDrive className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-stone-900">
            {statusData?.database.storageType || 'File JSON'}
          </div>
          <div className="text-xs text-stone-500 mt-1 font-mono">
            {statusData?.database.filePath} ({Math.round((statusData?.database.fileSizeBytes || 0) / 1024)} KB)
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Database Records</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-stone-900">
            {statusData?.database.counts.events || 0} Events • {statusData?.database.counts.registrations || 0} Bookings
          </div>
          <div className="text-xs text-stone-500 mt-1">
            {statusData?.database.counts.users || 0} Registered Users
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Security Layer</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-stone-900">
            Bearer Token Auth
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Role-Based Access Control (RBAC)
          </div>
        </div>
      </div>

      {/* Automated Tests View if Run */}
      {testResults && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-stone-900">
                Automated Backend Verification Suite (10 Requirements)
              </h3>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                testResults.allPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {testResults.allPassed ? '10 / 10 Tests Passed' : 'Failures Detected'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testResults.results.map((t) => (
              <div
                key={t.testNumber}
                className="p-3.5 rounded-2xl border border-stone-100 bg-stone-50/70 flex items-start gap-2.5 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-stone-900">
                    Test {t.testNumber}: {t.name}
                  </div>
                  <div className="text-stone-500 text-[11px] mt-0.5">{t.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REST API Endpoints Directory */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-stone-900">Registered Backend REST API Endpoints</h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            The Express backend serves these API routes directly to handle client operations.
          </p>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {statusData?.endpoints.map((ep, idx) => (
            <div key={idx} className="p-3.5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                    ep.method === 'GET'
                      ? 'bg-blue-100 text-blue-800'
                      : ep.method === 'POST'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ep.method === 'PUT'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono font-medium text-stone-900">{ep.path}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-stone-500 text-[11px]">{ep.desc}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    ep.access === 'Admin only'
                      ? 'bg-purple-100 text-purple-800'
                      : ep.access === 'Attendee'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {ep.access}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
