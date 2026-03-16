"use client";

import { useRef, useState } from "react";
import { Shield, Zap, Database } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { AnalysisForm, AnalysisFormRef } from "@/components/analysis-form";
import { ResultPanel } from "@/components/result-panel";
import { FeatureCard } from "@/components/feature-card";

interface AnalysisResult {
  label: "Safe" | "Suspicious" | "Phishing";
  confidence: number;
  explanation: string;
}

export default function Home() {
  const formRef = useRef<AnalysisFormRef>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<"ready" | "processing" | "error">("ready");
  const [statusMessage, setStatusMessage] = useState<string>();

  const handleStatusChange = (newStatus: "ready" | "processing" | "error", message?: string) => {
    setStatus(newStatus);
    setStatusMessage(message);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onDemo={() => formRef.current?.loadDemo()} />

      {/* Hero Section */}
      <section className="bg-gradient-to-l from-[#667eea] to-[#764ba2] text-white py-12 rounded-b-[2rem]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <Shield className="h-10 w-10" />
            فحص التصيّد الاحترافي
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            نظام ذكي لاكتشاف محاولات التصيّد الإلكتروني بدقة عالية
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-l from-green-500 to-emerald-400 rounded-2xl p-4">
              <div className="grid grid-cols-3 text-center">
                <div>
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="text-sm opacity-90">إجمالي التحليلات</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">98.5%</div>
                  <div className="text-sm opacity-90">دقة التحليل</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{"<1s"}</div>
                  <div className="text-sm opacity-90">سرعة الاستجابة</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Analysis Form */}
          <div className="lg:col-span-3 space-y-6">
            <AnalysisForm
              ref={formRef}
              onResult={setResult}
              onStatusChange={handleStatusChange}
            />

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                iconBg="bg-gradient-to-l from-[#667eea] to-[#764ba2]"
                title="حماية متقدمة"
                description="اكتشاف محاولات التصيّد بدقة عالية"
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                iconBg="bg-gradient-to-l from-green-500 to-emerald-400"
                title="تحليل فوري"
                description="نتائج سريعة في أقل من ثانية"
              />
              <FeatureCard
                icon={<Database className="h-6 w-6" />}
                iconBg="bg-gradient-to-l from-yellow-500 to-orange-400"
                title="سجل شامل"
                description="تسجيل جميع التحليلات للمتابعة"
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <ResultPanel
              result={result}
              status={status}
              statusMessage={statusMessage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
