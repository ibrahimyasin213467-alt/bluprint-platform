"use client";

import { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import HeroSection from "./components/HeroSection";
import WhyBluPrint from "./components/WhyBluPrint";
import HowItWorks from "./components/HowItWorks";
import LiveExperience from "./components/LiveExperience";
import TrustSection from "./components/TrustSection";
import UseCase from "./components/UseCase";
import FinalCTA from "./components/FinalCTA";
import PoolStats from "./components/PoolStats";
import FeaturedTokens from "./components/FeaturedTokens";
import BoostSection from "./components/BoostSection";
import SuccessModal from "./components/SuccessModal";
import { useToast } from "./components/ToastProvider";
import { useI18n } from "./lib/i18n-provider";

// İç component (tüm mevcut mantık burada)
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
      showToast(`${t('referralLinkDetected')}`, "info");
    }
  }, [validReferrer, showToast, t]);

  const handleCreateClick = () => {
    if (!publicKey) {
      showToast(t('connectWalletFirst'), "warning");
      return;
    }
    router.push("/create");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast(t('uploadingLogo'), "info");
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setTokenImage(data.url);
        setPreviewImage(URL.createObjectURL(file));
        showToast(t('logoUploaded'), "success");
      } else {
        showToast(`❌ ${data.error}`, "error");
      }
    } catch (err: any) {
      showToast(`❌ ${err.message}`, "error");
    }
  };

  const validateInputs = () => {
    if (tokenName.length < 3 || tokenName.length > 32) return t('tokenNameError');
    if (tokenSymbol.length < 2 || tokenSymbol.length > 8) return t('tokenSymbolError');
    if (!/^[A-Z0-9]+$/i.test(tokenSymbol)) return t('tokenSymbolInvalid');
    if (tokenSupply < 1000 || tokenSupply > 10_000_000_000) return t('tokenSupplyError');
    if (tokenDecimals < 0 || tokenDecimals > 9) return t('tokenDecimalsError');
    return null;
  };

  const createToken = async () => {
    if (isProcessing || loading) return;
    if (!publicKey) {
      showToast(t('connectWalletFirst'), "warning");
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
    setStep(t('initializing'));
    setEstimatedTime(5);
    setStatus(t('preparingToken'));

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
      { progress: 10, text: t('stepValidating') },
      { progress: 25, text: t('stepPreparingMint') },
      { progress: 40, text: t('stepProcessingFee') },
      { progress: 55, text: t('stepCreatingToken') },
      { progress: 70, text: t('stepMintingSupply') },
      { progress: 85, text: t('stepFinalizing') },
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
      setStep(t('done'));

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
      showToast(t('tokenCreated'), "success");
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
        <Navbar mounted={mounted} />
        <div className="pt-24 max-w-6xl mx-auto px-4">
          <HeroSection onCreateClick={handleCreateClick} />
          <PoolStats />
          <FeaturedTokens />
          <BoostSection />
          <WhyBluPrint />
          <HowItWorks />
          <LiveExperience />
          <TrustSection />
          <UseCase />
          <FinalCTA onScrollToForm={handleCreateClick} />
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}

// Ana export - Suspense ile sarmalanmış
export default function Home() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}