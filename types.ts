
export enum AppStep {
  UPLOAD = 'UPLOAD',
  EDIT_TEXT = 'EDIT_TEXT',
  CONFIGURE = 'CONFIGURE',
  RESULTS = 'RESULTS',
}

export enum Goal {
  KEEP_GOING = 'ادامه دادن بحث',
  FLIRT = 'مخ‌زنی / دلبری',
  SET_BOUNDARY = 'تعیین حد و مرز',
  RESCHEDULE = 'تغییر زمان قرار',
  ASK_OUT = 'پیشنهاد بیرون رفتن',
  END_POLITELY = 'پایان مؤدبانه بحث',
  NEGOTIATE = 'مذاکره / چانه‌زنی',
  APOLOGIZE = 'عذرخواهی / دلجویی'
}

export enum Tone {
  FRIENDLY = 'دوستانه و گرم',
  WITTY = 'بامزه و شوخ',
  CONFIDENT = 'با اعتماد به نفس',
  CUTE = 'کیوت و بانمک',
  DIRECT = 'رُک و پوست‌کنده',
  FORMAL = 'رسمی و اداری',
  DRY = 'سرد و سنگین'
}

export enum Language {
  PERSIAN = 'فارسی',
  FINGLISH = 'فینگلیش',
  ENGLISH = 'انگلیسی'
}

export interface UserConfig {
  goal: Goal;
  tone: Tone;
  language: Language;
  tarofLevel: number; // 0-10
  length: 'short' | 'medium' | 'long';
  additionalContext?: string; // New field for user notes
}

export interface GeneratedReply {
  text: string;
  tone_label: string;
  explanation: string;
}

export interface ReplyResponse {
  safest_reply: GeneratedReply;
  reply_options: GeneratedReply[];
  follow_ups: string[];
  risk_flags?: string[];
}
