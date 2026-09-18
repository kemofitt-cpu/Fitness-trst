import {
  Dumbbell,
  FileText,
  Settings,
  Users,
  Copy,
  Check,
  Lock,
  LogOut,
  Sparkles,
  Link as LinkIcon,
  Shield,
  Mail,
} from 'lucide-react';
import { useState } from 'react';
import { getPublicShareUrl, getCoachDirectUrl } from '../utils/urlHelper.ts';

interface NavbarProps {
  currentTab: 'client' | 'builder' | 'submissions' | 'settings';
  onTabChange: (tab: 'client' | 'builder' | 'submissions' | 'settings') => void;
  submissionsCount: number;
  coachEmail: string;
  isCoachMode: boolean;
  onOpenCoachLogin: () => void;
  onExitCoachMode: () => void;
}

export default function Navbar({
  currentTab,
  onTabChange,
  submissionsCount,
  coachEmail,
  isCoachMode,
  onOpenCoachLogin,
  onExitCoachMode,
}: NavbarProps) {
  const [copiedTrainee, setCopiedTrainee] = useState(false);
  const [copiedCoach, setCopiedCoach] = useState(false);

  // Clean public URL without coach query parameters for trainees (never 401)
  const handleCopyTraineeLink = () => {
    const publicUrl = getPublicShareUrl();
    navigator.clipboard.writeText(publicUrl);
    setCopiedTrainee(true);
    setTimeout(() => setCopiedTrainee(false), 2500);
  };

  // Direct Coach link with ?coach=true
  const handleCopyCoachLink = () => {
    const coachUrl = getCoachDirectUrl();
    navigator.clipboard.writeText(coachUrl);
    setCopiedCoach(true);
    setTimeout(() => setCopiedCoach(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md">
      
      {/* If in Coach Mode, show a distinct high-visibility coach status bar */}
      {isCoachMode && (
        <div className="bg-amber-500 text-neutral-950 px-4 py-1.5 text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="bg-neutral-950 text-amber-400 px-2 py-0.5 rounded text-[11px] font-black">
              وضع الكوتش 👑
            </span>
            <span className="hidden sm:inline">
              أنت الآن في لوحة التحكم الخاصة بكابتن كريم (المتدربون لا يرون هذه اللوحة أبداً)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTraineeLink}
              className="bg-neutral-950/90 hover:bg-neutral-950 text-amber-300 hover:text-white px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all"
              title="انسخ هذا الرابط وأرسله للمتدربين"
            >
              {copiedTrainee ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedTrainee ? 'تم نسخ رابط المتدربين!' : 'نسخ رابط المتدربين'}</span>
            </button>

            <button
              onClick={handleCopyCoachLink}
              className="bg-neutral-950/20 hover:bg-neutral-950/30 text-neutral-950 px-2.5 py-1 rounded text-[11px] font-bold hidden md:flex items-center gap-1 transition-all"
              title="رابط سريع لفتح لوحة التحكم مباشرة"
            >
              {copiedCoach ? <Check className="w-3 h-3 text-emerald-800" /> : <LinkIcon className="w-3 h-3" />}
              <span>{copiedCoach ? 'تم نسخ رابط الكوتش!' : 'رابط لوحتك السريع'}</span>
            </button>

            <button
              onClick={onExitCoachMode}
              className="bg-neutral-900 hover:bg-red-950 text-neutral-200 hover:text-red-300 px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all"
              title="قفل لوحة التحكم والرجوع لواجهة المتدرب"
            >
              <LogOut className="w-3 h-3" />
              <span>قفل اللوحة (وضع المتدرب)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Coach Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-white">
                  KEMO FITT
                </span>
                <span className="text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  كابتن كريم
                </span>
              </div>
              <p className="text-xs text-neutral-400 hidden sm:block">
                استمارة تقييم واشتراك التدريب والتغذية أونلاين
              </p>
            </div>
          </div>

          {/* Navigation Tabs - VISIBLE ONLY TO COACH */}
          {isCoachMode ? (
            <nav className="flex items-center gap-1 sm:gap-2 bg-neutral-900/80 p-1.5 rounded-xl border border-neutral-800/80">
              <button
                id="tab-client-form"
                onClick={() => onTabChange('client')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  currentTab === 'client'
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
                title="معاينة الفورم كما يراه المتدرب"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">معاينة</span>
                <span>الاستمارة</span>
              </button>

              <button
                id="tab-form-builder"
                onClick={() => onTabChange('builder')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  currentTab === 'builder'
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>تعديل الأسئلة</span>
              </button>

              <button
                id="tab-submissions"
                onClick={() => onTabChange('submissions')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${
                  currentTab === 'submissions'
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>الردود</span>
                {submissionsCount > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    currentTab === 'submissions' ? 'bg-neutral-950 text-amber-400' : 'bg-amber-500 text-neutral-950'
                  }`}>
                    {submissionsCount}
                  </span>
                )}
              </button>

              <button
                id="tab-settings"
                onClick={() => onTabChange('settings')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all ${
                  currentTab === 'settings'
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
                title="إعدادات وصول الردود والبريد الإلكتروني"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">الإيميل</span>
              </button>
            </nav>
          ) : (
            /* TRAINEE VIEW: Simple, Clean, Non-Editable Header with subtle Coach login button */
            <div className="flex items-center gap-3">
              <button
                id="btn-coach-login-header"
                onClick={onOpenCoachLogin}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 bg-neutral-900/60 hover:bg-neutral-850 border border-neutral-800/70 px-3 py-2 rounded-xl transition-all font-medium"
                title="لوحة تحكم كابتن كريم الخاصة"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500/80" />
                <span>دخول الكوتش</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
