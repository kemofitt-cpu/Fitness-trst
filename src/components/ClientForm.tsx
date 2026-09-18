import { useState, useId } from 'react';
import {
  Dumbbell,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Send,
  MessageCircle,
  FileCheck,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { FormSchema, SectionItem, QuestionItem } from '../types.ts';
import { submitClientForm } from '../api.ts';

interface ClientFormProps {
  schema: FormSchema;
  onGoToSubmissions?: () => void;
}

export default function ClientForm({ schema }: ClientFormProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    submissionId?: string;
    coachEmail?: string;
    whatsappUrl?: string;
    clientName?: string;
  } | null>(null);

  const currentSection: SectionItem | undefined = schema.sections[currentSectionIndex];
  const totalSections = schema.sections.length;
  const progressPercent = Math.round(((currentSectionIndex + 1) / totalSections) * 100);

  // Field change handler
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[questionId];
        return copy;
      });
    }
  };

  // Checkbox toggle handler
  const handleCheckboxToggle = (questionId: string, option: string) => {
    const currentList: string[] = Array.isArray(answers[questionId])
      ? [...answers[questionId]]
      : [];
    const index = currentList.indexOf(option);
    if (index > -1) {
      currentList.splice(index, 1);
    } else {
      currentList.push(option);
    }
    handleAnswerChange(questionId, currentList);
  };

  // Validation for the current section
  const validateCurrentSection = (): boolean => {
    if (!currentSection) return true;
    const newErrors: Record<string, string> = {};

    for (const q of currentSection.questions) {
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === null || val === '') {
          newErrors[q.id] = 'هذا الحقل مطلوب';
        } else if (Array.isArray(val) && val.length === 0) {
          newErrors[q.id] = 'يرجى اختيار خيار واحد على الأقل';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (!validateCurrentSection()) {
      // scroll to first error
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentSection()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const clientName = answers['full_name'] || answers['name'] || '';
      const clientPhone = answers['phone_number'] || answers['phone'] || '';
      const clientEmail = answers['client_email'] || answers['email'] || '';
      const clientGoal = answers['primary_goal'] || answers['goal'] || '';

      const res = await submitClientForm({
        answers,
        clientName,
        clientPhone,
        clientEmail,
        clientGoal,
      });

      setSubmitResult({
        success: true,
        submissionId: res.submissionId,
        coachEmail: res.coachEmail,
        whatsappUrl: res.whatsappUrl,
        clientName: res.clientName || clientName,
      });
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الإرسال');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to submit another
  const handleResetForm = () => {
    setAnswers({});
    setErrors({});
    setCurrentSectionIndex(0);
    setSubmitResult(null);
  };

  // Success view
  if (submitResult?.success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-neutral-950 shadow-xl shadow-amber-500/25 animate-bounce">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            تم استلام استمارتك بنجاح!
          </h2>

          <p className="text-neutral-300 text-sm sm:text-base mb-6 leading-relaxed">
            شكراً يا <strong className="text-amber-400">{submitResult.clientName || 'بطل'}</strong>، تم إرسال جميع إجاباتك وبياناتك إلى كابتن كريم على البريد الإلكتروني:
            <br />
            <span className="inline-block mt-2 font-mono text-xs sm:text-sm bg-neutral-950 text-amber-300 px-3 py-1.5 rounded-lg border border-neutral-800">
              {submitResult.coachEmail || schema.coachEmail || 'kemofitt@gmail.com'}
            </span>
          </p>

          {/* Quick instructions & WhatsApp Call to Action */}
          <div className="bg-neutral-950 border border-neutral-800/90 rounded-xl p-5 mb-8 text-right space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>الخطوة التالية لبدء برنامجك فوراً:</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              اضغط على الزر الأخضر بالأسفل للتواصل المباشر مع كابتن كريم على الواتساب وتأكيد إرسال الفورم لبدء تجهيز دايتك وجدول تمرينك بدون أي تأخير.
            </p>
            {submitResult.whatsappUrl && (
              <a
                id="btn-whatsapp-confirm"
                href={submitResult.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-3 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-950/50"
              >
                <MessageCircle className="w-5 h-5" />
                <span>إبلاغ كابتن كريم عبر واتساب الآن</span>
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-print-summary"
              onClick={() => window.print()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-neutral-700 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ ملخص الإجابات</span>
            </button>
            <button
              id="btn-fill-another"
              onClick={handleResetForm}
              className="w-full sm:w-auto text-neutral-400 hover:text-white px-5 py-2.5 text-xs sm:text-sm font-medium transition-colors"
            >
              تعبئة استمارة أخرى
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      
      {/* Hero Coach Header */}
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>{schema.coachTitle || 'تدريب وتغذية رياضية معتمدة'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {schema.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 font-medium">
              {schema.subtitle}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 bg-neutral-950/60 p-3 sm:p-4 rounded-2xl border border-neutral-800/80 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-neutral-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>الوقت المتوقع: 5 دقائق</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>بياناتك في سرية تامة</span>
            </div>
          </div>
        </div>

        {schema.description && (
          <p className="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/80 pt-4">
            {schema.description}
          </p>
        )}
      </div>

      {/* Progress & Section Indicators */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="text-amber-400">
            القسم {currentSectionIndex + 1} من {totalSections}: {currentSection?.title}
          </span>
          <span className="text-neutral-400">{progressPercent}% مكتمل</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Section Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
          {schema.sections.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => {
                if (idx < currentSectionIndex || validateCurrentSection()) {
                  setCurrentSectionIndex(idx);
                }
              }}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                idx === currentSectionIndex
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : idx < currentSectionIndex
                  ? 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                  : 'bg-neutral-950 text-neutral-600 cursor-not-allowed'
              }`}
            >
              <span>{idx + 1}.</span>
              <span>{sec.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Section Card */}
      {currentSection && (
        <form onSubmit={handleSubmit} className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Section Header */}
          <div className="border-b border-neutral-800 pb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-6 bg-amber-500 rounded-full" />
              <span>{currentSection.title}</span>
            </h2>
            {currentSection.description && (
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                {currentSection.description}
              </p>
            )}
          </div>

          {/* Questions Container */}
          <div className="space-y-6">
            {currentSection.questions.map((question) => (
              <QuestionInputRenderer
                key={question.id}
                question={question}
                value={answers[question.id]}
                error={errors[question.id]}
                onChange={(val) => handleAnswerChange(question.id, val)}
                onCheckboxToggle={(opt) => handleCheckboxToggle(question.id, opt)}
              />
            ))}
          </div>

          {/* Navigation & Submit Buttons */}
          <div className="border-t border-neutral-800 pt-6 flex items-center justify-between gap-4">
            {currentSectionIndex > 0 ? (
              <button
                type="button"
                id="btn-prev-section"
                onClick={handlePrev}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs sm:text-sm transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
            ) : <div />}

            {currentSectionIndex < totalSections - 1 ? (
              <button
                type="button"
                id="btn-next-section"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                <span>التالي: {schema.sections[currentSectionIndex + 1]?.title.split(' ')[0]}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                id="btn-submit-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-extrabold text-sm sm:text-base transition-all shadow-xl shadow-amber-500/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>جاري الإرسال والإشعار...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 stroke-[2.5]" />
                    <span>تأكيد وإرسال الاستمارة لكابتن كريم</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      )}

    </div>
  );
}

// ----------------- Individual Question Input Renderer ----------------- //

interface QuestionRendererProps {
  question: QuestionItem;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  onCheckboxToggle: (option: string) => void;
}

function QuestionInputRenderer({
  question,
  value,
  error,
  onChange,
  onCheckboxToggle,
}: QuestionRendererProps) {
  const inputId = useId();

  return (
    <div className={`space-y-2 p-3 sm:p-4 rounded-2xl transition-all ${error ? 'bg-red-950/20 border border-red-500/40' : 'bg-neutral-950/40 border border-neutral-800/60'}`}>
      
      {/* Question Label */}
      <div className="flex items-start justify-between gap-2">
        <label htmlFor={inputId} className="block text-sm sm:text-base font-bold text-neutral-200">
          <span>{question.label}</span>
          {question.required && <span className="text-red-400 mr-1">*</span>}
        </label>
        {question.unit && (
          <span className="text-xs bg-neutral-800 text-amber-400 font-bold px-2 py-0.5 rounded-md">
            {question.unit}
          </span>
        )}
      </div>

      {question.description && (
        <p className="text-xs text-neutral-400 leading-normal">
          {question.description}
        </p>
      )}

      {/* Text / Tel / Email / URL */}
      {(question.type === 'text' ||
        question.type === 'tel' ||
        question.type === 'email' ||
        question.type === 'url') && (
        <input
          id={inputId}
          type={question.type}
          value={value || ''}
          placeholder={question.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-neutral-900 border rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
            error ? 'border-red-500' : 'border-neutral-800 focus:border-amber-500'
          }`}
        />
      )}

      {/* Number */}
      {question.type === 'number' && (
        <div className="relative">
          <input
            id={inputId}
            type="number"
            min={question.min}
            max={question.max}
            step="any"
            value={value !== undefined ? value : ''}
            placeholder={question.placeholder}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            className={`w-full bg-neutral-900 border rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
              error ? 'border-red-500' : 'border-neutral-800 focus:border-amber-500'
            }`}
          />
          {question.unit && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none font-bold">
              {question.unit}
            </div>
          )}
        </div>
      )}

      {/* Textarea */}
      {question.type === 'textarea' && (
        <textarea
          id={inputId}
          rows={3}
          value={value || ''}
          placeholder={question.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-neutral-900 border rounded-xl p-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-y ${
            error ? 'border-red-500' : 'border-neutral-800 focus:border-amber-500'
          }`}
        />
      )}

      {/* Select Dropdown */}
      {question.type === 'select' && (
        <select
          id={inputId}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-neutral-900 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
            error ? 'border-red-500' : 'border-neutral-800 focus:border-amber-500'
          }`}
        >
          <option value="">-- اختر من القائمة --</option>
          {question.options?.map((opt) => (
            <option key={opt} value={opt} className="bg-neutral-900 text-white">
              {opt}
            </option>
          ))}
        </select>
      )}

      {/* Radio Cards */}
      {question.type === 'radio' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {question.options?.map((opt) => {
            const isSelected = value === opt;
            return (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                    : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={opt}
                  checked={isSelected}
                  onChange={() => onChange(opt)}
                  className="w-4 h-4 text-amber-500 focus:ring-amber-500 focus:ring-offset-neutral-900 bg-neutral-950 border-neutral-700"
                />
                <span className="text-xs sm:text-sm font-medium leading-snug">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Multi-Select Checkboxes */}
      {question.type === 'checkbox' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {question.options?.map((opt) => {
            const currentList: string[] = Array.isArray(value) ? value : [];
            const isChecked = currentList.includes(opt);
            return (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-amber-500/10 border-amber-500/80 text-white'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onCheckboxToggle(opt)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 focus:ring-offset-neutral-900 bg-neutral-950 border-neutral-700"
                />
                <span className="text-xs sm:text-sm">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold pt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

    </div>
  );
}
