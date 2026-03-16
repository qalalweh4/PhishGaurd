"use client";

import Link from "next/link";
import { ClipboardList, CheckCircle, XCircle, AlertTriangle, Copy, History, FileText, Database, Percent, Check } from "lucide-react";
import { useState } from "react";

interface AnalysisResult {
  label: "Safe" | "Suspicious" | "Phishing";
  confidence: number;
  explanation: string;
}

interface ResultPanelProps {
  result: AnalysisResult | null;
  status: "ready" | "processing" | "error";
  statusMessage?: string;
}

export function ResultPanel({ result, status, statusMessage }: ResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const getBadgeConfig = () => {
    if (!result) {
      return {
        className: "bg-secondary text-secondary-foreground",
        icon: null,
        text: "جاهز للتحليل",
      };
    }

    switch (result.label) {
      case "Safe":
        return {
          className: "bg-green-500 text-white",
          icon: <CheckCircle className="h-4 w-4" />,
          text: "آمن",
        };
      case "Suspicious":
        return {
          className: "bg-yellow-500 text-white",
          icon: <AlertTriangle className="h-4 w-4" />,
          text: "مشبوه",
        };
      case "Phishing":
        return {
          className: "bg-red-500 text-white",
          icon: <XCircle className="h-4 w-4" />,
          text: "تصيّد",
        };
    }
  };

  const getProgressBarColor = () => {
    if (!result) return "bg-secondary";
    switch (result.label) {
      case "Safe":
        return "bg-green-500";
      case "Suspicious":
        return "bg-yellow-500";
      case "Phishing":
        return "bg-red-500";
    }
  };

  const badge = getBadgeConfig();
  const confidence = result ? Math.round(result.confidence * 100) : 0;

  const handleCopy = async () => {
    if (result?.explanation) {
      await navigator.clipboard.writeText(result.explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-bl from-[#f8f9ff] to-[#e8ecff] rounded-2xl border border-border min-h-[500px]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h5 className="font-bold text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            النتيجة
          </h5>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 ${badge.className}`}
          >
            {badge.icon}
            {badge.text}
          </span>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-semibold">مستوى الثقة</span>
            <span className="text-sm text-muted-foreground">{confidence}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressBarColor()}`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {statusMessage && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
              status === "error"
                ? "bg-red-100 text-red-700"
                : status === "processing"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {status === "error" ? (
              <XCircle className="h-4 w-4" />
            ) : status === "processing" ? (
              <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {statusMessage}
          </div>
        )}

        <pre className="bg-[#0b1020] text-gray-200 p-4 rounded-2xl min-h-[200px] whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {result?.explanation || 'أدخل البيانات ثم اضغط "تحليل" للحصول على النتيجة.'}
        </pre>

        <div className="grid grid-cols-1 gap-2 mt-6">
          <button
            onClick={handleCopy}
            disabled={!result}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "تم النسخ" : "نسخ النتيجة"}</span>
          </button>
          <Link
            href="/history"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border text-foreground font-semibold hover:bg-secondary transition-colors"
          >
            <History className="h-4 w-4" />
            <span>عرض سجل التحليلات</span>
          </Link>
        </div>

        <hr className="my-6 border-border" />

        <div className="text-sm text-muted-foreground">
          <div className="font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            مخرجات النظام:
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>التصنيف</span>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              <span>نسبة الثقة</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span>الشرح</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-yellow-500" />
              <span>تسجيل السجل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
