import { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  MessageCircle,
  Phone,
  Eye,
  Trash2,
  Calendar,
  Activity,
  CheckCircle,
  Clock,
  Printer,
  X,
  FileText,
  Save,
  ChevronRight,
  ExternalLink,
  Mail,
  Send,
  Info,
} from 'lucide-react';
import { ClientSubmission, FormSchema } from '../types.ts';
import { updateSubmission, deleteSubmission, resendSubmissionEmail } from '../api.ts';

interface SubmissionsListProps {
  submissions: ClientSubmission[];
  schema: FormSchema;
  onRefresh: () => void;
}

export default function SubmissionsList({
  submissions,
  schema,
  onRefresh,
}: SubmissionsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientSubmission['status']>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ClientSubmission | null>(null);
  const [coachNotes, setCoachNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      sub.clientName.toLowerCase().includes(term) ||
      (sub.clientPhone || '').includes(term) ||
      (sub.clientGoal || '').toLowerCase().includes(term) ||
      (sub.clientEmail || '').toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  // Count stats
  const totalCount = submissions.length;
  const newCount = submissions.filter((s) => s.status === 'new').length;
  const contactedCount = submissions.filter((s) => s.status === 'contacted').length;
  const activeCount = submissions.filter((s) => s.status === 'active').length;

  // Handle status update
  const handleStatusChange = async (id: string, newStatus: ClientSubmission['status']) => {
    try {
      await updateSubmission(id, { status: newStatus });
      onRefresh();
      if (selectedSubmission && selectedSubmission.id === id) {
        setSelectedSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      alert(err.message || 'فشل تحديث الحالة');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الاستمارة نهائياً؟')) return;
    try {
      await deleteSubmission(id);
      onRefresh();
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }
    } catch (err: any) {
      alert(err.message || 'فشل حذف الاستمارة');
    }
  };

  // Open details
  const handleOpenDetails = (sub: ClientSubmission) => {
    setSelectedSubmission(sub);
    setCoachNotes(sub.coachNotes || '');
    setEmailStatusMsg(null);
  };

  // Resend email to coach
  const handleResendEmail = async () => {
    if (!selectedSubmission) return;
    setResendingEmail(true);
    setEmailStatusMsg(null);
    try {
      const res = await resendSubmissionEmail(selectedSubmission.id);
      setEmailStatusMsg({
        text: res.message,
        success: res.success,
      });
    } catch (err: any) {
      setEmailStatusMsg({
        text: err.message || 'فشل إرسال الإيميل',
        success: false,
      });
    } finally {
      setResendingEmail(false);
    }
  };

  // Save coach notes
  const handleSaveNotes = async () => {
    if (!selectedSubmission) return;
    setSavingNotes(true);
    try {
      await updateSubmission(selectedSubmission.id, { coachNotes });
      setSelectedSubmission((prev) => (prev ? { ...prev, coachNotes } : null));
      onRefresh();
      alert('تم حفظ ملاحظاتك بنجاح');
    } catch (err: any) {
      alert(err.message || 'فشل حفظ الملاحظات');
    } finally {
      setSavingNotes(false);
    }
  };

  // Calculate BMI helper if height & weight exist
  const getBmiStats = (answers: Record<string, any>) => {
    const weight = Number(answers['current_weight']);
    const heightCm = Number(answers['height']);
    if (weight > 20 && heightCm > 100) {
      const heightM = heightCm / 100;
      const bmi = (weight / (heightM * heightM)).toFixed(1);
      let cat = 'وزن طبيعي';
      let color = 'text-green-400';
      const bmiNum = Number(bmi);
      if (bmiNum < 18.5) {
        cat = 'نحافة';
        color = 'text-blue-400';
      } else if (bmiNum >= 25 && bmiNum < 30) {
        cat = 'زيادة وزن';
        color = 'text-amber-400';
      } else if (bmiNum >= 30) {
        cat = 'سمنة';
        color = 'text-red-400';
      }
      return { bmi, cat, color };
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header & Stats Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>ردود واشتراكات المتدربين</span>
            <span className="text-xs bg-amber-500 text-neutral-950 font-bold px-2 py-0.5 rounded-full">
              {totalCount} استمارة
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            جميع البيانات والإجابات التي أرسلها المتدربون، وإشعارات البريد على <span className="text-amber-400 font-mono">{schema.coachEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            id="btn-export-csv"
            href="/api/export-csv"
            download
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm font-semibold border border-neutral-700 transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>تصدير ملف Excel / CSV</span>
          </a>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'all'
              ? 'bg-neutral-900 border-amber-500 shadow-md'
              : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <span className="text-xs text-neutral-400 block mb-1">الكل</span>
          <span className="text-2xl font-black text-white">{totalCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('new')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'new'
              ? 'bg-amber-950/30 border-amber-500 shadow-md'
              : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <span className="text-xs text-amber-400 block mb-1">جديد لم يتم التواصل</span>
          <span className="text-2xl font-black text-amber-400">{newCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('contacted')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'contacted'
              ? 'bg-blue-950/30 border-blue-500 shadow-md'
              : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <span className="text-xs text-blue-400 block mb-1">تم التواصل</span>
          <span className="text-2xl font-black text-blue-400">{contactedCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('active')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'active'
              ? 'bg-emerald-950/30 border-emerald-500 shadow-md'
              : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <span className="text-xs text-emerald-400 block mb-1">قيد المتابعة والتدريب</span>
          <span className="text-2xl font-black text-emerald-400">{activeCount}</span>
        </div>
      </div>

      {/* Info Banner for Coach */}
      <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 text-neutral-300">
          <Info className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            جميع استمارات المتدربين محفوظة بالكامل هنا! اضغط على <strong className="text-white">"عرض التفاصيل"</strong> لأي متدرب لقراءة إجاباته أو مراسلته واتساب أو الضغط على <strong className="text-amber-400">"إرسال الاستمارة إلى إيميلي"</strong>.
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-submissions"
            type="text"
            value={searchTerm}
            placeholder="ابحث بالاسم، رقم الهاتف، أو الهدف التدريبي..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['all', 'new', 'contacted', 'active', 'archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {translateStatus(st)}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List Content */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">لا توجد استمارات مطابقة للبحث</h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
            بمجرد أن يقوم أي متدرب بتعبئة الاستمارة والضغط على تأكيد، ستظهر استمارته وبياناته فوراً هنا وتصلك على بريدك الإلكتروني.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((sub) => {
            const bmiInfo = getBmiStats(sub.answers);
            const dateStr = new Date(sub.createdAt).toLocaleDateString('ar-EG', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={sub.id}
                className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Client Main Summary */}
                <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => handleOpenDetails(sub)}>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-base sm:text-lg font-bold text-white">
                      {sub.clientName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadgeClasses(sub.status)}`}>
                      {translateStatus(sub.status)}
                    </span>
                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-300 flex-wrap">
                    {sub.clientGoal && (
                      <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/20 font-medium">
                        الهدف: {sub.clientGoal}
                      </span>
                    )}

                    {sub.answers['current_weight'] && (
                      <span className="text-neutral-400">
                        الوزن: <strong className="text-white">{sub.answers['current_weight']} كجم</strong>
                      </span>
                    )}

                    {sub.answers['height'] && (
                      <span className="text-neutral-400">
                        الطول: <strong className="text-white">{sub.answers['height']} سم</strong>
                      </span>
                    )}

                    {bmiInfo && (
                      <span className="text-neutral-400">
                        BMI: <strong className={bmiInfo.color}>{bmiInfo.bmi} ({bmiInfo.cat})</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions & WhatsApp Direct Contact */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {sub.clientPhone && (
                    <a
                      href={`https://wa.me/${sub.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `مرحباً ${sub.clientName}، معك كابتن كريم. اطلعت على استمارتك وجاهز لبدء تجهيز برنامجك!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl transition-all shadow-sm"
                      title="مراسلة المتدرب على واتساب"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">واتساب</span>
                    </a>
                  )}

                  <button
                    onClick={() => handleOpenDetails(sub)}
                    className="flex items-center gap-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3.5 py-2 rounded-xl font-semibold border border-neutral-700 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>عرض التفاصيل</span>
                  </button>

                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-start justify-between gap-4 bg-neutral-950/60">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    استمارة المتدرب: {selectedSubmission.clientName}
                  </h2>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClasses(selectedSubmission.status)}`}>
                    {translateStatus(selectedSubmission.status)}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  تاريخ التقديم: {new Date(selectedSubmission.createdAt).toLocaleString('ar-EG')} &bull; كود: #{selectedSubmission.id.slice(-6)}
                </p>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Quick Contact & Status Bar */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-neutral-400 block font-semibold">تغيير حالة المتابعة:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['new', 'contacted', 'active', 'archived'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedSubmission.id, st)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          selectedSubmission.status === st
                            ? 'bg-amber-500 text-neutral-950 font-bold'
                            : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        {translateStatus(st)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedSubmission.clientPhone && (
                    <a
                      href={`https://wa.me/${selectedSubmission.clientPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>محادثة واتساب ({selectedSubmission.clientPhone})</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Answers Grouped by Sections */}
              <div className="space-y-6">
                {schema.sections.map((section) => {
                  const sectionQuestions = section.questions.filter((q) => {
                    const ans = selectedSubmission.answers[q.id];
                    return ans !== undefined && ans !== null && ans !== '';
                  });

                  if (sectionQuestions.length === 0) return null;

                  return (
                    <div
                      key={section.id}
                      className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950/40"
                    >
                      <div className="bg-neutral-800/60 px-4 py-2.5 font-bold text-sm text-amber-400 border-b border-neutral-800 flex items-center justify-between">
                        <span>{section.title}</span>
                      </div>

                      <div className="divide-y divide-neutral-850">
                        {sectionQuestions.map((q) => {
                          const val = selectedSubmission.answers[q.id];
                          let displayVal = val;
                          if (Array.isArray(val)) displayVal = val.join('، ');
                          if (q.unit && typeof val === 'number') displayVal = `${val} ${q.unit}`;

                          return (
                            <div
                              key={q.id}
                              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs sm:text-sm"
                            >
                              <span className="text-neutral-400 font-semibold sm:w-1/3">
                                {q.label}
                              </span>
                              <div className="sm:w-2/3 text-white font-medium break-words">
                                {q.type === 'url' && typeof val === 'string' && val.startsWith('http') ? (
                                  <a
                                    href={val}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-amber-400 underline flex items-center gap-1 inline-flex"
                                  >
                                    <span>فتح الرابط المرفق (InBody / صور)</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                ) : (
                                  <span>{String(displayVal)}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coach Private Notes */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2">
                <label className="block text-xs font-bold text-amber-400">
                  ملاحظات كابتن كريم الخاصة على المتدرب (خاصة بك ولا يراها المتدرب):
                </label>
                <textarea
                  rows={3}
                  value={coachNotes}
                  placeholder="مثال: بدأنا خطة 2400 سعرة، تركيز على عضلة الكتف والظهر، المتابعة القادمة الجمعة..."
                  onChange={(e) => setCoachNotes(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 resize-y"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2 rounded-xl transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ الملاحظات</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 px-3.5 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
                  title="إرسال بيانات الاستمارة إلى إيميلك"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{resendingEmail ? 'جاري الإرسال...' : 'إرسال الاستمارة إلى إيميلي (Gmail)'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3.5 py-2 rounded-xl font-semibold border border-neutral-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة تقرير المتدرب</span>
                </button>
              </div>

              {emailStatusMsg && (
                <div
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                    emailStatusMsg.success
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                  }`}
                >
                  {emailStatusMsg.text}
                </div>
              )}

              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-xs text-neutral-400 hover:text-white px-4 py-2 font-medium self-end sm:self-center"
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

function translateStatus(st: string): string {
  switch (st) {
    case 'new':
      return 'جديد';
    case 'contacted':
      return 'تم التواصل';
    case 'active':
      return 'قيد المتابعة';
    case 'archived':
      return 'مؤرشف';
    case 'all':
      return 'الكل';
    default:
      return st;
  }
}

function getStatusBadgeClasses(st: string): string {
  switch (st) {
    case 'new':
      return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
    case 'contacted':
      return 'bg-blue-950/80 text-blue-400 border-blue-800/80';
    case 'active':
      return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
    case 'archived':
      return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    default:
      return 'bg-neutral-800 text-neutral-400 border-neutral-700';
  }
}
