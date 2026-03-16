"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  Home,
  Download,
  History,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Link as LinkIcon,
  Layers,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Trash2,
  Inbox,
} from "lucide-react";

interface AnalysisLog {
  id: number;
  inputType: "email" | "url" | "combined";
  emailText: string | null;
  url: string | null;
  label: "Safe" | "Suspicious" | "Phishing";
  confidence: number;
  explanation: string;
  createdAt: string;
}

interface Stats {
  total: number;
  safe: number;
  suspicious: number;
  phishing: number;
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, safe: 0, suspicious: 0, phishing: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedLog, setSelectedLog] = useState<AnalysisLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/history");
      const data = await response.json();
      setLogs(data.logs);
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          log.emailText?.toLowerCase().includes(term) ||
          log.url?.toLowerCase().includes(term)
      );
    }

    if (typeFilter) {
      result = result.filter((log) => log.inputType === typeFilter);
    }

    if (resultFilter) {
      result = result.filter((log) => log.label === resultFilter);
    }

    result.sort((a, b) => {
      return sortOrder === "desc" ? b.id - a.id : a.id - b.id;
    });

    return result;
  }, [logs, searchTerm, typeFilter, resultFilter, sortOrder]);

  const exportData = () => {
    let csv = "ID,Type,Result,Confidence,Content,Date\n";
    filteredLogs.forEach((log) => {
      const content = log.emailText || log.url || "";
      csv += `${log.id},${log.inputType},${log.label},${Math.round(log.confidence * 100)}%,"${content.slice(0, 100)}",${log.createdAt}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `phishguard_history_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-5 w-5 text-white" />;
      case "url":
        return <LinkIcon className="h-5 w-5 text-white" />;
      default:
        return <Layers className="h-5 w-5 text-white" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "email":
        return "bg-gradient-to-l from-red-400 to-orange-400";
      case "url":
        return "bg-gradient-to-l from-teal-400 to-green-400";
      default:
        return "bg-gradient-to-l from-green-300 to-lime-300";
    }
  };

  const getLabelBadge = (label: string) => {
    switch (label) {
      case "Safe":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-500 text-white">
            <CheckCircle className="h-4 w-4" />
            آمن
          </span>
        );
      case "Suspicious":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-500 text-white">
            <AlertTriangle className="h-4 w-4" />
            مشبوه
          </span>
        );
      case "Phishing":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500 text-white">
            <XCircle className="h-4 w-4" />
            تصيّد
          </span>
        );
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Shield className="h-6 w-6 text-primary" />
            <span>PhishGuard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>الرئيسية</span>
            </Link>
            <button
              onClick={exportData}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-secondary transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>تصدير</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="bg-gradient-to-l from-[#667eea] to-[#764ba2] text-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm opacity-80">إجمالي التحليلات</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-300">{stats.safe}</div>
              <div className="text-sm opacity-80">آمن</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300">{stats.suspicious}</div>
              <div className="text-sm opacity-80">مشبوه</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-300">{stats.phishing}</div>
              <div className="text-sm opacity-80">تصيد</div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold mb-2 block">البحث</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث في النص أو الرابط..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-full border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">النوع</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
              >
                <option value="">الكل</option>
                <option value="email">بريد إلكتروني</option>
                <option value="url">رابط</option>
                <option value="combined">مجمع</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">النتيجة</label>
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
              >
                <option value="">الكل</option>
                <option value="Safe">آمن</option>
                <option value="Suspicious">مشبوه</option>
                <option value="Phishing">تصيد</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">الترتيب</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
              >
                <option value="desc">الأحدث أولاً</option>
                <option value="asc">الأقدم أولاً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            سجل التحليلات
          </h4>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              عرض {filteredLogs.length} نتيجة
            </span>
            <button
              onClick={fetchData}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* History Table */}
        {filteredLogs.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-l from-[#667eea] to-[#764ba2] text-white">
                  <tr>
                    <th className="px-4 py-4 text-right font-semibold">#</th>
                    <th className="px-4 py-4 text-right font-semibold">النوع</th>
                    <th className="px-4 py-4 text-right font-semibold">النتيجة</th>
                    <th className="px-4 py-4 text-right font-semibold">الثقة</th>
                    <th className="px-4 py-4 text-right font-semibold">المحتوى</th>
                    <th className="px-4 py-4 text-right font-semibold">التاريخ</th>
                    <th className="px-4 py-4 text-right font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border hover:bg-[#f8f9ff] transition-colors"
                    >
                      <td className="px-4 py-4 font-semibold">{log.id}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(
                              log.inputType
                            )}`}
                          >
                            {getTypeIcon(log.inputType)}
                          </div>
                          <span className="font-medium">{log.inputType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">{getLabelBadge(log.label)}</td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-semibold">
                            {Math.round(log.confidence * 100)}%
                          </div>
                          <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${getConfidenceColor(log.confidence)}`}
                              style={{ width: `${log.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className="max-w-[200px] truncate text-sm text-muted-foreground"
                          title={log.emailText || log.url || ""}
                        >
                          {(log.emailText || log.url || "").slice(0, 50)}...
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("ar-SA")}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Inbox className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h5 className="text-lg font-semibold text-muted-foreground mb-2">
              لا توجد نتائج
            </h5>
            <p className="text-muted-foreground">
              لم يتم العثور على أي سجلات تطابق معايير البحث
            </p>
          </div>
        )}
      </main>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h5 className="font-bold text-lg">تفاصيل التحليل</h5>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">
                    رقم التحليل
                  </label>
                  <p className="font-medium">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">
                    النوع
                  </label>
                  <p className="font-medium">{selectedLog.inputType}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">
                    النتيجة
                  </label>
                  <div className="mt-1">{getLabelBadge(selectedLog.label)}</div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">
                    الثقة
                  </label>
                  <p className="font-medium">
                    {Math.round(selectedLog.confidence * 100)}%
                  </p>
                </div>
              </div>

              {selectedLog.emailText && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">
                    نص البريد
                  </label>
                  <p className="mt-1 p-3 bg-secondary rounded-xl text-sm">
                    {selectedLog.emailText}
                  </p>
                </div>
              )}

              {selectedLog.url && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">
                    الرابط
                  </label>
                  <p className="mt-1 p-3 bg-secondary rounded-xl text-sm break-all">
                    {selectedLog.url}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  الشرح
                </label>
                <pre className="mt-1 p-3 bg-[#0b1020] text-gray-200 rounded-xl text-sm whitespace-pre-wrap font-mono">
                  {selectedLog.explanation}
                </pre>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  التاريخ
                </label>
                <p className="font-medium">
                  {new Date(selectedLog.createdAt).toLocaleString("ar-SA")}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-border">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full px-4 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
