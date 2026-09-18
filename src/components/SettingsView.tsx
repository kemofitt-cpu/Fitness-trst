import { useState } from 'react';
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Send,
  MessageCircle,
  Shield,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import { FormSchema } from '../types.ts';
import { testSendEmail, requestActivationEmail } from '../api.ts';
import { getPublicShareUrl } from '../utils/urlHelper.ts';

interface SettingsViewProps {
  schema: FormSchema;
  onUpdateEmail: (email: string) => void;
}

export default function SettingsView({ schema, onUpdateEmail }: SettingsViewProps) {
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; activationNeeded?: boolean } | null>(null);
  const [sendingActivation, setSendingActivation] = useState(false);
  const [activationResult, setActivationResult] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setTestResult(null);
    try {
      const res = await testSendEmail();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'حدث خطأ أثناء إرسال البريد التجريبي',
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleRequestActivation = async () => {
    setSendingActivation(true);
    setActivationResult(null);
    try {
      const res = await requestActivationEmail();
      setActivationResult(res.message);
    } catch (err: any) {
      setActivationResult(err.message || 'فشل إرسال طلب التفعيل');
    } finally {
      setSendingActivation(false);
    }
  };

  const formUrl = getPublicShareUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Mail className="w-6 h-6 text-amber-500" />
          <span>إعدادات وصول الردود والبريد الإلكتروني</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          إدارة إشعارات الاستمارات إلى بريدك الإلكتروني <span className="text-amber-400 font-mono font-bold">{schema.coachEmail || 'kemofitt@gmail.com'}</span>
        </p>
      </div>

      {/* Activation Instructions Callout Banner */}
      <div className="bg-amber-950/40 border-2 border-amber-500/70 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-white">
              لماذا لم يصلك الإيميل بعد؟ (خطوة تفعيل واحدة فقط)
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              لحماية بريدك من الرسائل العشوائية، ترسل خدمة البريد رسالة تفعيل أمان لمرة واحدة فقط إلى <strong className="text-amber-400 font-mono">{schema.coachEmail || 'kemofitt@gmail.com'}</strong>.
            </p>
          </div>
        </div>

        <div className="bg-neutral-950/80 rounded-2xl p-4 sm:p-5 border border-neutral-800 space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-amber-400">
            خطوات التفعيل خلال 30 ثانية:
          </h3>
          <ol className="list-decimal list-inside text-xs sm:text-sm text-neutral-300 space-y-2 pr-1 leading-relaxed">
            <li>
              افتح تطبيق <strong className="text-white">Gmail</strong> بحسابك (<span className="text-amber-400 font-mono">{schema.coachEmail || 'kemofitt@gmail.com'}</span>).
            </li>
            <li>
              ابحث في <strong className="text-white">صندوق الوارد (Inbox)</strong> أو مجلد <strong className="text-white">الرسائل غير المرغوب فيها (Spam / Junk)</strong> عن رسالة من <strong className="text-white">FormSubmit</strong> بعنوان:
              <br />
              <span className="text-amber-300 font-mono bg-neutral-900 px-2 py-0.5 rounded mt-1 inline-block">
                Action Required: Activate Form
              </span>
            </li>
            <li>
              اضغط على الزر الأخضر داخل الإيميل: <strong className="text-emerald-400 font-bold">[Activate Form]</strong>.
            </li>
            <li>
              <strong className="text-white">مبروك!</strong> بمجرد الضغط عليه، ستصلك كل استمارة يسجلها أي متدرب مباشرة وكاملة إلى بريدك الإلكتروني!
            </li>
          </ol>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleRequestActivation}
            disabled={sendingActivation}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            {sendingActivation ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>إعادة إرسال رسالة التفعيل إلى بريدي الآن</span>
          </button>

          {activationResult && (
            <span className="text-xs text-amber-300 font-semibold bg-neutral-900 px-3 py-2 rounded-xl border border-neutral-800">
              {activationResult}
            </span>
          )}
        </div>
      </div>

      {/* Main Email Box */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              البريد الإلكتروني المستلم
            </span>
            <div className="text-lg sm:text-xl font-mono font-black text-amber-400">
              {schema.coachEmail || 'kemofitt@gmail.com'}
            </div>
            <p className="text-xs text-neutral-400">
              يتم إرسال نسخة من كل استمارة فور ضغط المتدرب على زر التأكيد.
            </p>
          </div>

          <button
            id="btn-test-email"
            onClick={handleTestEmail}
            disabled={testingEmail}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm border border-neutral-700 transition-all disabled:opacity-50"
          >
            {testingEmail ? (
              <>
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>جاري إرسال التجربة...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-amber-400" />
                <span>إرسال تجربة الآن</span>
              </>
            )}
          </button>
        </div>

        {/* Test Result Alert */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
              testResult.success
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/30 border-amber-500/50 text-amber-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold block">
                {testResult.success ? 'حالة الإرسال:' : 'تنبيه الاتصال:'}
              </span>
              <p className="leading-relaxed">{testResult.message}</p>
            </div>
          </div>
        )}

        {/* Multi-Channel Notification Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Mail className="w-4 h-4" />
              <span>إشعار البريد الإلكتروني (Gmail)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              تصلك رسالة مفصلة بتنسيق احترافي تضم اسم المتدرب، رقمه، أهدافه، قياساته، ونظامه الغذائي على بريدك {schema.coachEmail} مع زر مباشر لفتح محادثة واتساب معه فوراً.
            </p>
          </div>

          <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>تحويل واتساب فوري للمتدرب</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              بمجرد ضغط المتدرب على إرسال، يظهر له زر مخصص لتحويله إلى محادثة واتساب معك تلقائياً برسالة جاهزة تحتوي على اسمه وكود الاستمارة لبدء المتابعة دون انقطاع.
            </p>
          </div>

        </div>

        {/* Client Link Share Box */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3">
          <label className="block text-xs font-bold text-neutral-300">
            رابط الاستمارة المباشر لنشره على السوشيال ميديا أو إرساله للمتدربين:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={formUrl}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-300 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-neutral-700 transition-all shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            💡 هذا الرابط العام هو الرابط المتاح لأي شخص على الإنترنت بدون تسجيل دخول وبدون خطأ 401. كما يمكنك دائماً استخدام زر <strong className="text-amber-400">Share</strong> في أعلى واجهة Google AI Studio لمشاركة التطبيق.
          </p>
        </div>

      </div>

    </div>
  );
}
