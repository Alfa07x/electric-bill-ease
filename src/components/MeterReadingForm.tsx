
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { 
  customerService, 
  meterReadingService, 
  billService,
  billingPeriodService,
  settingsService,
  notificationService
} from "@/services/storage.service";
import { Customer, BillingPeriod, MeterReading, Bill } from "@/types/models";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/formatters";

interface MeterReadingFormProps {
  onSuccess?: (bill: Bill) => void;
}

const MeterReadingForm: React.FC<MeterReadingFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [previousReading, setPreviousReading] = useState<number>(0);
  const [currentReading, setCurrentReading] = useState<number>(0);
  const [readingDate, setReadingDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activePeriod, setActivePeriod] = useState<BillingPeriod | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // تحميل قائمة المشتركين
    const loadedCustomers = customerService.getAll();
    setCustomers(loadedCustomers);

    // تحميل الفترة النشطة
    const period = billingPeriodService.getActive();
    if (period) {
      setActivePeriod(period);
    } else {
      setError("لا توجد فترة فوترية نشطة. يرجى إنشاء فترة جديدة أولاً.");
    }
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      // البحث عن آخر قراءة للمشترك
      const latestReading = meterReadingService.getLatestByCustomer(selectedCustomerId);
      if (latestReading) {
        setPreviousReading(latestReading.currentReading);
      } else {
        setPreviousReading(0);
      }
      setCurrentReading(0); // إعادة تعيين القراءة الحالية
    }
  }, [selectedCustomerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activePeriod) {
      toast({
        title: "خطأ",
        description: "لا توجد فترة فوترية نشطة",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCustomerId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار مشترك",
        variant: "destructive"
      });
      return;
    }

    if (currentReading < previousReading) {
      toast({
        title: "خطأ",
        description: "القراءة الحالية يجب أن تكون أكبر من أو تساوي القراءة السابقة",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // التحقق من وجود قراءة سابقة لنفس المشترك والفترة
      const existingReading = meterReadingService.getByCustomerAndPeriod(
        selectedCustomerId,
        activePeriod.id
      );

      if (existingReading) {
        toast({
          title: "تنبيه",
          description: "يوجد بالفعل قراءة لهذا المشترك في هذه الفترة. سيتم تحديث القراءة الحالية.",
          variant: "default"
        });
      }

      // حساب الاستهلاك
      const consumption = currentReading - previousReading;
      
      // إنشاء أو تحديث قراءة العداد
      let meterReading: MeterReading;
      
      if (existingReading) {
        meterReading = meterReadingService.update(existingReading.id, {
          currentReading,
          readingDate,
          consumption
        }) as MeterReading;
      } else {
        meterReading = meterReadingService.create({
          customerId: selectedCustomerId,
          periodId: activePeriod.id,
          previousReading,
          currentReading,
          readingDate,
          consumption
        });
      }

      // الحصول على إعدادات النظام
      const settings = settingsService.get();
      
      // حساب تكلفة الاستهلاك والضرائب
      const consumptionCost = consumption * settings.kilowattPrice;
      const taxAmount = consumptionCost * settings.taxRate;
      
      // الحصول على الرصيد المتبقي من الفترة السابقة (إن وجد)
      const periods = billingPeriodService.getAll()
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        
      let previousBalance = 0;
      
      // البحث عن الفترة السابقة للفترة الحالية
      for (let i = 0; i < periods.length; i++) {
        if (periods[i].id === activePeriod.id && i + 1 < periods.length) {
          const previousPeriod = periods[i + 1];
          const previousBill = billService.getByCustomerAndPeriod(selectedCustomerId, previousPeriod.id);
          
          if (previousBill && !previousBill.isPaid) {
            previousBalance = previousBill.remainingAmount;
          }
          
          break;
        }
      }

      // حساب إجمالي الفاتورة
      const totalAmount = consumptionCost + settings.subscriptionFee + taxAmount + previousBalance;
      
      // إنشاء أو تحديث الفاتورة
      let bill: Bill;
      const existingBill = billService.getByCustomerAndPeriod(selectedCustomerId, activePeriod.id);
      
      if (existingBill) {
        bill = billService.update(existingBill.id, {
          meterReadingId: meterReading.id,
          consumption,
          consumptionCost,
          subscriptionFee: settings.subscriptionFee,
          taxAmount,
          previousBalance,
          totalAmount,
          remainingAmount: totalAmount - existingBill.paidAmount,
          isPaid: (totalAmount - existingBill.paidAmount) <= 0
        }) as Bill;
      } else {
        bill = billService.create({
          customerId: selectedCustomerId,
          periodId: activePeriod.id,
          meterReadingId: meterReading.id,
          consumption,
          consumptionCost,
          subscriptionFee: settings.subscriptionFee,
          taxAmount,
          previousBalance,
          totalAmount,
          paidAmount: 0,
          remainingAmount: totalAmount,
          isPaid: false,
          issueDate: new Date()
        });
      }

      // إنشاء إشعار بالفاتورة الجديدة
      const customer = customerService.getById(selectedCustomerId);
      notificationService.create({
        title: "تم إنشاء فاتورة جديدة",
        message: `تم إنشاء فاتورة جديدة للمشترك ${customer?.name} بمبلغ ${totalAmount.toFixed(2)} ريال`,
        type: "create"
      });

      toast({
        title: "تم بنجاح",
        description: "تم حفظ قراءة العداد وإنشاء الفاتورة",
      });

      // إعادة تعيين النموذج
      setSelectedCustomerId("");
      setPreviousReading(0);
      setCurrentReading(0);
      
      // استدعاء دالة النجاح إذا كانت متوفرة
      if (onSuccess) {
        onSuccess(bill);
      }
    } catch (error) {
      console.error("Error saving meter reading:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ قراءة العداد",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>قراءة العداد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-red-500">{error}</div>
          <Button 
            className="w-full mt-2" 
            variant="default" 
            onClick={() => window.location.href = "/periods"}
          >
            الانتقال إلى إدارة الفترات
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدخال قراءة عداد جديدة</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">اختر المشترك</Label>
            <Select
              value={selectedCustomerId}
              onValueChange={setSelectedCustomerId}
            >
              <SelectTrigger id="customer">
                <SelectValue placeholder="اختر المشترك" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.accountNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="previousReading">القراءة السابقة</Label>
              <Input
                id="previousReading"
                type="number"
                value={previousReading}
                onChange={(e) => setPreviousReading(Number(e.target.value))}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentReading">القراءة الحالية</Label>
              <Input
                id="currentReading"
                type="number"
                value={currentReading || ""}
                onChange={(e) => setCurrentReading(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="readingDate">تاريخ القراءة</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-right"
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {readingDate ? formatDate(readingDate) : "اختر التاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={readingDate}
                  onSelect={(date) => date && setReadingDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={!selectedCustomerId || currentReading <= 0 || isLoading}
            >
              {isLoading ? "جاري الحفظ..." : "حفظ قراءة العداد وإنشاء الفاتورة"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MeterReadingForm;
