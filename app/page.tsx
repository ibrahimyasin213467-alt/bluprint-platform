"use client";

import { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import HeroSection from "./components/HeroSection";
import WhyBluPrint from "./components/WhyBluPrint";
import HowItWorks from "./components/HowItWorks";
import LiveExperience from "./components/LiveExperience";
import TrustSection from "./components/TrustSection";
import UseCase from "./components/UseCase";
import FinalCTA from "./components/FinalCTA";
import BoostSection from "./components/BoostSection";
import SuccessModal from "./components/SuccessModal";
import { useToast } from "./components/ToastProvider";
import { useI18n } from "./lib/i18n-provider";

// İç component
function HomeContent() {
  const { t } = useI18n();
  const { publicKey } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [successData, setSuccessData] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(0);

  const [tokenName, setTokenName] = useState("BluPrint Coin");
  const [tokenSymbol, setTokenSymbol] = useState("BLUEP");
  const [tokenSupply, setTokenSupply] = useState(1_000_000_000);
  const [tokenDecimals, setTokenDecimals] = useState(6);
  const [tokenImage, setTokenImage] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [secureToken, setSecureToken] = useState(false);
  const [time, setTime] = useState(0);
  const [mintAddress, setMintAddress] = useState("");

  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const referrerAddress = searchParams.get("ref");
  const validReferrer = referrerAddress && referrerAddress.length === 44 ? referrerAddress : null;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (validReferrer) {
      showToast(`Referral link detected! You'll save 0.02 SOL`, "info");
    }
  }, [validReferrer, showToast]);

  const handleCreateClick = () => {
    if (!publicKey) {
      showToast("Please connect your wallet first", "warning");
      return;
    }
    router.push("/create");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast("Uploading logo...", "info");
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setTokenImage(data.url);
        setPreviewImage(URL.createObjectURL(file));
        showToast("Logo uploaded!", "success");
      } else {
        showToast(`❌ ${data.error}`, "error");
      }
    } catch (err: any) {
      showToast(`❌ ${err.message}`, "error");
    }
  };

  const validateInputs = () => {
    if (tokenName.length < 3 || tokenName.length > 32) return "Token name must be 3-32 characters";
    if (tokenSymbol.length < 2 || tokenSymbol.length > 8) return "Token symbol must be 2-8 characters";
    if (!/^[A-Z0-9]+$/i.test(tokenSymbol)) return "Symbol can only contain letters and numbers";
    if (tokenSupply < 1000 || tokenSupply > 10_000_000_000) return "Supply must be between 1,000 and 10,000,000,000";
    if (tokenDecimals < 0 || tokenDecimals > 9) return "Decimals must be between 0 and 9";
    return null;
  };

  const createToken = async () => {
    if (isProcessing || loading) return;
    if (!publicKey) {
      showToast("Please connect your wallet first", "warning");
      return;
    }
    const validationError = validateInputs();
    if (validationError) {
      showToast(`❌ ${validationError}`, "error");
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    setProgress(0);
    setStep("Initializing...");
    setEstimatedTime(5);
    setStatus("Preparing token...");

    const start = Date.now();

    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const elapsed = (Date.now() - start) / 1000;
        const newProgress = Math.min(95, Math.floor((elapsed / 5) * 100));
        setEstimatedTime(Math.max(1, Math.ceil(5 - elapsed)));
        return newProgress;
      });
    }, 100);

    const steps = [
      { progress: 10, text: "Validating..." },
      { progress: 25, text: "Preparing mint..." },
      { progress: 40, text: "Processing fee..." },
      { progress: 55, text: "Creating token..." },
      { progress: 70, text: "Minting supply..." },
      { progress: 85, text: "Finalizing..." },
    ];

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length && progress >= steps[stepIndex].progress) {
        setStep(steps[stepIndex].text);
        stepIndex++;
      }
    }, 200);

    try {
      const res = await fetch("/api/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPublicKey: publicKey.toString(),
          name: tokenName,
          symbol: tokenSymbol,
          supply: tokenSupply,
          decimals: tokenDecimals,
          imageUrl: tokenImage,
          description,
          secureToken,
          referrer: validReferrer,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      clearInterval(progressInterval.current);
      clearInterval(stepInterval);
      setProgress(100);
      setStep("Done!");

      const end = Date.now();
      setTime((end - start) / 1000);
      setMintAddress(data.mintAddress);
      setSuccessData({
        mint: data.mintAddress,
        name: tokenName,
        symbol: tokenSymbol,
        supply: tokenSupply,
        decimals: tokenDecimals,
        secureToken: data.secureTokenApplied || secureToken,
        referralApplied: data.referralApplied,
        tokensLeft: data.tokensLeft,
        feePaid: data.feePaid,
      });
      setStatus("");
      setRetryCount(0);
      showToast("Token created successfully!", "success");
    } catch (err: any) {
      clearInterval(progressInterval.current);
      clearInterval(stepInterval);
      setStatus(`❌ ${err.message}`);
      setRetryCount((prev) => prev + 1);
      setProgress(0);
      showToast(`❌ ${err.message}`, "error");
    } finally {
      setLoading(false);
      setIsProcessing(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
  };

  if (successData) {
    return (
      <SuccessModal
        successData={successData}
        mintAddress={mintAddress}
        time={time}
        onReset={() => {
          setSuccessData(null);
          setTokenImage("");
          setPreviewImage(null);
          setSecureToken(false);
        }}
        onHome={() => {
          setSuccessData(null);
        }}
      />
    );
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen">
        <div className="pt-16 max-w-6xl mx-auto px-4">
          <HeroSection onCreateClick={handleCreateClick} />
          
          {/* STATS SECTION - REPLACES FAKE POOL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 text-center hover:border-blue-500/50 transition-all duration-300 group">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition">~0.6s</div>
              <div className="text-sm text-gray-400">Avg Deploy Time</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 text-center hover:border-blue-500/50 transition-all duration-300 group">
              <div className="text-3xl mb-2">🌍</div>
              <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition">40+</div>
              <div className="text-sm text-gray-400">Global Creators</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 text-center hover:border-blue-500/50 transition-all duration-300 group">
              <div className="text-3xl mb-2">🔷</div>
              <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition">1,000+</div>
              <div className="text-sm text-gray-400">Tokens Launched</div>
            </div>
          </div>

          <WhyBluPrint />
          <HowItWorks />
          <LiveExperience />
          <TrustSection />
          <UseCase />
          <BoostSection />
          <FinalCTA onScrollToForm={handleCreateClick} />
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}

// Ana export
export default function Home() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen text-gray-500">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}