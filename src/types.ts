export type QuestionType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'tel'
  | 'email'
  | 'url';

export interface QuestionItem {
  id: string;
  label: string;
  description?: string;
  placeholder?: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  unit?: string;
  min?: number;
  max?: number;
}

export interface SectionItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  questions: QuestionItem[];
}

export interface CoachSettings {
  coachName: string;
  coachTitle: string;
  coachEmail: string;
  coachPhone: string;
  smtpConfigured: boolean;
  emailService: 'smtp' | 'resend' | 'formsubmit' | 'simulation';
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

export interface FormSchema {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  coachName: string;
  coachTitle: string;
  coachEmail: string;
  coachPhone: string;
  coachBio?: string;
  successMessage: string;
  sections: SectionItem[];
  updatedAt: string;
}

export interface ClientSubmission {
  id: string;
  createdAt: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientGoal?: string;
  status: 'new' | 'contacted' | 'active' | 'archived';
  answers: Record<string, any>;
  coachNotes?: string;
  emailSent: boolean;
  emailStatus?: string;
}
