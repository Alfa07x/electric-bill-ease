
import { supabase } from "@/integrations/supabase/client";
import { 
  Customer, BillingPeriod, MeterReading, Bill, Payment, Notification, SystemSettings, ActionType 
} from "@/types/models";
import { 
  toCustomer, toDbCustomer,
  toBillingPeriod, toDbBillingPeriod, 
  toMeterReading, toDbMeterReading,
  toBill, toDbBill,
  toPayment, toDbPayment,
  toNotification, toDbNotification,
  toSystemSettings, toDbSystemSettings
} from "@/utils/supabaseAdapters";

// Customer Service
export const customerService = {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
    
    return data.map(toCustomer);
  },
  
  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
    
    return toCustomer(data);
  },
  
  async create(customer: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
    const dbCustomer = toDbCustomer(customer);
    
    const { data, error } = await supabase
      .from('customers')
      .insert(dbCustomer)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
    
    return toCustomer(data);
  },
  
  async update(id: string, customer: Partial<Customer>): Promise<Customer | null> {
    const dbCustomer = toDbCustomer(customer);
    
    const { data, error } = await supabase
      .from('customers')
      .update(dbCustomer)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
    
    return toCustomer(data);
  },
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }
};

// Billing Period Service
export const billingPeriodService = {
  async getAll(): Promise<BillingPeriod[]> {
    const { data, error } = await supabase
      .from('billing_periods')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching billing periods:', error);
      return [];
    }
    
    return data.map(toBillingPeriod);
  },
  
  async getById(id: string): Promise<BillingPeriod | null> {
    const { data, error } = await supabase
      .from('billing_periods')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching billing period:', error);
      return null;
    }
    
    return toBillingPeriod(data);
  },
  
  async getActive(): Promise<BillingPeriod | null> {
    const { data, error } = await supabase
      .from('billing_periods')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No active period found
        return null;
      }
      console.error('Error fetching active billing period:', error);
      return null;
    }
    
    return toBillingPeriod(data);
  },
  
  async create(period: Omit<BillingPeriod, "id" | "createdAt">): Promise<BillingPeriod> {
    // If this period is active, deactivate all other periods
    if (period.isActive) {
      await this.deactivateAllPeriods();
    }
    
    const dbPeriod = toDbBillingPeriod(period);
    
    const { data, error } = await supabase
      .from('billing_periods')
      .insert(dbPeriod)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating billing period:', error);
      throw error;
    }
    
    return toBillingPeriod(data);
  },
  
  async update(id: string, period: Partial<BillingPeriod>): Promise<BillingPeriod | null> {
    // If this period is being set to active, deactivate all other periods
    if (period.isActive) {
      await this.deactivateAllPeriods();
    }
    
    const dbPeriod = toDbBillingPeriod(period);
    
    const { data, error } = await supabase
      .from('billing_periods')
      .update(dbPeriod)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating billing period:', error);
      throw error;
    }
    
    return toBillingPeriod(data);
  },
  
  async deactivateAllPeriods(): Promise<void> {
    const { error } = await supabase
      .from('billing_periods')
      .update({ is_active: false })
      .eq('is_active', true);
    
    if (error) {
      console.error('Error deactivating billing periods:', error);
      throw error;
    }
  },
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('billing_periods')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting billing period:', error);
      throw error;
    }
  }
};

// Meter Reading Service
export const meterReadingService = {
  async getAll(): Promise<MeterReading[]> {
    const { data, error } = await supabase
      .from('meter_readings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching meter readings:', error);
      return [];
    }
    
    return data.map(toMeterReading);
  },
  
  async getById(id: string): Promise<MeterReading | null> {
    const { data, error } = await supabase
      .from('meter_readings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching meter reading:', error);
      return null;
    }
    
    return toMeterReading(data);
  },
  
  async getByCustomer(customerId: string): Promise<MeterReading[]> {
    const { data, error } = await supabase
      .from('meter_readings')
      .select('*')
      .eq('customer_id', customerId)
      .order('reading_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching meter readings for customer:', error);
      return [];
    }
    
    return data.map(toMeterReading);
  },
  
  async getByCustomerAndPeriod(customerId: string, periodId: string): Promise<MeterReading | null> {
    const { data, error } = await supabase
      .from('meter_readings')
      .select('*')
      .eq('customer_id', customerId)
      .eq('period_id', periodId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No reading found
        return null;
      }
      console.error('Error fetching meter reading for customer and period:', error);
      return null;
    }
    
    return toMeterReading(data);
  },
  
  async create(reading: Omit<MeterReading, "id" | "createdAt">): Promise<MeterReading> {
    const dbReading = toDbMeterReading(reading);
    
    const { data, error } = await supabase
      .from('meter_readings')
      .insert(dbReading)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating meter reading:', error);
      throw error;
    }
    
    return toMeterReading(data);
  },
  
  async update(id: string, reading: Partial<MeterReading>): Promise<MeterReading | null> {
    const dbReading = toDbMeterReading(reading);
    
    const { data, error } = await supabase
      .from('meter_readings')
      .update(dbReading)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating meter reading:', error);
      throw error;
    }
    
    return toMeterReading(data);
  },
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('meter_readings')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting meter reading:', error);
      throw error;
    }
  }
};

// Bill Service
export const billService = {
  async getAll(): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching bills:', error);
      return [];
    }
    
    return data.map(toBill);
  },
  
  async getById(id: string): Promise<Bill | null> {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching bill:', error);
      return null;
    }
    
    return toBill(data);
  },
  
  async getByCustomer(customerId: string): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching bills for customer:', error);
      return [];
    }
    
    return data.map(toBill);
  },
  
  async getByCustomerAndPeriod(customerId: string, periodId: string): Promise<Bill | null> {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('customer_id', customerId)
      .eq('period_id', periodId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No bill found
        return null;
      }
      console.error('Error fetching bill for customer and period:', error);
      return null;
    }
    
    return toBill(data);
  },
  
  async create(bill: Omit<Bill, "id" | "createdAt">): Promise<Bill> {
    const dbBill = toDbBill(bill);
    
    const { data, error } = await supabase
      .from('bills')
      .insert(dbBill)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating bill:', error);
      throw error;
    }
    
    return toBill(data);
  },
  
  async update(id: string, bill: Partial<Bill>): Promise<Bill | null> {
    const dbBill = toDbBill(bill);
    
    const { data, error } = await supabase
      .from('bills')
      .update(dbBill)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating bill:', error);
      throw error;
    }
    
    return toBill(data);
  },
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting bill:', error);
      throw error;
    }
  }
};

// Payment Service
export const paymentService = {
  async getAll(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
    
    return data.map(toPayment);
  },
  
  async getById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching payment:', error);
      return null;
    }
    
    return toPayment(data);
  },
  
  async getByCustomer(customerId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .order('payment_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching payments for customer:', error);
      return [];
    }
    
    return data.map(toPayment);
  },
  
  async getByBill(billId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('bill_id', billId)
      .order('payment_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching payments for bill:', error);
      return [];
    }
    
    return data.map(toPayment);
  },
  
  async create(payment: Omit<Payment, "id" | "createdAt">): Promise<Payment> {
    const dbPayment = toDbPayment(payment);
    
    // Begin transaction (using supabase.rpc is not available yet, using separate queries instead)
    // 1. Insert the payment
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert(dbPayment)
      .select()
      .single();
    
    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      throw paymentError;
    }
    
    // 2. Update the bill with the new payment amount
    const { data: billData, error: billError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', payment.billId)
      .single();
    
    if (billError) {
      console.error('Error fetching bill for payment update:', billError);
      throw billError;
    }
    
    const bill = toBill(billData);
    const newPaidAmount = Number(bill.paidAmount) + Number(payment.amount);
    const newRemainingAmount = Number(bill.totalAmount) - newPaidAmount;
    const isPaid = newRemainingAmount <= 0;
    
    const { error: updateError } = await supabase
      .from('bills')
      .update({
        paid_amount: newPaidAmount,
        remaining_amount: newRemainingAmount,
        is_paid: isPaid
      })
      .eq('id', payment.billId);
    
    if (updateError) {
      console.error('Error updating bill after payment:', updateError);
      throw updateError;
    }
    
    return toPayment(paymentData);
  },
  
  async update(id: string, payment: Partial<Payment>): Promise<Payment | null> {
    const dbPayment = toDbPayment(payment);
    
    const { data, error } = await supabase
      .from('payments')
      .update(dbPayment)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
    
    return toPayment(data);
  },
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }
};

// Notification Service
export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data.map(toNotification);
  },
  
  async getById(id: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching notification:', error);
      return null;
    }
    
    return toNotification(data);
  },
  
  async getUnread(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
    
    return data.map(toNotification);
  },
  
  async create(notification: Omit<Notification, "id" | "createdAt" | "isRead">): Promise<Notification> {
    const dbNotification = toDbNotification({
      ...notification,
      isRead: false
    });
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(dbNotification)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    
    return toNotification(data);
  },
  
  async markAsRead(id: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
    
    return toNotification(data);
  },
  
  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};

// System Settings Service
export const systemSettingsService = {
  async get(): Promise<SystemSettings | null> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 'settings')
      .single();
    
    if (error) {
      console.error('Error fetching system settings:', error);
      return null;
    }
    
    return toSystemSettings(data);
  },
  
  async update(settings: Partial<SystemSettings>): Promise<SystemSettings | null> {
    const dbSettings = toDbSystemSettings(settings);
    
    const { data, error } = await supabase
      .from('system_settings')
      .update(dbSettings)
      .eq('id', 'settings')
      .select()
      .single();
    
    if (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
    
    return toSystemSettings(data);
  }
};
