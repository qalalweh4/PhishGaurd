"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Cpu, RotateCcw, Lightbulb, Mail, Link as LinkIcon, Info, Loader2 } from "lucide-react";

interface AnalysisResult {
  label: "Safe" | "Suspicious" | "Phishing";
  confidence: number;
  explanation: string;
}

interface AnalysisFormProps {
  onResult: (result: AnalysisResult | null) => void;
  onStatusChange: (status: "ready" | "processing" | "error", message?: string) => void;
}

export interface AnalysisFormRef {
  loadDemo: () => void;
}

export const AnalysisForm = forwardRef<AnalysisFormRef, AnalysisFormProps>(
  function AnalysisForm({ onResult, onStatusChange }, ref) {
    const [emailText, setEmailText] = useState("");
    const [urlText, setUrlText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useImperativeHandle(ref, () => ({
      loadDemo: () => {
        setEmailText(
          "عاجل: تم إيقاف حسابك. الرجاء تحقق من حسابك فوراً وإدخال رمز OTP لتجنب إغلاق الحساب!"
        );
        setUrlText("http://secure-login.verify-account.xyz/login?user=you@company.com");
        onStatusChange("ready", "تم وضع مثال للتجربة.");
      },
    }));

    const handleAnalyze = async () => {
      if (!emailText.trim() && !urlText.trim()) {
        onStatusChange("error", "أدخل نص بريد أو رابط على الأقل.");
        return;
      }

      setIsLoading(true);
      onStatusChange("processing", "جاري التحليل...");
      onResult(null);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: emailText.trim() || null,
            url: urlText.trim() || null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "حدث خطأ أثناء التحليل");
        }

        onResult(data);
        onStatusChange("ready", "تم التحليل وتسجيل النتيجة في السجل.");
      } catch (error) {
        onStatusChange("error", error instanceof Error ? error.message : "حدث خطأ أثناء الاتصال.");
      } finally {
        setIsLoading(false);
      }
    };

    const handleClear = () => {
      setEmailText("");
      setUrlText("");
      onResult(null);
      onStatusChange("ready");
    };

    const handleDemo = () => {
      setEmailText(
        "عاجل: تم إيقاف حسابك. الرجاء تحقق من حسابك فوراً وإدخال رمز OTP لتجنب إغلاق الحساب!"
      );
      setUrlText("http://secure-login.verify-account.xyz/login?user=you@company.com");
      onStatusChange("ready", "تم وضع مثال للتجربة.");
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-lg flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                فحص البريد والرابط
              </h4>
              <p className="text-muted-foreground text-sm mt-1">
                أدخل النص والرابط للتحليل الفوري
              </p>
            </div>
            <div
              className={`w-3 h-3 rounded-full animate-pulse ${
                isLoading ? "bg-yellow-400" : "bg-green-500"
              }`}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                <Mail className="h-4 w-4" />
                نص البريد الإلكتروني
              </label>
              <textarea
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm"
                placeholder="مثال: عاجل: تم إيقاف حسابك. الرجاء تحقق من حسابك فوراً..."
              />
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <Info className="h-3 w-3" />
                لا تشارك بيانات حساسة حقيقية. استخدم رسائل اختبار فقط.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                <LinkIcon className="h-4 w-4" />
                الرابط URL (اختياري)
              </label>
              <input
                type="text"
                value={urlText}
                onChange={(e) => setUrlText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder="https://example.com/login"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-l from-[#667eea] to-[#764ba2] text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Cpu className="h-4 w-4" />
                )}
                <span>{isLoading ? "جاري التحليل..." : "تحليل"}</span>
              </button>
              <button
                onClick={handleClear}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border text-foreground font-semibold hover:bg-secondary transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>مسح</span>
              </button>
              <button
                onClick={handleDemo}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                <Lightbulb className="h-4 w-4" />
                <span>مثال</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
