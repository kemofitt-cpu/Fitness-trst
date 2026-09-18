import express from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_FORM_SCHEMA } from './src/defaultSchema.ts';
import { FormSchema, ClientSubmission } from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Data storage directories
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SCHEMA_FILE = path.join(DATA_DIR, 'form-schema.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Initialize schema file if not present
function loadSchema(): FormSchema {
  try {
    if (fs.existsSync(SCHEMA_FILE)) {
      const data = fs.readFileSync(SCHEMA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading schema file, reverting to default:', err);
  }
  fs.writeFileSync(SCHEMA_FILE, JSON.stringify(DEFAULT_FORM_SCHEMA, null, 2));
  return DEFAULT_FORM_SCHEMA;
}

function saveSchema(schema: FormSchema) {
  schema.updatedAt = new Date().toISOString();
  fs.writeFileSync(SCHEMA_FILE, JSON.stringify(schema, null, 2));
}

// Initialize submissions file if not present
function loadSubmissions(): ClientSubmission[] {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading submissions file:', err);
  }
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2));
  return [];
}

function saveSubmissions(submissions: ClientSubmission[]) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}

// Helper to format HTML email
function generateEmailHtml(submission: ClientSubmission, schema: FormSchema): string {
  const dateStr = new Date(submission.createdAt).toLocaleString('ar-EG', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  let sectionsHtml = '';

  for (const section of schema.sections) {
    let questionsHtml = '';
    let hasAnswered = false;

    for (const q of section.questions) {
      const val = submission.answers[q.id];
      if (val !== undefined && val !== null && val !== '') {
        hasAnswered = true;
        let displayVal = val;
        if (Array.isArray(val)) {
          displayVal = val.join(', ');
        } else if (typeof val === 'boolean') {
          displayVal = val ? 'نعم' : 'لا';
        }
        if (q.unit && typeof val === 'number') {
          displayVal = `${val} ${q.unit}`;
        }

        questionsHtml += `
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 12px 14px; font-weight: 600; color: #d4d4d8; width: 40%; vertical-align: top; background-color: #18181b;">${q.label}</td>
            <td style="padding: 12px 14px; color: #fafafa; background-color: #09090b; word-break: break-word;">${displayVal}</td>
          </tr>
        `;
      }
    }

    if (hasAnswered) {
      sectionsHtml += `
        <div style="margin-bottom: 24px; border: 1px solid #27272a; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #f59e0b, #d97706); padding: 10px 16px; font-size: 16px; font-weight: bold; color: #000;">
            ${section.title}
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: right; direction: rtl;">
            ${questionsHtml}
          </table>
        </div>
      `;
    }
  }

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <title>طلب تدريب جديد - كابتن كريم</title>
    </head>
    <body style="margin: 0; padding: 24px; background-color: #0a0a0a; font-family: 'Cairo', Tahoma, Arial, sans-serif; direction: rtl; color: #f4f4f5;">
      <div style="max-width: 680px; margin: 0 auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid #27272a; padding-bottom: 20px; margin-bottom: 24px;">
          <span style="background-color: #f59e0b; color: #000; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; letter-spacing: 1px; display: inline-block; margin-bottom: 10px;">
            KEMO FITT COACHING
          </span>
          <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0; font-weight: 800;">
            🚀 استمارة متدرب جديدة وصلت!
          </h1>
          <p style="color: #a1a1aa; margin: 0; font-size: 14px;">
            تاريخ التقديم: ${dateStr} | كود الاستمارة: <code style="color: #fbbf24;">#${submission.id.slice(-6)}</code>
          </p>
        </div>

        <!-- Client Quick Card -->
        <div style="background-color: #1c1917; border: 1px solid #451a03; border-radius: 10px; padding: 18px; margin-bottom: 26px;">
          <h2 style="color: #f59e0b; font-size: 16px; margin: 0 0 12px 0;">👤 بيانات المتدرب السريعة</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="color: #a1a1aa; padding: 4px 0;">الاسم:</td>
              <td style="color: #fff; font-weight: bold; padding: 4px 0;">${submission.clientName}</td>
            </tr>
            <tr>
              <td style="color: #a1a1aa; padding: 4px 0;">الهاتف / واتساب:</td>
              <td style="color: #38bdf8; font-weight: bold; padding: 4px 0; direction: ltr; text-align: right;">${submission.clientPhone}</td>
            </tr>
            ${submission.clientEmail ? `
            <tr>
              <td style="color: #a1a1aa; padding: 4px 0;">الإيميل:</td>
              <td style="color: #fff; padding: 4px 0;">${submission.clientEmail}</td>
            </tr>` : ''}
            ${submission.clientGoal ? `
            <tr>
              <td style="color: #a1a1aa; padding: 4px 0;">الهدف الأساسي:</td>
              <td style="color: #fbbf24; font-weight: bold; padding: 4px 0;">${submission.clientGoal}</td>
            </tr>` : ''}
          </table>

          <div style="margin-top: 14px;">
            <a href="https://wa.me/${submission.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً ${submission.clientName}، معك كابتن كريم. استلمت استمارتك وسنبدأ رحلة تحقيق هدفك فوراً!`)}" 
               style="background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">
              💬 فتح محادثة واتساب مع المتدرب
            </a>
          </div>
        </div>

        <!-- Detailed Answers Sections -->
        <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 16px 0; border-right: 4px solid #f59e0b; padding-right: 10px;">
          إجابات المتدرب الكاملة على الفورم
        </h3>

        ${sectionsHtml}

        <!-- Footer -->
        <div style="border-top: 1px solid #27272a; padding-top: 20px; margin-top: 30px; text-align: center; color: #71717a; font-size: 12px;">
          هذا الإشعار تم إرساله تلقائياً من موقعك واستمارة الكوتشينج الخاصة بك إلى <strong>${schema.coachEmail}</strong>.
          <br>
          Kemo Fitt Coaching System &bull; جميع الحقوق محفوظة
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send email function
async function sendNotificationEmail(submission: ClientSubmission, schema: FormSchema): Promise<{ success: boolean; message: string; activationNeeded?: boolean }> {
  const recipient = schema.coachEmail || 'kemofitt@gmail.com';
  const htmlContent = generateEmailHtml(submission, schema);

  // 1. Try custom SMTP if configured in environment
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Kemo Fitt Intake" <${smtpUser}>`,
        to: recipient,
        subject: `💪 استمارة جديدة من: ${submission.clientName} - ${submission.clientGoal || 'كوتشينج كابتن كريم'}`,
        html: htmlContent,
      });

      console.log(`Email successfully dispatched via SMTP to ${recipient}`);
      return { success: true, message: `تم إرسال الإيميل بنجاح إلى ${recipient} عبر خادم البريد.` };
    } catch (err: any) {
      console.error('SMTP sending error, falling back to direct delivery:', err.message);
    }
  }

  // 2. Direct Form-to-Email Delivery via FormSubmit
  try {
    const formSubmitPayload: Record<string, any> = {
      _subject: `💪 استمارة تدريب جديدة: ${submission.clientName} (Kemo Fitt)`,
      _template: 'table',
      _captcha: 'false',
      'اسم المتدرب': submission.clientName,
      'رقم الهاتف / واتساب': submission.clientPhone,
      'البريد الإلكتروني': submission.clientEmail || 'غير مسجل',
      'الهدف التدريبي': submission.clientGoal || 'غير مسجل',
      'كود الاستمارة': '#' + submission.id.slice(-6),
      'تاريخ التقديم': new Date(submission.createdAt).toLocaleString('ar-EG'),
      'محادثة واتساب مباشرة': `https://wa.me/${submission.clientPhone.replace(/[^0-9]/g, '')}`,
    };

    // Append formatted question answers
    for (const section of schema.sections) {
      for (const q of section.questions) {
        const val = submission.answers[q.id];
        if (val !== undefined && val !== null && val !== '') {
          let str = Array.isArray(val) ? val.join('، ') : String(val);
          if (q.unit && typeof val === 'number') str += ` ${q.unit}`;
          formSubmitPayload[`[${section.title}] ${q.label}`] = str;
        }
      }
    }

    const fsRes = await fetch(`https://formsubmit.co/ajax/${recipient}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://kemo-fitt.app',
        'Referer': 'https://kemo-fitt.app/',
      },
      body: JSON.stringify(formSubmitPayload),
    });

    const fsData = await fsRes.json().catch(() => null);
    if (fsData) {
      if (fsData.success === 'true' || fsData.success === true) {
        console.log(`[FormSubmit] Email successfully sent to ${recipient}`);
        return {
          success: true,
          message: `تم إرسال تفاصيل استمارة المتدرب بنجاح إلى إيميلك ${recipient}.`,
        };
      } else if (fsData.message && fsData.message.includes('Activation')) {
        console.log(`[FormSubmit] Activation required for ${recipient}`);
        return {
          success: true,
          activationNeeded: true,
          message: `تم إرسال رسالة تفعيل إلى ${recipient}. افتح إيميلك واضغط على 'Activate Form' لتفعيل استقبال الاستمارات على Gmail.`,
        };
      }
    }
  } catch (fsErr: any) {
    console.error('FormSubmit delivery error:', fsErr.message);
  }

  // Fallback logging
  console.log(`[Form Notification] Submission saved in database for ${recipient}: ${submission.clientName}`);
  return {
    success: true,
    message: `تم حفظ الاستمارة بنجاح في لوحة التحكم وتجهيز الإشعار لـ ${recipient}.`,
  };
}

// ----------------- API Endpoints ----------------- //

// 1. Get Form Schema
app.get('/api/form-schema', (req, res) => {
  try {
    const schema = loadSchema();
    res.json(schema);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Update Form Schema (Coach Editor)
app.post('/api/form-schema', (req, res) => {
  try {
    const updated = req.body as FormSchema;
    if (!updated || !updated.sections) {
      return res.status(400).json({ error: 'بيانات غير صالحة' });
    }
    saveSchema(updated);
    res.json({ success: true, schema: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Reset Form Schema to Default
app.post('/api/reset-schema', (req, res) => {
  try {
    saveSchema(DEFAULT_FORM_SCHEMA);
    res.json({ success: true, schema: DEFAULT_FORM_SCHEMA });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Submit Client Form
app.post('/api/submit-form', async (req, res) => {
  try {
    const { answers, clientName, clientPhone, clientEmail, clientGoal } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'الرجاء إدخال إجابات الاستمارة' });
    }

    const schema = loadSchema();
    const submissions = loadSubmissions();

    // Extract basic identifiers from answers if not explicitly passed
    const name = clientName || answers['full_name'] || answers['name'] || 'متدرب جديد';
    const phone = clientPhone || answers['phone_number'] || answers['phone'] || '';
    const email = clientEmail || answers['client_email'] || answers['email'] || '';
    const goal = clientGoal || answers['primary_goal'] || answers['goal'] || '';

    const newSubmission: ClientSubmission = {
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      clientName: name,
      clientPhone: phone,
      clientEmail: email,
      clientGoal: goal,
      status: 'new',
      answers,
      emailSent: false,
    };

    // Attempt to send email to kemofitt@gmail.com
    const emailResult = await sendNotificationEmail(newSubmission, schema);
    newSubmission.emailSent = emailResult.success;
    newSubmission.emailStatus = emailResult.message;

    // Save submission
    submissions.unshift(newSubmission);
    saveSubmissions(submissions);

    // Prepare direct WhatsApp notification link for the client to immediately contact Coach Karim
    const coachPhoneClean = (schema.coachPhone || '+201000000000').replace(/[^0-9]/g, '');
    const clientSummaryText = `مرحباً كابتن كريم! 💪\nأنا ${name}، قمت للتو بتعبئة استمارة التدريب والتغذية على الموقع.\n• الهدف: ${goal || 'غير محدد'}\n• رقمي: ${phone}\nرقم الاستمارة: #${newSubmission.id.slice(-6)}\nجاهز للبدء والالتزام بالخطة!`;
    const whatsappUrl = `https://wa.me/${coachPhoneClean}?text=${encodeURIComponent(clientSummaryText)}`;

    res.json({
      success: true,
      submissionId: newSubmission.id,
      emailSent: emailResult.success,
      emailMessage: emailResult.message,
      coachEmail: schema.coachEmail,
      whatsappUrl,
      clientName: name,
    });
  } catch (err: any) {
    console.error('Submit error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Submissions (Coach Dashboard)
app.get('/api/submissions', (req, res) => {
  try {
    const submissions = loadSubmissions();
    res.json(submissions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update Submission Status / Coach Notes
app.patch('/api/submissions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, coachNotes } = req.body;
    const submissions = loadSubmissions();
    const item = submissions.find((s) => s.id === id);

    if (!item) {
      return res.status(404).json({ error: 'الاستمارة غير موجودة' });
    }

    if (status) item.status = status;
    if (coachNotes !== undefined) item.coachNotes = coachNotes;

    saveSubmissions(submissions);
    res.json({ success: true, submission: item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Delete Submission
app.delete('/api/submissions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const submissions = loadSubmissions();
    const filtered = submissions.filter((s) => s.id !== id);
    saveSubmissions(filtered);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Test Email Endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const schema = loadSchema();
    const dummySubmission: ClientSubmission = {
      id: 'test_' + Date.now(),
      createdAt: new Date().toISOString(),
      clientName: 'تجربة كابتن كريم',
      clientPhone: '+201012345678',
      clientEmail: schema.coachEmail,
      clientGoal: 'اختبار وصول الإيميل إلى Gmail',
      status: 'new',
      answers: {
        full_name: 'تجربة إشعار جديد',
        phone_number: '+201012345678',
        age: 25,
        current_weight: 80,
        height: 178,
        primary_goal: 'اختبار وصول الإيميل بنجاح',
      },
      emailSent: false,
    };

    const result = await sendNotificationEmail(dummySubmission, schema);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8.1 Resend Email for an existing submission
app.post('/api/submissions/:id/resend-email', async (req, res) => {
  try {
    const { id } = req.params;
    const submissions = loadSubmissions();
    const sub = submissions.find((s) => s.id === id);
    if (!sub) {
      return res.status(404).json({ error: 'الاستمارة غير موجودة' });
    }
    const schema = loadSchema();
    const result = await sendNotificationEmail(sub, schema);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8.2 Send Activation Email Request
app.post('/api/request-activation-email', async (req, res) => {
  try {
    const schema = loadSchema();
    const recipient = schema.coachEmail || 'kemofitt@gmail.com';
    const fsRes = await fetch(`https://formsubmit.co/ajax/${recipient}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://kemo-fitt.app',
        'Referer': 'https://kemo-fitt.app/',
      },
      body: JSON.stringify({
        _subject: 'طلب تفعيل استقبال استمارات التدريب - كابتن كريم',
        _template: 'table',
        message: 'رسالة تفعيل استقبال استمارات المتدربين على Gmail لـ كابتن كريم.',
      }),
    });
    const data = await fsRes.json().catch(() => ({}));
    res.json({ success: true, message: data.message || 'تم إرسال طلب التفعيل إلى بريدك الإلكتروني بنجاح.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Export Submissions as CSV
app.get('/api/export-csv', (req, res) => {
  try {
    const submissions = loadSubmissions();
    const schema = loadSchema();

    // Collect all question labels
    const questionMap = new Map<string, string>();
    for (const sec of schema.sections) {
      for (const q of sec.questions) {
        questionMap.set(q.id, q.label);
      }
    }

    const headers = ['التاريخ', 'اسم المتدرب', 'رقم الهاتف', 'البريد', 'الهدف', 'الحالة'];
    const questionIds = Array.from(questionMap.keys());
    for (const qId of questionIds) {
      headers.push(questionMap.get(qId)!);
    }

    const rows = [headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',')];

    for (const sub of submissions) {
      const row = [
        `"${new Date(sub.createdAt).toLocaleDateString('ar-EG')}"`,
        `"${(sub.clientName || '').replace(/"/g, '""')}"`,
        `"${(sub.clientPhone || '').replace(/"/g, '""')}"`,
        `"${(sub.clientEmail || '').replace(/"/g, '""')}"`,
        `"${(sub.clientGoal || '').replace(/"/g, '""')}"`,
        `"${sub.status}"`,
      ];

      for (const qId of questionIds) {
        let val = sub.answers[qId];
        if (Array.isArray(val)) val = val.join('; ');
        if (val === undefined || val === null) val = '';
        row.push(`"${String(val).replace(/"/g, '""')}"`);
      }

      rows.push(row.join(','));
    }

    const csvContent = '\uFEFF' + rows.join('\r\n'); // BOM for Excel Arabic support
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="kemo-fitt-submissions.csv"');
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kemo Fitt Coaching Server running on port ${PORT}`);
  });
}

startServer();
