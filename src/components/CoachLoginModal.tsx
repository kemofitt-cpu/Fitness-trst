import { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, X, Check, Dumbbell } from 'lucide-react';

interface CoachLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function CoachLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: CoachLoginModalProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check exact password requested by Coach: Kemo_123
    const inputVal = pin.trim();
    if (inputVal === 'Kemo_123') {
      localStorage.setItem('kemo_coach_mode', 'true');
      setError('');
      setPin('');
      onLoginSuccess();
      onClose();
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-neutral-400 hover:text-white p-1 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 transition-colors"
          title="إلغاء"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-lg shadow-amber-500/10">
            <Lock className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-black text-white flex items-center justify-center gap-2">
            <span>لوحة تحكم كابتن كريم</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            خاصة بالكوتش فقط لإدارة الأسئلة ومراجعة ردود واشتراكات المتدربين.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              كلمة مرور الكوتش:
            </label>
            <div className="relative">
              <input
                id="input-coach-pin"
                type={showPin ? 'text' : 'password'}
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="أدخل كلمة المرور"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl py-3 px-4 pl-12 text-sm focus:outline-none text-center font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1"
                tabIndex={-1}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-400 mt-1.5 font-medium text-center">
                {error}
              </p>
            )}
          </div>

          <button
            id="btn-submit-coach-login"
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            <KeyRound className="w-4 h-4" />
            <span>دخول لوحة التحكم</span>
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-neutral-800 text-center">
          <p className="text-[11px] text-neutral-500">
            إذا كنت متدرباً، اضغط على زر الإغلاق ✕ لتعبئة استمارتك مباشرة.
          </p>
        </div>

      </div>
    </div>
  );
}
