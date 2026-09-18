import { FormSchema, ClientSubmission } from './types.ts';

export async function fetchFormSchema(): Promise<FormSchema> {
  const res = await fetch('/api/form-schema');
  if (!res.ok) {
    throw new Error('فشل تحميل بيانات الاستمارة');
  }
  return res.json();
}

export async function saveFormSchema(schema: FormSchema): Promise<FormSchema> {
  const res = await fetch('/api/form-schema', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schema),
  });
  if (!res.ok) {
    throw new Error('فشل حفظ التعديلات');
  }
  const data = await res.json();
  return data.schema;
}

export async function resetFormSchema(): Promise<FormSchema> {
  const res = await fetch('/api/reset-schema', {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('فشل استعادة الاستمارة الافتراضية');
  }
  const data = await res.json();
  return data.schema;
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
  const res = await fetch('/api/submit-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل إرسال الاستمارة، يرجى المحاولة ثانية');
  }
  return res.json();
}

export async function fetchSubmissions(): Promise<ClientSubmission[]> {
  const res = await fetch('/api/submissions');
  if (!res.ok) {
    throw new Error('فشل جلب الردود');
  }
  return res.json();
}

export async function updateSubmission(
  id: string,
  update: { status?: ClientSubmission['status']; coachNotes?: string }
): Promise<ClientSubmission> {
  const res = await fetch(`/api/submissions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) {
    throw new Error('فشل تحديث الاستمارة');
  }
  const data = await res.json();
  return data.submission;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const res = await fetch(`/api/submissions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('فشل حذف الاستمارة');
  }
  return true;
}

export async function testSendEmail(): Promise<{ success: boolean; message: string; activationNeeded?: boolean }> {
  const res = await fetch('/api/test-email', {
    method: 'POST',
  });
  return res.json();
}

export async function resendSubmissionEmail(id: string): Promise<{ success: boolean; message: string; activationNeeded?: boolean }> {
  const res = await fetch(`/api/submissions/${id}/resend-email`, {
    method: 'POST',
  });
  return res.json();
}

export async function requestActivationEmail(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/request-activation-email', {
    method: 'POST',
  });
  return res.json();
}
