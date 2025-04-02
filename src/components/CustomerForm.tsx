
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Customer } from "@/types/models";
import { customerService, notificationService } from "@/services/storage.service";

interface CustomerFormProps {
  customerId?: string;
  onSuccess?: (customer: Customer) => void;
}

const contractTypes = [
  { id: "residential", name: "سكني" },
  { id: "commercial", name: "تجاري" },
  { id: "industrial", name: "صناعي" },
  { id: "government", name: "حكومي" },
  { id: "other", name: "أخرى" }
];

const CustomerForm: React.FC<CustomerFormProps> = ({ 
  customerId,
  onSuccess
}) => {
  const { toast } = useToast();
  const [isEdit, setIsEdit] = useState<boolean>(!!customerId);
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [meterNumber, setMeterNumber] = useState<string>("");
  const [contractType, setContractType] = useState<string>("residential");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (customerId) {
      const customer = customerService.getById(customerId);
      if (customer) {
        setName(customer.name);
        setAddress(customer.address);
        setPhone(customer.phone);
        setAccountNumber(customer.accountNumber);
        setMeterNumber(customer.meterNumber);
        setContractType(customer.contractType || "residential");
        setNotes(customer.notes || "");
      }
    } else {
      // توليد رقم حساب ورقم عداد جديد
      generateAccountNumbers();
    }
  }, [customerId]);

  const generateAccountNumbers = () => {
    const customers = customerService.getAll();
    let maxAccountNumber = 1000;
    let maxMeterNumber = 1000;
    
    customers.forEach(customer => {
      const accNum = parseInt(customer.accountNumber);
      const mtrNum = parseInt(customer.meterNumber.replace("M", ""));
      
      if (!isNaN(accNum) && accNum > maxAccountNumber) {
        maxAccountNumber = accNum;
      }
      
      if (!isNaN(mtrNum) && mtrNum > maxMeterNumber) {
        maxMeterNumber = mtrNum;
      }
    });
    
    setAccountNumber((maxAccountNumber + 1).toString());
    setMeterNumber(`M${maxMeterNumber + 1}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !address || !phone || !accountNumber || !meterNumber) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const customerData: Partial<Customer> = {
        name,
        address,
        phone,
        accountNumber,
        meterNumber,
        contractType,
        notes
      };
      
      let customer: Customer;
      
      if (isEdit && customerId) {
        customer = customerService.update(customerId, customerData) as Customer;
        
        notificationService.create({
          title: "تم تحديث بيانات مشترك",
          message: `تم تحديث بيانات المشترك: ${name}`,
          type: "update"
        });
        
        toast({
          title: "تم بنجاح",
          description: "تم تحديث بيانات المشترك بنجاح",
        });
      } else {
        customer = customerService.create(customerData as Omit<Customer, "id" | "createdAt">);
        
        notificationService.create({
          title: "تم إضافة مشترك جديد",
          message: `تم إضافة مشترك جديد: ${name}`,
          type: "create"
        });
        
        toast({
          title: "تم بنجاح",
          description: "تمت إضافة المشترك بنجاح",
        });
        
        // إعادة تعيين النموذج
        setName("");
        setAddress("");
        setPhone("");
        generateAccountNumbers();
        setNotes("");
      }
      
      // استدعاء دالة النجاح إذا كانت متوفرة
      if (onSuccess) {
        onSuccess(customer);
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ بيانات المشترك",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "تعديل بيانات المشترك" : "إضافة مشترك جديد"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم المشترك</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم المشترك"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">رقم الحساب</Label>
              <Input
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="رقم الحساب"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meterNumber">رقم العداد</Label>
              <Input
                id="meterNumber"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                placeholder="رقم العداد"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="أدخل عنوان المشترك"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractType">نوع العقد</Label>
              <Select
                value={contractType}
                onValueChange={setContractType}
              >
                <SelectTrigger id="contractType">
                  <SelectValue placeholder="اختر نوع العقد" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              disabled={isLoading}
            >
              {isLoading ? "جاري الحفظ..." : isEdit ? "تحديث البيانات" : "إضافة المشترك"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomerForm;
