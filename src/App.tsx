import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.tsx';
import ClientForm from './components/ClientForm.tsx';
import FormBuilder from './components/FormBuilder.tsx';
import SubmissionsList from './components/SubmissionsList.tsx';
import SettingsView from './components/SettingsView.tsx';
import CoachLoginModal from './components/CoachLoginModal.tsx';
import { FormSchema, ClientSubmission } from './types.ts';
import { DEFAULT_FORM_SCHEMA } from './defaultSchema.ts';
import { fetchFormSchema, fetchSubmissions } from './api.ts';
import { Dumbbell, ShieldCheck, Lock, LogOut } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'client' | 'builder' | 'submissions' | 'settings'>('client');
  const [schema, setSchema] = useState<FormSchema>(DEFAULT_FORM_SCHEMA);
  const [submissions, setSubmissions] = useState<ClientSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Coach authentication mode state: strictly requires password (stored in localStorage after entering Kemo_123)
  const [isCoachMode, setIsCoachMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kemo_coach_mode') === 'true';
    }
    return false;
  });

  const [showCoachLoginModal, setShowCoachLoginModal] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return (
        urlParams.get('coach') === 'true' ||
        urlParams.get('coach') === '1' ||
        urlParams.get('admin') === 'true'
      );
    }
    return false;
  });

  // Load initial data
  const loadData = async () => {
    try {
      const [schemaData, subsData] = await Promise.all([
        fetchFormSchema().catch(() => DEFAULT_FORM_SCHEMA),
        fetchSubmissions().catch(() => []),
      ]);
      setSchema(schemaData);
      setSubmissions(subsData);
    } catch (err) {
      console.error('Initial load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Ensure non-coaches are strictly restricted to client tab
  useEffect(() => {
    if (!isCoachMode && currentTab !== 'client') {
      setCurrentTab('client');
    }
  }, [isCoachMode, currentTab]);

  const handleRefreshSubmissions = async () => {
    try {
      const subs = await fetchSubmissions();
      setSubmissions(subs);
    } catch (err) {
      console.error('Failed to refresh submissions:', err);
    }
  };

  const handleSchemaUpdated = (newSchema: FormSchema) => {
    setSchema(newSchema);
  };

  const handleExitCoachMode = () => {
    localStorage.removeItem('kemo_coach_mode');
    setIsCoachMode(false);
    setCurrentTab('client');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
          <Dumbbell className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">كابتن كريم &bull; KEMO FITT</h2>
        <p className="text-xs text-neutral-400">جاري تجهيز استمارة التدريب...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Header Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        submissionsCount={submissions.length}
        coachEmail={schema.coachEmail || 'kemofitt@gmail.com'}
        isCoachMode={isCoachMode}
        onOpenCoachLogin={() => setShowCoachLoginModal(true)}
        onExitCoachMode={handleExitCoachMode}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {/* Trainees only ever see the client form. Coaches can view any tab */}
        {(!isCoachMode || currentTab === 'client') && (
          <ClientForm
            schema={schema}
            onGoToSubmissions={() => {
              if (isCoachMode) {
                setCurrentTab('submissions');
              }
            }}
          />
        )}

        {isCoachMode && currentTab === 'builder' && (
          <FormBuilder
            schema={schema}
            onSchemaUpdated={handleSchemaUpdated}
            onPreview={() => setCurrentTab('client')}
          />
        )}

        {isCoachMode && currentTab === 'submissions' && (
          <SubmissionsList
            submissions={submissions}
            schema={schema}
            onRefresh={handleRefreshSubmissions}
          />
        )}

        {isCoachMode && currentTab === 'settings' && (
          <SettingsView
            schema={schema}
            onUpdateEmail={(email) => setSchema((prev) => ({ ...prev, coachEmail: email }))}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-300">كابتن كريم &bull; Kemo Fitt</span>
            <span>&bull;</span>
            <span>استمارة تقييم وتغذية المتدربين أونلاين</span>
          </div>

          <div className="flex items-center gap-4">
            {isCoachMode ? (
              <>
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <span>أنت في وضع الكوتش</span>
                </span>
                <span>&bull;</span>
                <button
                  onClick={() => setCurrentTab('builder')}
                  className="text-neutral-400 hover:text-amber-400 transition-colors"
                >
                  تعديل الأسئلة
                </button>
                <button
                  onClick={() => setCurrentTab('submissions')}
                  className="text-neutral-400 hover:text-amber-400 transition-colors"
                >
                  الردود ({submissions.length})
                </button>
                <span>&bull;</span>
                <button
                  onClick={handleExitCoachMode}
                  className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>قفل اللوحة</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 text-neutral-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>بياناتك في سرية تامة وتصل للكابتن مباشرة</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Coach PIN Login Modal */}
      <CoachLoginModal
        isOpen={showCoachLoginModal}
        onClose={() => setShowCoachLoginModal(false)}
        onLoginSuccess={() => {
          setIsCoachMode(true);
          setCurrentTab('submissions');
        }}
      />

    </div>
  );
}
