"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useSearchParams } from "next/navigation";
import {
  Connection, Keypair, SystemProgram, Transaction,
  LAMPORTS_PER_SOL, PublicKey, TransactionInstruction,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE, TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
} from "@solana/spl-token";
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import SuccessModal from "../components/SuccessModal";
import { useToast } from "../components/ToastProvider";
import { useI18n } from "../lib/i18n-provider";

// ==================== CONFIG ====================
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://solana-mainnet.g.alchemy.com/v2/HOfnwF22z5T8BCHNl_KIo";
const PLATFORM_WALLET = "FPLcpDVhRTMTMGquiyeK3AwNtCaQQgNp6UwHPTcWDS2n";
const OWNER_WALLET    = "aJCqEsDgSXhkLUYAnq4tA2T3LfG7rMbfcdJapf9af9x";
const KUZEN_WALLET    = "2WyCLgg2vuvzmExak8WAeF9kBfvfcD4ahcKfm9P18gSc";
const BASE_FEE        = 0.15 * LAMPORTS_PER_SOL;
const REFERRAL_FEE    = 0.10 * LAMPORTS_PER_SOL;
const REFERRAL_REWARD = 0.05 * LAMPORTS_PER_SOL;

// Metaplex metadata instruction'ı — UMI kullanmadan, direkt web3.js ile
function buildMetadataInstruction(
  mint: PublicKey,
  mintAuthority: PublicKey,
  payer: PublicKey,
  name: string,
  symbol: string,
  uri: string,
  isMutable: boolean,
): TransactionInstruction {
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METADATA_PROGRAM_ID,
  );

  return createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint,
      mintAuthority,
      payer,
      updateAuthority: mintAuthority,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name,
          symbol,
          uri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable,
        collectionDetails: null,
      },
    },
  );
}

export default function CreatePageContent() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { t } = useI18n();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [successData, setSuccessData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [time, setTime] = useState(0);
  const [mintAddress, setMintAddress] = useState("");
  const [tokensLeft, setTokensLeft] = useState(100);
  const [myPromoCode, setMyPromoCode] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [referrerWallet, setReferrerWallet] = useState<string | null>(null);

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState(1_000_000_000);
  const [tokenDecimals, setTokenDecimals] = useState(9);
  const [tokenImage, setTokenImage] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [revokeMint, setRevokeMint] = useState(false);
  const [revokeFreeze, setRevokeFreeze] = useState(false);
  const [revokeUpdate, setRevokeUpdate] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const secureToken = revokeMint || revokeFreeze || revokeUpdate;
  const urlReferrer = searchParams.get("ref");
  const hasReferral = !!(referrerWallet || (urlReferrer && urlReferrer !== publicKey?.toString()));
  const feeSOL = hasReferral ? REFERRAL_FEE / LAMPORTS_PER_SOL : BASE_FEE / LAMPORTS_PER_SOL;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetch("/api/token-stats")
      .then((r) => r.json())
      .then((d) => { if (d.success) setTokensLeft(d.tokensLeft); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!publicKey) return;
    fetch(`/api/promo?wallet=${publicKey.toString()}`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.promoCode) setMyPromoCode(d.promoCode); })
      .catch(() => {});
  }, [publicKey]);

  useEffect(() => {
    if (promoCodeInput.length !== 7) { setReferrerWallet(null); return; }
    fetch(`/api/promo?code=${promoCodeInput}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.wallet && d.wallet !== publicKey?.toString()) {
          setReferrerWallet(d.wallet);
          showToast("Promo code applied! 0.05 SOL discount!", "success");
        } else {
          setReferrerWallet(null);
        }
      })
      .catch(() => setReferrerWallet(null));
  }, [promoCodeInput]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast(t("toast_uploading"), "info");
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setTokenImage(data.url);
        setPreviewImage(URL.createObjectURL(file));
        showToast(t("toast_upload_success"), "success");
      } else {
        showToast(`❌ ${data.error}`, "error");
      }
    } catch (err: any) {
      showToast(`❌ ${err.message}`, "error");
    }
  };

  const uploadMetadata = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/upload-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tokenName,
          symbol: tokenSymbol.toUpperCase(),
          description: description || "Launched on BluPrint Platform",
          image: tokenImage || "https://gateway.pinata.cloud/ipfs/QmaZYRoR1eBSqESX4Fo5NR28CZPNig9YuZfJsBzmG7KPe3",
          external_url: website || "https://bluprint.fun",
          twitter, telegram,
        }),
      });
      const data = await res.json();
      return data.uri || null;
    } catch {
      return null;
    }
  };

  const validateInputs = useCallback(() => {
    if (tokenName.length < 3 || tokenName.length > 32) return "Token name must be 3-32 characters";
    if (tokenSymbol.length < 2 || tokenSymbol.length > 8) return "Symbol must be 2-8 characters";
    if (!/^[A-Z0-9]+$/i.test(tokenSymbol)) return "Symbol can only contain letters and numbers";
    if (tokenSupply < 1000 || tokenSupply > 10_000_000_000) return "Supply must be 1,000 – 10,000,000,000";
    if (tokenDecimals < 0 || tokenDecimals > 9) return "Decimals must be 0-9";
    return null;
  }, [tokenName, tokenSymbol, tokenSupply, tokenDecimals]);

  const createToken = async () => {
    if (isProcessing || loading) return;
    if (!publicKey) { setVisible(true); return; }

    const err = validateInputs();
    if (err) { showToast(`❌ ${err}`, "error"); return; }

    const lastCreate = localStorage.getItem("bluprint_last_create");
    if (lastCreate && Date.now() - parseInt(lastCreate) < 60_000) {
      const remaining = Math.ceil((60_000 - (Date.now() - parseInt(lastCreate))) / 1000);
      showToast(`Please wait ${remaining}s before creating another token`, "error");
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    setProgress(0);
    setStep("🚀 Initializing...");
    setStatus("");
    const start = Date.now();

    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return 88;
        return Math.min(88, Math.floor(((Date.now() - start) / 12_000) * 100));
      });
    }, 200);

    try {
      const connection = new Connection(RPC_URL, "confirmed");

      // Referral
      const finalReferrer =
        referrerWallet && referrerWallet !== publicKey.toString() ? referrerWallet :
        urlReferrer && urlReferrer.length === 44 && urlReferrer !== publicKey.toString() ? urlReferrer :
        null;
      const feeAmount   = finalReferrer ? REFERRAL_FEE : BASE_FEE;
      const platformShare = Math.floor(feeAmount * 0.10);
      const yourShare     = Math.floor(feeAmount * 0.58);
      const kuzenShare    = feeAmount - platformShare - yourShare;

      // IPFS metadata (sunucu tarafında)
      setStep("📤 Uploading metadata...");
      const metadataUri = await uploadMetadata();

      // Mint keypair
      const mintKeypair = Keypair.generate();
      const lamports    = await getMinimumBalanceForRentExemptMint(connection);
      const ata         = await getAssociatedTokenAddress(mintKeypair.publicKey, publicKey);
      const supplyBigInt = BigInt(tokenSupply) * BigInt(10) ** BigInt(tokenDecimals);

      setStep("📦 Building transaction...");
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

      const tx = new Transaction();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      // Mint account oluştur
      tx.add(SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }));

      // Mint initialize
      tx.add(createInitializeMintInstruction(
        mintKeypair.publicKey, tokenDecimals, publicKey,
        secureToken ? publicKey : null,
      ));

      // Platform fee
      tx.add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(PLATFORM_WALLET), lamports: platformShare }));
      tx.add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(OWNER_WALLET),    lamports: yourShare }));
      tx.add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(KUZEN_WALLET),    lamports: kuzenShare }));

      // Token hesabı + mint
      tx.add(createAssociatedTokenAccountInstruction(publicKey, ata, publicKey, mintKeypair.publicKey));
      tx.add(createMintToInstruction(mintKeypair.publicKey, ata, publicKey, supplyBigInt));

      // Referral
      if (finalReferrer) {
        tx.add(SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(finalReferrer),
          lamports: REFERRAL_REWARD,
        }));
      }

      // Revoke: Mint ve Freeze
      if (revokeMint)   tx.add(createSetAuthorityInstruction(mintKeypair.publicKey, publicKey, AuthorityType.MintTokens,    null));
      if (revokeFreeze) tx.add(createSetAuthorityInstruction(mintKeypair.publicKey, publicKey, AuthorityType.FreezeAccount, null));

      // Metadata (direkt instruction — versioned transaction sorunu yok)
      if (metadataUri) {
        tx.add(buildMetadataInstruction(
          mintKeypair.publicKey,
          publicKey, // mintAuthority = kullanıcı cüzdanı
          publicKey,
          tokenName,
          tokenSymbol.toUpperCase(),
          metadataUri,
          !revokeUpdate, // revokeUpdate seçildiyse isMutable=false
        ));
      }

      // mintKeypair imzalar (yeni mint account için)
      tx.partialSign(mintKeypair);

      setStep("📝 Sign in your wallet...");
      setProgress(90);

      const signature = await sendTransaction(tx, connection, {
        skipPreflight: false,
        maxRetries: 2,
      });

      setStep("⏳ Confirming...");
      setProgress(95);

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed",
      );

      clearInterval(progressInterval.current!);
      setProgress(100);
      setStep("✅ Done!");

      const newMint = mintKeypair.publicKey.toBase58();
      setTime((Date.now() - start) / 1000);
      setMintAddress(newMint);
      setSuccessData({
        mint: newMint,
        name: tokenName,
        symbol: tokenSymbol,
        supply: tokenSupply,
        decimals: tokenDecimals,
        secureToken,
        revokeMint, revokeFreeze, revokeUpdate,
        referralApplied: !!finalReferrer,
        referrer: finalReferrer,
        feePaid: feeAmount / LAMPORTS_PER_SOL,
        twitter, telegram, website,
      });
      setStatus("");
      showToast(t("toast_created"), "success");
      setTokensLeft((p) => p - 1);
      localStorage.setItem("bluprint_last_create", Date.now().toString());

      // Redis kaydet
      fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mint: newMint, name: tokenName, symbol: tokenSymbol,
          createdBy: publicKey.toString(),
          createdAt: new Date().toISOString(),
          image: tokenImage, twitter, telegram, website,
        }),
      }).catch(console.error);

      // Referral kaydı
      if (finalReferrer) {
        fetch("/api/referral-earnings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referrer: finalReferrer,
            referred: publicKey.toString(),
            amount: REFERRAL_REWARD / LAMPORTS_PER_SOL,
          }),
        }).catch(console.error);
      }

      // Promo kodu yenile
      fetch(`/api/promo?wallet=${publicKey.toString()}`)
        .then((r) => r.json())
        .then((d) => { if (d.success && d.promoCode) setMyPromoCode(d.promoCode); })
        .catch(() => {});

    } catch (err: any) {
      clearInterval(progressInterval.current!);
      let msg = err.message || "Unknown error";
      if (msg.includes("insufficient")) msg = "Insufficient SOL. Need at least 0.15 SOL.";
      else if (msg.includes("User rejected") || msg.includes("rejected")) msg = "Transaction rejected.";
      setStatus(`❌ ${msg}`);
      setProgress(0);
      showToast(`❌ ${msg}`, "error");
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  if (successData) {
    return (
      <SuccessModal
        successData={successData}
        mintAddress={mintAddress}
        time={time}
        onReset={() => {
          setSuccessData(null); setTokenImage(""); setPreviewImage(null);
          setRevokeMint(false); setRevokeFreeze(false); setRevokeUpdate(false);
          setTwitter(""); setTelegram(""); setWebsite("");
          setShowSocialLinks(false); setPromoCodeInput(""); setReferrerWallet(null);
        }}
        onHome={() => setSuccessData(null)}
      />
    );
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-600/20 to-transparent blur-3xl" />

        <div className="relative z-10 pt-20 sm:pt-28 max-w-5xl mx-auto px-3 sm:px-4 pb-16">

          {tokensLeft > 0 && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-3 sm:p-4 text-white text-center shadow-2xl">
              <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-bold">
                <span>🎁 {t("pool_title")} 🎁</span>
              </div>
              <div className="text-xs sm:text-sm mt-1">
                ⚡ First <span className="font-bold text-xl">{tokensLeft}</span> tokens: <span className="font-bold">0.15 SOL</span>
              </div>
            </motion.div>
          )}

          <div className="text-center mb-6 sm:mb-10">
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t("create_title")}
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-gray-400 mt-3 text-sm sm:text-base">
              {t("create_subtitle")}
            </motion.p>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-8">

            {/* FORM */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 p-4 sm:p-8 space-y-4">

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">{t("create_name_label")}</label>
                  <input type="text" value={tokenName} onChange={(e) => setTokenName(e.target.value)} placeholder={t("create_name_placeholder")}
                    className="w-full h-11 px-3 text-sm border border-gray-700 rounded-xl bg-gray-800/50 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">{t("create_symbol_label")}</label>
                  <input type="text" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())} placeholder={t("create_symbol_placeholder")}
                    className="w-full h-11 px-3 text-sm border border-gray-700 rounded-xl bg-gray-800/50 text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">{t("create_supply_label")}</label>
                  <input type="number" value={tokenSupply} onChange={(e) => setTokenSupply(Number(e.target.value))}
                    className="w-full h-11 px-3 text-sm border border-gray-700 rounded-xl bg-gray-800/50 text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">{t("create_decimals_label")}</label>
                  <input type="number" value={tokenDecimals} onChange={(e) => setTokenDecimals(Number(e.target.value))}
                    className="w-full h-11 px-3 text-sm border border-gray-700 rounded-xl bg-gray-800/50 text-white outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">{t("create_logo_label")}</label>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition bg-gray-800/30"
                  onClick={() => fileInputRef.current?.click()}>
                  {previewImage
                    ? <img src={previewImage} alt="Preview" className="w-14 h-14 mx-auto rounded-xl object-cover" />
                    : <div className="text-gray-400 text-sm">{t("create_logo_placeholder")}</div>}
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">{t("create_desc_label")}</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("create_desc_placeholder")}
                  className="w-full px-3 py-3 text-sm border border-gray-700 rounded-xl bg-gray-800/50 text-white outline-none resize-none" />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                  🎫 Promo Code <span className="text-gray-500 text-xs">(optional – save 0.05 SOL)</span>
                </label>
                <input type="text" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter 7-char promo code"
                  className="w-full h-11 px-3 text-sm border border-gray-700 rounded-xl bg-gray-800/50 text-white focus:ring-2 focus:ring-green-500 outline-none uppercase" />
                {referrerWallet && (
                  <p className="text-xs text-green-400 mt-1">✅ Valid! You pay only 0.10 SOL</p>
                )}
              </div>
            </div>

            {/* LAUNCH PANEL */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 p-4 sm:p-8 lg:sticky lg:top-28 space-y-4">

              <div className="text-center">
                <div className="text-4xl mb-2">⚡</div>
                <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {t("create_launch")}
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fee</span>
                    <span className="font-bold text-green-400">{feeSOL} SOL</span>
                  </div>
                  {hasReferral && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Discount applied</span>
                      <span className="text-green-400">-0.05 SOL</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-2 flex justify-between font-semibold">
                    <span className="text-gray-300">Total</span>
                    <span className="text-green-400 font-bold text-lg">{feeSOL} SOL</span>
                  </div>
                </div>
              </div>

              {/* Referral Panel */}
              {publicKey && (
                <div className="rounded-xl p-3 bg-green-600/10 border border-green-500/30">
                  <p className="text-xs font-bold text-green-400 mb-2">💰 YOUR REFERRAL</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Promo Code:</p>
                      <div className="flex gap-2">
                        <code className="flex-1 px-3 py-2 text-sm font-mono bg-gray-900 rounded-lg text-green-400 border border-gray-700">
                          {myPromoCode || "Create a token first"}
                        </code>
                        <button onClick={() => { if (myPromoCode) { navigator.clipboard.writeText(myPromoCode); showToast("Copied!", "success"); } }}
                          disabled={!myPromoCode}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition">
                          Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Referral Link:</p>
                      <div className="flex gap-2">
                        <input readOnly value={typeof window !== "undefined" ? `${window.location.origin}/create?ref=${publicKey}` : ""}
                          className="flex-1 px-3 py-2 text-xs bg-gray-900 border border-gray-700 rounded-lg text-gray-300 outline-none" />
                        <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/create?ref=${publicKey}`); showToast("Copied!", "success"); }}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition">
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Secure Token */}
              <div className="rounded-xl p-4 bg-blue-600/20 border border-blue-500/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white">🔒 {t("create_secure_label")}</span>
                  <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">FREE</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "🚫 Revoke Mint Authority", val: revokeMint, set: setRevokeMint },
                    { label: "❄️ Revoke Freeze Authority", val: revokeFreeze, set: setRevokeFreeze },
                    { label: "📝 Revoke Update Authority", val: revokeUpdate, set: setRevokeUpdate },
                  ].map((item) => (
                    <label key={item.label} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={item.val} onChange={(e) => item.set(e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-sm text-white/90">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={() => setShowSocialLinks(!showSocialLinks)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition text-sm">
                🌐 {t("create_social_button")} <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs ml-1">FREE</span>
              </button>

              <AnimatePresence>
                {showSocialLinks && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="space-y-2 p-3 bg-gray-800/50 rounded-xl">
                      {[
                        { val: twitter, set: setTwitter, ph: t("create_twitter") },
                        { val: telegram, set: setTelegram, ph: t("create_telegram") },
                        { val: website, set: setWebsite, ph: t("create_website") },
                      ].map((item) => (
                        <input key={item.ph} type="url" value={item.val} onChange={(e) => item.set(e.target.value)} placeholder={item.ph}
                          className="w-full h-10 px-3 text-sm border border-gray-700 rounded-lg bg-gray-900 text-white outline-none" />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {mounted && (
                <button onClick={createToken} disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-xl transition text-sm sm:text-base">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t("create_deploying")}
                    </span>
                  ) : !connected ? t("nav_connect") : t("create_button")}
                </button>
              )}

              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                      style={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{step}</span>
                    <span className="font-mono text-blue-400">{Math.floor(progress)}%</span>
                  </div>
                </motion.div>
              )}

              {status && (
                <div className="text-xs text-center text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  {status}
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}