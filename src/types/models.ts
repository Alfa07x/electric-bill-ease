
// تعريف النماذج الأساسية للنظام

// نموذج المشترك
export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  accountNumber: string;
  meterNumber: string;
  notes?: string;
  contractType?: string;
  createdAt: Date;
}

// نموذج الفترة الفوترية
export interface BillingPeriod {
  id: string;
  name: string; // مثال: "فبراير 2023"
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

// نموذج قراءة العداد
export interface MeterReading {
  id: string;
  customerId: string;
  periodId: string;
  previousReading: number;
  currentReading: number;
  readingDate: Date;
  consumption: number; // الاستهلاك = القراءة الحالية - القراءة السابقة
  createdAt: Date;
}

// نموذج الفاتورة
export interface Bill {
  id: string;
  customerId: string;
  periodId: string;
  meterReadingId: string;
  consumption: number;
  consumptionCost: number; // تكلفة الاستهلاك
  subscriptionFee: number; // رسوم الاشتراك الثابتة
  taxAmount: number; // قيمة الضرائب
  previousBalance: number; // الرصيد المتبقي من الفترة السابقة
  totalAmount: number; // إجمالي المبلغ
  paidAmount: number; // المبلغ المدفوع
  remainingAmount: number; // المبلغ المتبقي
  isPaid: boolean; // هل تم سداد الفاتورة بالكامل
  issueDate: Date;
  dueDate?: Date;
  createdAt: Date;
}

// نموذج الدفعة
export interface Payment {
  id: string;
  billId: string;
  customerId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
}

// ثوابت النظام
export interface SystemSettings {
  id: string;
  kilowattPrice: number; // سعر الكيلوواط
  subscriptionFee: number; // رسوم الاشتراك الثابتة
  taxRate: number; // نسبة الضريبة
  updatedAt: Date;
}

// نوع الإجراء للإشعارات
export type ActionType = 'create' | 'update' | 'delete' | 'payment' | 'period' | 'other';

// نموذج الإشعارات
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: ActionType;
  isRead: boolean;
  createdAt: Date;
}
