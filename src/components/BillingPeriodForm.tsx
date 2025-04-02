
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/utils/formatters";
import { BillingPeriod } from "@/types/models";
import { 
  billingPeriodService, 
  billService, 
  customerService, 
  notificationService
} from "@/services/storage.service";

interface BillingPeriodFormProps {
  onSuccess?: (period: BillingPeriod) => void;
}

const BillingPeriodForm: React.FC<BillingPeriodFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [name, setName] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activePeriod, setActivePeriod] = useState<BillingPeriod | null>(null);

  useEffect(() => {
    // تحميل الفترة النشطة الحالية
    const period = billingPeriodService.getActive();
    setActivePeriod(period || null);
    
    // اقتراح اسم للفترة الجديدة
    suggestPeriodName();
  }, []);

  const suggestPeriodName = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const monthName = nextMonth.toLocaleString('ar-SA', { month: 'long' });
    const year = nextMonth.getFullYear();
    
    setName(`${monthName} ${year}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الفترة",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // إنشاء فترة فوترية جديدة
      const newPeriod = billingPeriodService.create({
        name,
        startDate,
        isActive: true
      });
      
      // إذا كانت هناك فترة نشطة سابقة، قم بنقل الأرصدة المتبقية
      if (activePeriod) {
        const customers = customerService.getAll();
        
        for (const customer of customers) {
          const prevBill = billService.getByCustomerAndPeriod(customer.id, activePeriod.id);
          
          if (prevBill && prevBill.remainingAmount > 0) {
            // إنشاء فاتورة جديدة للفترة الجديدة مع نقل الرصيد المتبقي
            billService.create({
              customerId: customer.id,
              periodId: newPeriod.id,
              meterReadingId: prevBill.meterReadingId,
              consumption: 0,
              consumptionCost: 0,
              subscriptionFee: 0,
              taxAmount: 0,
              previousBalance: prevBill.remainingAmount,
              totalAmount: prevBill.remainingAmount,
              paidAmount: 0,
              remainingAmount: prevBill.remainingAmount,
              isPaid: false,
              issueDate: new Date()
            });
          }
        }
      }
      
      // إنشاء إشعار بالفترة الجديدة
      notificationService.create({
        title: "تم إنشاء فترة فوترية جديدة",
        message: `تم إنشاء فترة فوترية جديدة: ${name}`,
        type: "period"
      });
      
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الفترة الفوترية الجديدة",
      });
      
      // إعادة تعيين النموذج
      suggestPeriodName();
      
      // تحديث الفترة النشطة
      setActivePeriod(newPeriod);
      
      // استدعاء دالة النجاح إذا كانت متوفرة
      if (onSuccess) {
        onSuccess(newPeriod);
      }
    } catch (error) {
      console.error("Error creating billing period:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الفترة الفوترية",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إنشاء فترة فوترية جديدة</CardTitle>
        {activePeriod && (
          <CardDescription>
            الفترة النشطة الحالية: {activePeriod.name}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم الفترة</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: مارس 2023"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">تاريخ بدء الفترة</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-right"
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {startDate ? formatDate(startDate) : "اختر التاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {activePeriod && (
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 my-4">
              <p className="text-yellow-700 text-sm">
                <strong>تنبيه:</strong> سيؤدي إنشاء فترة جديدة إلى إلغاء تنشيط الفترة الحالية ({activePeriod.name}) وترحيل المبالغ غير المسددة إلى الفترة الجديدة.
              </p>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={!name || isLoading}
            >
              {isLoading ? "جاري الإنشاء..." : "إنشاء فترة جديدة"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BillingPeriodForm;
