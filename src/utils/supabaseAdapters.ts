
import { supabase } from "@/integrations/supabase/client";
import { Customer, BillingPeriod, MeterReading, Bill, Payment, Notification, SystemSettings } from "@/types/models";
import { Database } from "@/integrations/supabase/types";

type DbCustomer = Database["public"]["Tables"]["customers"]["Row"];
type DbBillingPeriod = Database["public"]["Tables"]["billing_periods"]["Row"];
type DbMeterReading = Database["public"]["Tables"]["meter_readings"]["Row"];
type DbBill = Database["public"]["Tables"]["bills"]["Row"];
type DbPayment = Database["public"]["Tables"]["payments"]["Row"];
type DbNotification = Database["public"]["Tables"]["notifications"]["Row"];
type DbSystemSettings = Database["public"]["Tables"]["system_settings"]["Row"];

// Customer adapters
export const toCustomer = (dbCustomer: DbCustomer): Customer => ({
  id: dbCustomer.id,
  name: dbCustomer.name,
  address: dbCustomer.address,
  phone: dbCustomer.phone,
  accountNumber: dbCustomer.account_number,
  meterNumber: dbCustomer.meter_number,
  notes: dbCustomer.notes || undefined,
  contractType: dbCustomer.contract_type || undefined,
  createdAt: new Date(dbCustomer.created_at)
});

export const toDbCustomer = (customer: Partial<Customer>): Partial<DbCustomer> => ({
  ...(customer.id && { id: customer.id }),
  ...(customer.name && { name: customer.name }),
  ...(customer.address && { address: customer.address }),
  ...(customer.phone && { phone: customer.phone }),
  ...(customer.accountNumber && { account_number: customer.accountNumber }),
  ...(customer.meterNumber && { meter_number: customer.meterNumber }),
  notes: customer.notes,
  contract_type: customer.contractType
});

// BillingPeriod adapters
export const toBillingPeriod = (dbPeriod: DbBillingPeriod): BillingPeriod => ({
  id: dbPeriod.id,
  name: dbPeriod.name,
  startDate: new Date(dbPeriod.start_date),
  endDate: dbPeriod.end_date ? new Date(dbPeriod.end_date) : undefined,
  isActive: dbPeriod.is_active,
  createdAt: new Date(dbPeriod.created_at)
});

export const toDbBillingPeriod = (period: Partial<BillingPeriod>): Partial<DbBillingPeriod> => ({
  ...(period.id && { id: period.id }),
  ...(period.name && { name: period.name }),
  ...(period.startDate && { start_date: period.startDate.toISOString() }),
  ...(period.endDate && { end_date: period.endDate.toISOString() }),
  ...(period.isActive !== undefined && { is_active: period.isActive })
});

// MeterReading adapters
export const toMeterReading = (dbReading: DbMeterReading): MeterReading => ({
  id: dbReading.id,
  customerId: dbReading.customer_id,
  periodId: dbReading.period_id,
  previousReading: Number(dbReading.previous_reading),
  currentReading: Number(dbReading.current_reading),
  readingDate: new Date(dbReading.reading_date),
  consumption: Number(dbReading.consumption),
  createdAt: new Date(dbReading.created_at)
});

export const toDbMeterReading = (reading: Partial<MeterReading>): Partial<DbMeterReading> => ({
  ...(reading.id && { id: reading.id }),
  ...(reading.customerId && { customer_id: reading.customerId }),
  ...(reading.periodId && { period_id: reading.periodId }),
  ...(reading.previousReading !== undefined && { previous_reading: reading.previousReading }),
  ...(reading.currentReading !== undefined && { current_reading: reading.currentReading }),
  ...(reading.readingDate && { reading_date: reading.readingDate.toISOString() }),
  ...(reading.consumption !== undefined && { consumption: reading.consumption })
});

// Bill adapters
export const toBill = (dbBill: DbBill): Bill => ({
  id: dbBill.id,
  customerId: dbBill.customer_id,
  periodId: dbBill.period_id,
  meterReadingId: dbBill.meter_reading_id,
  consumption: Number(dbBill.consumption),
  consumptionCost: Number(dbBill.consumption_cost),
  subscriptionFee: Number(dbBill.subscription_fee),
  taxAmount: Number(dbBill.tax_amount),
  previousBalance: Number(dbBill.previous_balance),
  totalAmount: Number(dbBill.total_amount),
  paidAmount: Number(dbBill.paid_amount),
  remainingAmount: Number(dbBill.remaining_amount),
  isPaid: dbBill.is_paid,
  issueDate: new Date(dbBill.issue_date),
  dueDate: dbBill.due_date ? new Date(dbBill.due_date) : undefined,
  createdAt: new Date(dbBill.created_at)
});

export const toDbBill = (bill: Partial<Bill>): Partial<DbBill> => ({
  ...(bill.id && { id: bill.id }),
  ...(bill.customerId && { customer_id: bill.customerId }),
  ...(bill.periodId && { period_id: bill.periodId }),
  ...(bill.meterReadingId && { meter_reading_id: bill.meterReadingId }),
  ...(bill.consumption !== undefined && { consumption: bill.consumption }),
  ...(bill.consumptionCost !== undefined && { consumption_cost: bill.consumptionCost }),
  ...(bill.subscriptionFee !== undefined && { subscription_fee: bill.subscriptionFee }),
  ...(bill.taxAmount !== undefined && { tax_amount: bill.taxAmount }),
  ...(bill.previousBalance !== undefined && { previous_balance: bill.previousBalance }),
  ...(bill.totalAmount !== undefined && { total_amount: bill.totalAmount }),
  ...(bill.paidAmount !== undefined && { paid_amount: bill.paidAmount }),
  ...(bill.remainingAmount !== undefined && { remaining_amount: bill.remainingAmount }),
  ...(bill.isPaid !== undefined && { is_paid: bill.isPaid }),
  ...(bill.issueDate && { issue_date: bill.issueDate.toISOString() }),
  ...(bill.dueDate && { due_date: bill.dueDate.toISOString() })
});

// Payment adapters
export const toPayment = (dbPayment: DbPayment): Payment => ({
  id: dbPayment.id,
  billId: dbPayment.bill_id,
  customerId: dbPayment.customer_id,
  amount: Number(dbPayment.amount),
  paymentDate: new Date(dbPayment.payment_date),
  paymentMethod: dbPayment.payment_method,
  notes: dbPayment.notes || undefined,
  createdAt: new Date(dbPayment.created_at)
});

export const toDbPayment = (payment: Partial<Payment>): Partial<DbPayment> => ({
  ...(payment.id && { id: payment.id }),
  ...(payment.billId && { bill_id: payment.billId }),
  ...(payment.customerId && { customer_id: payment.customerId }),
  ...(payment.amount !== undefined && { amount: payment.amount }),
  ...(payment.paymentDate && { payment_date: payment.paymentDate.toISOString() }),
  ...(payment.paymentMethod && { payment_method: payment.paymentMethod }),
  notes: payment.notes
});

// Notification adapters
export const toNotification = (dbNotification: DbNotification): Notification => ({
  id: dbNotification.id,
  title: dbNotification.title,
  message: dbNotification.message,
  type: dbNotification.type as any,
  isRead: dbNotification.is_read,
  createdAt: new Date(dbNotification.created_at)
});

export const toDbNotification = (notification: Partial<Notification>): Partial<DbNotification> => ({
  ...(notification.id && { id: notification.id }),
  ...(notification.title && { title: notification.title }),
  ...(notification.message && { message: notification.message }),
  ...(notification.type && { type: notification.type }),
  ...(notification.isRead !== undefined && { is_read: notification.isRead })
});

// SystemSettings adapters
export const toSystemSettings = (dbSettings: DbSystemSettings): SystemSettings => ({
  id: dbSettings.id,
  kilowattPrice: Number(dbSettings.kilowatt_price),
  subscriptionFee: Number(dbSettings.subscription_fee),
  taxRate: Number(dbSettings.tax_rate),
  updatedAt: new Date(dbSettings.updated_at)
});

export const toDbSystemSettings = (settings: Partial<SystemSettings>): Partial<DbSystemSettings> => ({
  ...(settings.id && { id: settings.id }),
  ...(settings.kilowattPrice !== undefined && { kilowatt_price: settings.kilowattPrice }),
  ...(settings.subscriptionFee !== undefined && { subscription_fee: settings.subscriptionFee }),
  ...(settings.taxRate !== undefined && { tax_rate: settings.taxRate })
});
