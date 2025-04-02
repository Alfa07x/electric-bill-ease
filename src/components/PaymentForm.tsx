
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
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
import { Bill, Customer, Payment } from "@/types/models";
import { 
  billService, 
  customerService, 
  paymentService,
  notificationService
} from "@/services/storage.service";

interface PaymentFormProps {
  billId?: string;
  customerId?: string;
  onSuccess?: (payment: Payment) => void;
}

const paymentMethods = [
  { id: "cash", name: "نقدي" },
  { id: "card", name: "بطاقة ائتمان" },
  { id: "bank", name: "تحويل بنكي" },
  { id: "other", name: "أخرى" }
];

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  billId, 
  customerId,
  onSuccess 
}) => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customerId || "");
  const [selectedBillId, setSelectedBillId] = useState<string>(billId || "");
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    // تحميل قائمة المشتركين
    const loadedCustomers = customerService.getAll();
    setCustomers(loadedCustomers);

    // إذا تم تحديد فاتورة، قم بتحميل تفاصيلها
    if (billId) {
      const bill = billService.getById(billId);
      if (bill) {
        setSelectedBill(bill);
        setAmount(bill.remainingAmount);
        setSelectedCustomerId(bill.customerId);
      }
    } else if (customerId) {
      // تحميل فواتير المشترك
      loadBillsByCustomer(customerId);
    }
  }, [billId, customerId]);

  useEffect(() => {
    if (selectedCustomerId && !billId) {
      loadBillsByCustomer(selectedCustomerId);
    }
  }, [selectedCustomerId, billId]);

  useEffect(() => {
    if (selectedBillId) {
      const bill = billService.getById(selectedBillId);
      if (bill) {
        setSelectedBill(bill);
        setAmount(bill.remainingAmount);
      }
    }
  }, [selectedBillId]);

  const loadBillsByCustomer = (custId: string) => {
    const customerBills = billService.getByCustomer(custId)
      .filter(bill => !bill.isPaid); // عرض الفواتير غير المدفوعة فقط
    
    setBills(customerBills);
    
    // تحديد أول فاتورة افتراضياً إذا كانت متوفرة
    if (customerBills.length > 0 && !selectedBillId) {
      setSelectedBillId(customerBills[0].id);
      setSelectedBill(customerBills[0]);
      setAmount(customerBills[0].remainingAmount);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBillId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار فاتورة",
        variant: "destructive"
      });
      return;
    }

    if (amount <= 0) {
      toast({
        title: "خطأ",
        description: "يجب أن يكون المبلغ أكبر من صفر",
        variant: "destructive"
      });
      return;
    }

    if (selectedBill && amount > selectedBill.remainingAmount) {
      toast({
        title: "خطأ",
        description: "المبلغ المدخل أكبر من المبلغ المتبقي",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // إنشاء دفعة جديدة
      const payment = paymentService.create({
        billId: selectedBillId,
        customerId: selectedCustomerId,
        amount,
        paymentDate,
        paymentMethod,
        notes
      });

      // إنشاء إشعار بالدفعة الجديدة
      const customer = customerService.getById(selectedCustomerId);
      notificationService.create({
        title: "تم تسجيل دفعة جديدة",
        message: `تم تسجيل دفعة بمبلغ ${amount.toFixed(2)} ريال للمشترك ${customer?.name}`,
        type: "payment"
      });

      toast({
        title: "تم بنجاح",
        description: "تم تسجيل الدفعة بنجاح",
      });

      // إعادة تعيين النموذج
      if (!billId && !customerId) {
        setSelectedCustomerId("");
        setSelectedBillId("");
        setBills([]);
      }
      setAmount(0);
      setNotes("");
      
      // تحديث الفاتورة المختارة
      const updatedBill = billService.getById(selectedBillId);
      if (updatedBill) {
        setSelectedBill(updatedBill);
      }
      
      // استدعاء دالة النجاح إذا كانت متوفرة
      if (onSuccess) {
        onSuccess(payment);
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدفعة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>تسجيل دفعة</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!customerId && (
            <div className="space-y-2">
              <Label htmlFor="customer">اختر المشترك</Label>
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
                disabled={!!billId}
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
          )}

          {(selectedCustomerId && !billId) && (
            <div className="space-y-2">
              <Label htmlFor="bill">اختر الفاتورة</Label>
              <Select
                value={selectedBillId}
                onValueChange={setSelectedBillId}
              >
                <SelectTrigger id="bill">
                  <SelectValue placeholder="اختر الفاتورة" />
                </SelectTrigger>
                <SelectContent>
                  {bills.length > 0 ? (
                    bills.map((bill) => (
                      <SelectItem key={bill.id} value={bill.id}>
                        فاتورة رقم {bill.id.substring(0, 8)} - {bill.remainingAmount.toFixed(2)} ريال
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-bills" disabled>
                      لا توجد فواتير غير مدفوعة
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedBill && (
            <div className="bg-gray-50 p-3 rounded-md mb-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">إجمالي الفاتورة:</span> {selectedBill.totalAmount.toFixed(2)} ريال
                </div>
                <div>
                  <span className="font-medium">المبلغ المدفوع:</span> {selectedBill.paidAmount.toFixed(2)} ريال
                </div>
                <div className="col-span-2">
                  <span className="font-medium">المبلغ المتبقي:</span>{" "}
                  <span className="text-danger font-medium">{selectedBill.remainingAmount.toFixed(2)} ريال</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ (ريال)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">طريقة الدفع</Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate">تاريخ الدفع</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-right"
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {paymentDate ? formatDate(paymentDate) : "اختر التاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => date && setPaymentDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="إضافة ملاحظات (اختياري)"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={!selectedBillId || amount <= 0 || isLoading || (selectedBill && amount > selectedBill.remainingAmount)}
            >
              {isLoading ? "جاري التسجيل..." : "تسجيل الدفعة"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
