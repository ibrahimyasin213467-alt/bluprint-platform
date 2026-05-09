import { RefObject } from "react";

interface TokenFormProps {
  tokenName: string;
  setTokenName: (val: string) => void;
  tokenSymbol: string;
  setTokenSymbol: (val: string) => void;
  tokenSupply: number;
  setTokenSupply: (val: number) => void;
  tokenDecimals: number;
  setTokenDecimals: (val: number) => void;
  previewImage: string | null;
  description: string;
  setDescription: (val: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  secureToken: boolean;
  setSecureToken: (val: boolean) => void;
}

export default function TokenForm({
  tokenName,
  setTokenName,
  tokenSymbol,
  setTokenSymbol,
  tokenSupply,
  setTokenSupply,
  tokenDecimals,
  setTokenDecimals,
  previewImage,
  description,
  setDescription,
  handleFileUpload,
  fileInputRef,
  secureToken,
  setSecureToken,
}: TokenFormProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">🏷️ Token Name</label>
          <input
            type="text"
            placeholder="e.g., BluPrint Coin"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">🔤 Symbol</label>
          <input
            type="text"
            placeholder="e.g., BLUEP"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
            className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">📊 Total Supply</label>
        <input
          type="number"
          placeholder="1,000,000,000"
          value={tokenSupply}
          onChange={(e) => setTokenSupply(Number(e.target.value))}
          className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">🔢 Decimals (0-9)</label>
        <input
          type="number"
          placeholder="6"
          value={tokenDecimals}
          onChange={(e) => setTokenDecimals(Number(e.target.value))}
          className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* LOGO ALANI */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">🖼️ Logo</label>
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 transition bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewImage ? (
            <img src={previewImage} alt="Preview" className="w-16 h-16 mx-auto rounded-xl object-cover" />
          ) : (
            <div className="text-gray-400">📸 Click to upload (PNG/JPG)</div>
          )}
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">📝 Description</label>
        <textarea
          rows={3}
          placeholder="Describe your token"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* SECURE TOKEN OPTION */}
      <div className="pt-2">
        <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200">
          <div className="flex items-center h-6">
            <input
              type="checkbox"
              id="secureToken"
              checked={secureToken}
              onChange={(e) => setSecureToken(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <label htmlFor="secureToken" className="text-base font-medium text-gray-900 cursor-pointer">
                🔒 Secure Token
              </label>
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                Recommended
              </span>
              <div className="group relative inline-block">
                <span className="cursor-help text-gray-400 text-sm ml-1">ⓘ</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap z-10">
                  Helps make your token safer and more trustworthy
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Revoke mint, freeze, and update authorities to improve trust and safety.
            </p>
            <div className="text-xs font-medium text-blue-600 mt-1">+0.1 SOL</div>
          </div>
        </div>
      </div>
    </div>
  );
}