interface CreateButtonProps {
  loading: boolean;
  isProcessing: boolean;
  publicKey: any;
  onCreate: () => void;
  status?: string;
  retryCount: number;
  secureToken: boolean;
}

export default function CreateButton({
  loading,
  isProcessing,
  publicKey,
  onCreate,
  status,
  retryCount,
  secureToken,
}: CreateButtonProps) {
  const baseFee = 0.25;
  const totalFee = secureToken ? baseFee + 0.1 : baseFee;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-28">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">⚡</div>
        <div className="text-2xl font-bold text-gray-900">Launch Token</div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Base fee</span>
            <span className="font-medium text-gray-900">0.25 SOL</span>
          </div>
          {secureToken && (
            <div className="flex justify-between items-center text-blue-600">
              <span>➕ Secure Token</span>
              <span>+0.10 SOL</span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2 mt-2">
            <div className="flex justify-between items-center font-semibold">
              <span>Total fee</span>
              <span className="text-lg text-blue-600">{totalFee.toFixed(2)} SOL</span>
            </div>
          </div>
          {secureToken && (
            <div className="text-xs text-blue-600 bg-blue-50 rounded-xl px-3 py-2 mt-3">
              ✅ Secure Token enabled: authorities will be revoked
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onCreate}
        disabled={loading || isProcessing || !publicKey}
        className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 text-lg"
      >
        {loading || isProcessing ? "⏳ DEPLOYING..." : "🚀 CREATE TOKEN"}
      </button>

      {status && (
        <div className="text-sm text-center text-gray-500 mt-4 bg-gray-50 py-2 rounded-xl">{status}</div>
      )}

      {retryCount > 0 && status?.includes("Hata") && (
        <button onClick={onCreate} className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-xl hover:bg-gray-200 transition">
          🔄 Tekrar Dene
        </button>
      )}
    </div>
  );
}