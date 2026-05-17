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

// Feature Card Component
function FeatureCard({ icon, titleKey, descKey, delay, t }: { 
  icon: string; 
  titleKey: string; 
  descKey: string; 
  delay: number;
  t: (key: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition duration-500" />
      
      <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/90 backdrop-blur-xl rounded-2xl border border-white/10 group-hover:border-blue-500/40 transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
        <div className="absolute top-6 left-6 w-20 h-20 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition duration-500" />
        
        <div className="p-6 sm:p-8 text-center relative z-10">
          <div className="relative mb-5 inline-block">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-lg group-hover:blur-xl transition duration-300" />
            <div className="relative w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 group-hover:border-blue-500/50 flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110">
              <span className="group-hover:animate-pulse">{icon}</span>
            </div>
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition duration-300">
            {t(titleKey)}
          </h3>
          
          <p className="text-gray-400 text-sm leading-relaxed">
            {t(descKey)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

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
      showToast(t("referral_link_detected"), "info");
    }
  }, [validReferrer, showToast, t]);

  const handleCreateClick = () => {
    if (!publicKey) {
      showToast(t("connect_wallet_first"), "warning");
      return;
    }
    router.push("/create");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast(t("uploading_logo"), "info");
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setTokenImage(data.url);
        setPreviewImage(URL.createObjectURL(file));
        showToast(t("logo_uploaded"), "success");
      } else {
        showToast(`❌ ${data.error}`, "error");
      }
    } catch (err: any) {
      showToast(`❌ ${err.message}`, "error");
    }
  };

  const validateInputs = () => {
    if (tokenName.length < 3 || tokenName.length > 32) return t("token_name_error");
    if (tokenSymbol.length < 2 || tokenSymbol.length > 8) return t("token_symbol_error");
    if (!/^[A-Z0-9]+$/i.test(tokenSymbol)) return t("token_symbol_invalid");
    if (tokenSupply < 1000 || tokenSupply > 10_000_000_000) return t("token_supply_error");
    if (tokenDecimals < 0 || tokenDecimals > 9) return t("token_decimals_error");
    return null;
  };

  const createToken = async () => {
    if (isProcessing || loading) return;
    if (!publicKey) {
      showToast(t("connect_wallet_first"), "warning");
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
    setStep("🚀 Initializing...");
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
      setStep("✅ Done!");

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
      showToast(t("token_created"), "success");
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
          
          {/* PREMIUM FEATURE CARDS SECTION */}
          <div className="relative py-12 mb-8">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <FeatureCard icon="⚡" titleKey="feature_fast_title" descKey="feature_fast_desc" delay={0} t={t} />
              <FeatureCard icon="🔒" titleKey="feature_secure_title" descKey="feature_secure_desc" delay={0.1} t={t} />
              <FeatureCard icon="🌐" titleKey="feature_solana_title" descKey="feature_solana_desc" delay={0.2} t={t} />
            </div>
          </div>

          <WhyBluPrint t={t} />
          <HowItWorks t={t} />
          <LiveExperience t={t} />
          <TrustSection t={t} />
          <UseCase t={t} />
          <BoostSection t={t} />
          <FinalCTA onScrollToForm={handleCreateClick} t={t} />
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