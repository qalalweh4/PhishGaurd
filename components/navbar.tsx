"use client";

import Link from "next/link";
import { Shield, History, Play } from "lucide-react";

interface NavbarProps {
  onDemo?: () => void;
}

export function Navbar({ onDemo }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Shield className="h-6 w-6 text-primary" />
          <span>PhishGuard</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/history"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <History className="h-4 w-4" />
            <span>سجل التحليلات</span>
          </Link>
          {onDemo && (
            <button
              onClick={onDemo}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-l from-[#667eea] to-[#764ba2] text-white hover:opacity-90 transition-opacity"
            >
              <Play className="h-4 w-4" />
              <span>تجربة سريعة</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
