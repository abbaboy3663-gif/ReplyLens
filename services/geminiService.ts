
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserConfig, ReplyResponse, Language } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found via process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Uses Gemini Vision model to extract text from the chat screenshot.
 */
export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  const ai = getAiClient();
  
  // Clean base64 string if necessary
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', 
              data: cleanBase64
            }
          },
          {
            text: `این یک اسکرین‌شات از چت است (مثل تلگرام یا واتس‌اپ).
            متن تمام پیام‌ها را استخراج کن و دقیقاً مشخص کن گوینده کیست.

            **قانون مهم تشخیص گوینده:**
            1. پیام‌هایی که در سمت **راست** تصویر هستند (معمولاً آبی، سبز یا رنگی) = **«من»** (کاربر).
            2. پیام‌هایی که در سمت **چپ** تصویر هستند (معمولاً سفید یا تیره) = **«طرف مقابل»**.

            خروجی را به صورت خط به خط و به ترتیب زمانی (از بالا به پایین) بنویس:
            من: [متن پیام]
            طرف مقابل: [متن پیام]
            
            اگر متن فارسی است، دقیقاً فارسی بنویس. اگر فینگلیش یا انگلیسی است، همانطور بنویس.
            موارد اضافی مثل ساعت (مثلاً 10:24 PM) و تاریخ را حذف کن.`
          }
        ]
      }
    });

    return response.text || "متاسفانه متنی استخراج نشد. لطفاً دوباره تلاش کنید.";
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("خواندن تصویر با مشکل مواجه شد. لطفاً مطمئن شوید عکس واضح است.");
  }
};

/**
 * Generates replies based on the extracted conversation and user configuration.
 */
export const generateReplies = async (
  conversationText: string,
  config: UserConfig
): Promise<ReplyResponse> => {
  const ai = getAiClient();

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      safest_reply: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          tone_label: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ["text", "tone_label", "explanation"]
      },
      reply_options: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            tone_label: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["text", "tone_label", "explanation"]
        }
      },
      follow_ups: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      risk_flags: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["safest_reply", "reply_options", "follow_ups"]
  };

  const systemPrompt = `
    شما «رپلای‌لنز» (ReplyLens) هستید، یک دستیار هوشمند و حرفه‌ای در زمینه ارتباطات اجتماعی، دیتینگ (مخ‌زنی) و آداب معاشرت، با تمرکز ویژه بر فرهنگ و زبان فارسی.

    دستورالعمل‌های حیاتی:
    1. زبان پاسخ‌ها: باید دقیقاً به زبان «${config.language}» باشد.
    2. فرهنگ و لحن: 
       - اگر زبان فارسی است، حتماً از ظرافت‌های زبانی و اصطلاحات رایج استفاده کن.
       - «تعارف» را بر اساس سطح تنظیم شده اعمال کن: سطح ${config.tarofLevel} از 10.
         (0 = کاملاً مستقیم و غربی، 5 = مودبانه و معمولی، 10 = تعارفات غلیظ و مجلسی).
    3. هدف کاربر: ${config.goal}
    4. لحن درخواستی: ${config.tone}
    5. طول پاسخ: ${config.length}

    وظیفه شما:
    - مکالمه را تحلیل کن. آخرین پیام «طرف مقابل» را پیدا کن و جواب آن را بده.
    - اگر کاربر «توضیحات تکمیلی» داده است، حتماً آن را در تولید پاسخ‌ها اعمال کن (مثلاً اگر گفته دعوا شده، لحن را متناسب کن).
    - 5 پیشنهاد متنوع برای پاسخ دادن بساز.
    - 1 پیشنهاد به عنوان «مطمئن‌ترین گزینه» (Safest Option) ارائه بده که کمترین ریسک را داشته باشد.
    - توضیح کوتاهی (explanation) برای هر پیشنهاد بنویس که چرا این جواب خوب است.
    - اگر مکالمه بوی تهدید، کلاهبرداری یا آزار می‌دهد، لیست 'risk_flags' را پر کن.

    خروجی باید دقیقاً طبق فرمت JSON خواسته شده باشد.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        متن مکالمه:
        ${conversationText}

        ${config.additionalContext ? `
        ---
        توضیحات و نکات تکمیلی کاربر (زمینه مکالمه):
        ${config.additionalContext}
        ---
        ` : ''}
      `,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    
    return JSON.parse(jsonText) as ReplyResponse;
  } catch (error) {
    console.error("Generation Error:", error);
    throw new Error("تولید پاسخ با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
  }
};
