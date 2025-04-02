
/**
 * تنسيق التاريخ بالصيغة العربية
 */
export const formatDate = (date: Date): string => {
  if (!date) return "";
  
  // التحقق من أن التاريخ صالح
  const safeDate = date instanceof Date ? date : new Date(date);
  
  // إذا كان التاريخ غير صالح
  if (isNaN(safeDate.getTime())) {
    return "";
  }
  
  // تنسيق بالعربية
  return safeDate.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * تنسيق المبلغ بالريال السعودي
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(2)} ريال`;
};

/**
 * تنسيق الاستهلاك بوحدة الكيلوواط
 */
export const formatConsumption = (consumption: number): string => {
  return `${consumption.toFixed(0)} كيلوواط`;
};

/**
 * اختصار النصوص الطويلة
 */
export const truncateText = (text: string, maxLength: number = 30): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * تحويل حالة السداد إلى نص
 */
export const formatPaymentStatus = (isPaid: boolean): string => {
  return isPaid ? "مدفوع" : "غير مدفوع";
};

/**
 * تنسيق رقم الهاتف السعودي
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";
  
  // إزالة أي أحرف غير رقمية
  const cleaned = phone.replace(/\D/g, "");
  
  // إذا كان الرقم يبدأ بـ 05 ويتكون من 10 أرقام
  if (cleaned.length === 10 && cleaned.startsWith("05")) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }
  
  return phone;
};
