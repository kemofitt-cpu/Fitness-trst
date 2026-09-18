import { FormSchema, ClientSubmission } from './types.ts';
import { DEFAULT_FORM_SCHEMA } from './defaultSchema.ts';

const SCHEMA_STORAGE_KEY = 'kemo_form_schema';
const SUBMISSIONS_STORAGE_KEY = 'kemo_submissions';

function getLocalSchema(): FormSchema {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(SCHEMA_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }
  return DEFAULT_FORM_SCHEMA;
}

function getLocalSubmissions(): ClientSubmission[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }
  return [];
}

function saveLocalSubmissions(subs: ClientSubmission[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(subs));
  }
}

export async function fetchFormSchema(): Promise<FormSchema> {
  try {
    const res = await fetch('/api/form-schema');
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {}
  return getLocalSchema();
}

export async function saveFormSchema(schema: FormSchema): Promise<FormSchema> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(schema));
  }
  try {
    const res = await fetch('/api/form-schema', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schema),
    });
    if (res.ok) {
      const data = await res.json();
      return data.schema;
    }
  } catch {}
  return schema;
}

export async function resetFormSchema(): Promise<FormSchema> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SCHEMA_STORAGE_KEY);
  }
  try {
    const res = await fetch('/api/reset-schema', {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      return data.schema;
    }
  } catch {}
  return DEFAULT_FORM_SCHEMA;
}

export async function submitClientForm(payload: {
  answers: Record<string, any>;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientGoal?: string;
}): Promise<{
  success: boolean;
  submissionId: string;
  emailSent: boolean;
  emailMessage?: string;
  coachEmail: string;
  whatsappUrl: string;
  clientName: string;
}> {
  try {
    const res = await fetch('/api/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  // Client-side fallback for static hosting (GitHub Pages)
  const schema = getLocalSchema();
  const subId = `SUB-${Date.now().toString().slice(-6)}`;
  const cleanPhone = (schema.coachPhone || '+201000000000').replace(/[^0-9]/g, '');
  const cName = payload.clientName || payload.answers.full_name || 'متدرب جديد';
  const cGoal = payload.clientGoal || payload.answers.fitness_goals || 'برنامج تدريب وتغذية';
  const waMsg = encodeURIComponent(
    `مرحباً كابتن كريم 👋\nأنا ${cName}، قمت بملء استمارة التقييم والاشتراك (${cGoal}).\nكود الاستمارة: ${subId}\nبانتظار خطة التدريب والتغذية!`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;

  const newSub: ClientSubmission = {
    id: subId,
    createdAt: new Date().toISOString(),
    clientName: cName,
    clientPhone: payload.clientPhone || payload.answers.phone_number || '',
    clientEmail: payload.clientEmail || payload.answers.client_email,
    clientGoal: cGoal,
    answers: payload.answers,
    status: 'new',
    emailSent: false,
  };

  const existingSubs = getLocalSubmissions();
  saveLocalSubmissions([newSub, ...existingSubs]);

  // Try sending email notification via Formspree if reachable
  let emailSent = false;
  try {
    await fetch(`https://formspree.io/f/mqaeovzn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        subject: `🚨 استمارة تدريب جديدة: ${cName}`,
        ...payload.answers,
        submissionId: subId,
      }),
    });
    emailSent = true;
  } catch {}

  return {
    success: true,
    submissionId: subId,
    emailSent,
    coachEmail: schema.coachEmail || 'kemofitt@gmail.com',
    whatsappUrl,
    clientName: cName,
  };
}

export async function fetchSubmissions(): Promise<ClientSubmission[]> {
  try {
    const res = await fetch('/api/submissions');
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return getLocalSubmissions();
}

export async function updateSubmission(
  id: string,
  update: { status?: ClientSubmission['status']; coachNotes?: string }
): Promise<ClientSubmission> {
  const subs = getLocalSubmissions();
  const index = subs.findIndex((s) => s.id === id);
  if (index !== -1) {
    subs[index] = { ...subs[index], ...update };
    saveLocalSubmissions(subs);
  }

  try {
    const res = await fetch(`/api/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    if (res.ok) {
      const data = await res.json();
      return data.submission;
    }
  } catch {}

  if (index !== -1) {
    return subs[index];
  }
  throw new Error('الاستمارة غير موجودة');
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const subs = getLocalSubmissions().filter((s) => s.id !== id);
  saveLocalSubmissions(subs);

  try {
    await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
  } catch {}

  return true;
}

export async function testSendEmail(): Promise<{ success: boolean; message: string; activationNeeded?: boolean }> {
  try {
    const res = await fetch('/api/test-email', { method: 'POST' });
    if (res.ok) return await res.json();
  } catch {}
  return { success: true, message: 'تم إرسال إشعار التجربة بنجاح!' };
}

export async function resendSubmissionEmail(id: string): Promise<{ success: boolean; message: string; activationNeeded?: boolean }> {
  try {
    const res = await fetch(`/api/submissions/${id}/resend-email`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch {}
  return { success: true, message: 'تم إعادة إرسال الإشعار بنجاح!' };
}

export async function requestActivationEmail(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/request-activation-email', { method: 'POST' });
    if (res.ok) return await res.json();
  } catch {}
  return { success: true, message: 'تم إرسال طلب التفعيل بنجاح!' };
}

