import { 
  Customer, 
  BillingPeriod, 
  MeterReading, 
  Bill, 
  Payment, 
  SystemSettings,
  Notification
} from "@/types/models";

// مفاتيح التخزين
const STORAGE_KEYS = {
  CUSTOMERS: 'electric-customers',
  BILLING_PERIODS: 'electric-billing-periods',
  METER_READINGS: 'electric-meter-readings',
  BILLS: 'electric-bills',
  PAYMENTS: 'electric-payments',
  SETTINGS: 'electric-settings',
  NOTIFICATIONS: 'electric-notifications'
};

// دالة مساعدة للحصول على قيمة مخزنة
const getStoredData = <T>(key: string, defaultValue: T): T => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return defaultValue;
  }
};

// دالة مساعدة لتخزين البيانات
const storeData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
  }
};

// خدمة إدارة المشتركين
export const customerService = {
  getAll: (): Customer[] => getStoredData<Customer[]>(STORAGE_KEYS.CUSTOMERS, []),
  
  getById: (id: string): Customer | undefined => {
    const customers = getStoredData<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    return customers.find(customer => customer.id === id);
  },
  
  create: (customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const customers = getStoredData<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    
    customers.push(newCustomer);
    storeData(STORAGE_KEYS.CUSTOMERS, customers);
    return newCustomer;
  },
  
  update: (id: string, updates: Partial<Customer>): Customer | undefined => {
    const customers = getStoredData<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const index = customers.findIndex(customer => customer.id === id);
    
    if (index !== -1) {
      const updatedCustomer = { ...customers[index], ...updates };
      customers[index] = updatedCustomer;
      storeData(STORAGE_KEYS.CUSTOMERS, customers);
      return updatedCustomer;
    }
    
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const customers = getStoredData<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const filteredCustomers = customers.filter(customer => customer.id !== id);
    
    if (filteredCustomers.length !== customers.length) {
      storeData(STORAGE_KEYS.CUSTOMERS, filteredCustomers);
      return true;
    }
    
    return false;
  }
};

// خدمة إدارة الفترات الفوترية
export const billingPeriodService = {
  getAll: (): BillingPeriod[] => getStoredData<BillingPeriod[]>(STORAGE_KEYS.BILLING_PERIODS, []),
  
  getById: (id: string): BillingPeriod | undefined => {
    const periods = getStoredData<BillingPeriod[]>(STORAGE_KEYS.BILLING_PERIODS, []);
    return periods.find(period => period.id === id);
  },
  
  getActive: (): BillingPeriod | undefined => {
    const periods = getStoredData<BillingPeriod[]>(STORAGE_KEYS.BILLING_PERIODS, []);
    return periods.find(period => period.isActive);
  },
  
  create: (period: Omit<BillingPeriod, 'id' | 'createdAt'>): BillingPeriod => {
    const periods = getStoredData<BillingPeriod[]>(STORAGE_KEYS.BILLING_PERIODS, []);
    
    // إلغاء تنشيط الفترات السابقة
    const updatedPeriods = periods.map(p => ({ ...p, isActive: false }));
    
    const newPeriod: BillingPeriod = {
      ...period,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    
    updatedPeriods.push(newPeriod);
    storeData(STORAGE_KEYS.BILLING_PERIODS, updatedPeriods);
    return newPeriod;
  },
  
  update: (id: string, updates: Partial<BillingPeriod>): BillingPeriod | undefined => {
    const periods = getStoredData<BillingPeriod[]>(STORAGE_KEYS.BILLING_PERIODS, []);
    const index = periods.findIndex(period => period.id === id);
    
    if (index !== -1) {
      // إذا كان التحديث يشمل جعل الفترة نشطة، فقم بإلغاء تنشيط الفترات الأخرى
      if (updates.isActive) {
        for (let i = 0; i < periods.length; i++) {
          if (i !== index) {
            periods[i] = { ...periods[i], isActive: false };
          }
        }
      }
      
      const updatedPeriod = { ...periods[index], ...updates };
      periods[index] = updatedPeriod;
      storeData(STORAGE_KEYS.BILLING_PERIODS, periods);
      return updatedPeriod;
    }
    
    return undefined;
  }
};

// خدمة إدارة قراءات العدادات
export const meterReadingService = {
  getAll: (): MeterReading[] => getStoredData<MeterReading[]>(STORAGE_KEYS.METER_READINGS, []),
  
  getById: (id: string): MeterReading | undefined => {
    const readings = getStoredData<MeterReading[]>(STORAGE_KEYS.METER_READINGS, []);
    return readings.find(reading => reading.id === id);
  },
  
  getByCustomerAndPeriod: (customerId: string, periodId: string): MeterReading | undefined => {
    const readings = getStoredData<MeterReading[]>(STORAGE_KEYS.METER_READINGS, []);
    return readings.find(reading => reading.customerId === customerId && reading.periodId === periodId);
  },
  
  getLatestByCustomer: (customerId: string): MeterReading | undefined => {
    const readings = getStoredData<MeterReading[]>(STORAGE_KEYS.METER_READINGS, [])
      .filter(reading => reading.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return readings.length > 0 ? readings[0] : undefined;
  },
  
  create: (reading: Omit<MeterReading, 'id' | 'createdAt'>): MeterReading => {
    const readings = getStoredData<MeterReading[]>(STORAGE_KEYS.METER_READINGS, []);
    const newReading: MeterReading = {
      ...reading,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    
    readings.push(newReading);
    storeData(STORAGE_KEYS.METER_READINGS, readings);
    return newReading;
  },
  
  update: (id: string, updates: Partial<MeterReading>): MeterReading | undefined => {
    const readings = getStoredData<MeterReading[]>(STORAGE_KEYS.METER_READINGS, []);
    const index = readings.findIndex(reading => reading.id === id);
    
    if (index !== -1) {
      const updatedReading = { ...readings[index], ...updates };
      readings[index] = updatedReading;
      storeData(STORAGE_KEYS.METER_READINGS, readings);
      return updatedReading;
    }
    
    return undefined;
  }
};

// خدمة إدارة الفواتير
export const billService = {
  getAll: (): Bill[] => getStoredData<Bill[]>(STORAGE_KEYS.BILLS, []),
  
  getById: (id: string): Bill | undefined => {
    const bills = getStoredData<Bill[]>(STORAGE_KEYS.BILLS, []);
    return bills.find(bill => bill.id === id);
  },
  
  getByCustomerAndPeriod: (customerId: string, periodId: string): Bill | undefined => {
    const bills = getStoredData<Bill[]>(STORAGE_KEYS.BILLS, []);
    return bills.find(bill => bill.customerId === customerId && bill.periodId === periodId);
  },
  
  getByCustomer: (customerId: string): Bill[] => {
    const bills = getStoredData<Bill[]>(STORAGE_KEYS.BILLS, []);
    return bills.filter(bill => bill.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  create: (bill: Omit<Bill, 'id' | 'createdAt'>): Bill => {
    const bills = getStoredData<Bill[]>(STORAGE_KEYS.BILLS, []);
    const newBill: Bill = {
      ...bill,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    
    bills.push(newBill);
    storeData(STORAGE_KEYS.BILLS, bills);
    return newBill;
  },
  
  update: (id: string, updates: Partial<Bill>): Bill | undefined => {
    const bills = getStoredData<Bill[]>(STORAGE_KEYS.BILLS, []);
    const index = bills.findIndex(bill => bill.id === id);
    
    if (index !== -1) {
      const updatedBill = { ...bills[index], ...updates };
      bills[index] = updatedBill;
      storeData(STORAGE_KEYS.BILLS, bills);
      return updatedBill;
    }
    
    return undefined;
  }
};

// خدمة إدارة المدفوعات
export const paymentService = {
  getAll: (): Payment[] => getStoredData<Payment[]>(STORAGE_KEYS.PAYMENTS, []),
  
  getById: (id: string): Payment | undefined => {
    const payments = getStoredData<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
    return payments.find(payment => payment.id === id);
  },
  
  getByBill: (billId: string): Payment[] => {
    const payments = getStoredData<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
    return payments.filter(payment => payment.billId === billId)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  },
  
  getByCustomer: (customerId: string): Payment[] => {
    const payments = getStoredData<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
    return payments.filter(payment => payment.customerId === customerId)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  },
  
  create: (payment: Omit<Payment, 'id' | 'createdAt'>): Payment => {
    const payments = getStoredData<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
    const newPayment: Payment = {
      ...payment,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    
    payments.push(newPayment);
    storeData(STORAGE_KEYS.PAYMENTS, payments);
    
    // تحديث الفاتورة
    const bill = billService.getById(payment.billId);
    if (bill) {
      const paidAmount = bill.paidAmount + payment.amount;
      const remainingAmount = bill.totalAmount - paidAmount;
      const isPaid = remainingAmount <= 0;
      
      billService.update(bill.id, {
        paidAmount,
        remainingAmount,
        isPaid
      });
    }
    
    return newPayment;
  }
};

// خدمة إدارة إعدادات النظام
export const settingsService = {
  get: (): SystemSettings => {
    return getStoredData<SystemSettings>(STORAGE_KEYS.SETTINGS, {
      id: 'settings',
      kilowattPrice: 0.5, // سعر الكيلوواط الافتراضي
      subscriptionFee: 10, // رسوم الاشتراك الثابتة الافتراضية
      taxRate: 0.15, // نسبة الضريبة الافتراضية
      updatedAt: new Date()
    });
  },
  
  update: (updates: Partial<SystemSettings>): SystemSettings => {
    const settings = this.get();
    const updatedSettings: SystemSettings = {
      ...settings,
      ...updates,
      updatedAt: new Date()
    };
    
    storeData(STORAGE_KEYS.SETTINGS, updatedSettings);
    return updatedSettings;
  }
};

// خدمة إدارة الإشعارات
export const notificationService = {
  getAll: (): Notification[] => getStoredData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []),
  
  getUnread: (): Notification[] => {
    const notifications = getStoredData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return notifications.filter(notification => !notification.isRead)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  create: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification => {
    const notifications = getStoredData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      isRead: false,
      createdAt: new Date()
    };
    
    notifications.push(newNotification);
    storeData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  },
  
  markAsRead: (id: string): Notification | undefined => {
    const notifications = getStoredData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const index = notifications.findIndex(notification => notification.id === id);
    
    if (index !== -1) {
      const updatedNotification = { ...notifications[index], isRead: true };
      notifications[index] = updatedNotification;
      storeData(STORAGE_KEYS.NOTIFICATIONS, notifications);
      return updatedNotification;
    }
    
    return undefined;
  },
  
  markAllAsRead: (): void => {
    const notifications = getStoredData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true
    }));
    
    storeData(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications);
  }
};

// دالة لتهيئة بيانات النظام (بيانات افتراضية للاختبار)
export const initializeData = (): void => {
  // إذا كانت البيانات موجودة بالفعل، فلا تقم بإعادة التهيئة
  const customers = getStoredData<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  const periods = getStoredData<BillingPeriod[]>(STORAGE_KEYS.BILLING_PERIODS, []);
  
  if (customers.length > 0 || periods.length > 0) {
    return;
  }
  
  // تهيئة إعدادات النظام
  const settings: SystemSettings = {
    id: 'settings',
    kilowattPrice: 0.5,
    subscriptionFee: 10,
    taxRate: 0.15,
    updatedAt: new Date()
  };
  storeData(STORAGE_KEYS.SETTINGS, settings);
  
  // إنشاء عملاء افتراضيين
  const defaultCustomers: Omit<Customer, 'id' | 'createdAt'>[] = [
    {
      name: 'أحمد محمد',
      address: 'شارع المحطة، الرياض',
      phone: '0501234567',
      accountNumber: '1001',
      meterNumber: 'M1001',
      contractType: 'سكني'
    },
    {
      name: 'فاطمة علي',
      address: 'حي الملز، الرياض',
      phone: '0507654321',
      accountNumber: '1002',
      meterNumber: 'M1002',
      contractType: 'سكني'
    },
    {
      name: 'شركة النور للمقاولات',
      address: 'المنطقة الصناعية، الرياض',
      phone: '0551234567',
      accountNumber: '2001',
      meterNumber: 'M2001',
      contractType: 'تجاري'
    }
  ];
  
  const createdCustomers = defaultCustomers.map(customer => customerService.create(customer));
  
  // إنشاء فترة فوترية افتراضية
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('ar-SA', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  
  const defaultPeriod: Omit<BillingPeriod, 'id' | 'createdAt'> = {
    name: `${currentMonth} ${currentYear}`,
    startDate: currentDate,
    isActive: true
  };
  
  const createdPeriod = billingPeriodService.create(defaultPeriod);
  
  // إنشاء قراءات عدادات وفواتير افتراضية للعملاء
  createdCustomers.forEach(customer => {
    // قراءة العداد
    const previousReading = Math.floor(Math.random() * 1000);
    const currentReading = previousReading + Math.floor(Math.random() * 200) + 50;
    const consumption = currentReading - previousReading;
    
    const meterReading: Omit<MeterReading, 'id' | 'createdAt'> = {
      customerId: customer.id,
      periodId: createdPeriod.id,
      previousReading,
      currentReading,
      readingDate: new Date(),
      consumption
    };
    
    const createdReading = meterReadingService.create(meterReading);
    
    // حساب الفاتورة
    const consumptionCost = consumption * settings.kilowattPrice;
    const taxAmount = consumptionCost * settings.taxRate;
    const totalAmount = consumptionCost + settings.subscriptionFee + taxAmount;
    
    const bill: Omit<Bill, 'id' | 'createdAt'> = {
      customerId: customer.id,
      periodId: createdPeriod.id,
      meterReadingId: createdReading.id,
      consumption,
      consumptionCost,
      subscriptionFee: settings.subscriptionFee,
      taxAmount,
      previousBalance: 0,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      isPaid: false,
      issueDate: new Date()
    };
    
    billService.create(bill);
  });
  
  // إنشاء إشعارات افتراضية
  const defaultNotifications: Omit<Notification, 'id' | 'createdAt' | 'isRead'>[] = [
    {
      title: 'تم تهيئة النظام',
      message: 'تم تهيئة نظام إدارة فواتير الكهرباء بنجاح',
      type: 'create'
    },
    {
      title: 'تم إنشاء فترة فوترية جديدة',
      message: `تم إنشاء فترة فوترية جديدة: ${createdPeriod.name}`,
      type: 'period'
    }
  ];
  
  defaultNotifications.forEach(notification => notificationService.create(notification));
};
