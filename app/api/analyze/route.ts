import { NextRequest, NextResponse } from "next/server";
import { scoreEmail } from "@/lib/analyzers/email-analyzer";
import { scoreUrl } from "@/lib/analyzers/url-analyzer";
import { combine } from "@/lib/analyzers/ensemble";
import { buildExplanation } from "@/lib/analyzers/explain";
import { addLog } from "@/lib/storage";

interface AnalyzeRequest {
  text?: string | null;
  url?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const emailText = body.text?.trim() || "";
    const url = body.url?.trim() || "";

    if (!emailText && !url) {
      return NextResponse.json(
        { error: "يجب إدخال نص بريد أو رابط على الأقل" },
        { status: 400 }
      );
    }

    let label: "Safe" | "Suspicious" | "Phishing";
    let confidence: number;
    let reasons: string[];

    // If only one provided, route to its analyzer
    if (emailText && !url) {
      const result = scoreEmail(emailText);
      label = result.label;
      confidence = result.confidence;
      reasons = result.reasons;
    } else if (url && !emailText) {
      const result = scoreUrl(url);
      label = result.label;
      confidence = result.confidence;
      reasons = result.reasons;
    } else {
      const emailResult = scoreEmail(emailText);
      const urlResult = scoreUrl(url);
      const combined = combine(emailResult, urlResult);
      label = combined.label;
      confidence = combined.confidence;
      reasons = combined.reasons;
    }

    const explanation = buildExplanation(label, confidence, reasons);

    // Log the result
    const inputType = emailText && url ? "combined" : emailText ? "email" : "url";
    addLog({
      inputType,
      emailText: emailText || null,
      url: url || null,
      label,
      confidence,
      explanation,
      clientIp: request.headers.get("x-forwarded-for") || null,
      userAgent: request.headers.get("user-agent") || null,
    });

    return NextResponse.json({
      label,
      confidence,
      explanation,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحليل" },
      { status: 500 }
    );
  }
}
