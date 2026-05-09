interface StatsPanelProps {
  tokensCreated: number;
  liveUsers: number;
  successRate: number;
}

export default function StatsPanel({ tokensCreated, liveUsers, successRate }: StatsPanelProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">{tokensCreated.toLocaleString()}</div>
        <div className="text-sm text-gray-500">🚀 Tokens Created</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">{liveUsers}</div>
        <div className="text-sm text-gray-500">👥 Live Users</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-green-600">{successRate}%</div>
        <div className="text-sm text-gray-500">⚡ Success Rate</div>
      </div>
    </div>
  );
}