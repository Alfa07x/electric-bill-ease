
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Search } from "lucide-react";
import { Payment, Bill, Customer } from "@/types/models";
import { 
  paymentService, 
  billService, 
  customerService
} from "@/services/storage.service";
import { formatCurrency, formatDate } from "@/utils/formatters";

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    // تحميل البيانات
    const loadedPayments = paymentService.getAll();
    const loadedCustomers = customerService.getAll();
    const loadedBills = billService.getAll();
    
    setPayments(loadedPayments);
    setFilteredPayments(loadedPayments);
    setCustomers(loadedCustomers);
    setBills(loadedBills);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCustomer, selectedPaymentMethod, payments]);

  const applyFilters = () => {
    let filtered = [...payments];
    
    // تطبيق فلتر المشترك
    if (selectedCustomer !== "all") {
      filtered = filtered.filter(payment => payment.customerId === selectedCustomer);
    }
    
    // تطبيق فلتر طريقة الدفع
    if (selectedPaymentMethod !== "all") {
      filtered = filtered.filter(payment => payment.paymentMethod === selectedPaymentMethod);
    }
    
    // تطبيق فلتر البحث
    if (searchTerm) {
      filtered = filtered.filter(payment => {
        const customer = customers.find(c => c.id === payment.customerId);
        
        return (
          customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer?.accountNumber.includes(searchTerm) ||
          payment.id.includes(searchTerm)
        );
      });
    }
    
    setFilteredPayments(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCustomer("all");
    setSelectedPaymentMethod("all");
  };

  const getCustomerName = (customerId: string): string => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : "-";
  };

  const getBillNumber = (billId: string): string => {
    const bill = bills.find(b => b.id === billId);
    return bill ? bill.id.substring(0, 8) : "-";
  };

  const getPaymentMethodName = (method: string): string => {
    switch (method) {
      case "cash": return "نقدي";
      case "card": return "بطاقة ائتمان";
      case "bank": return "تحويل بنكي";
      case "other": return "أخرى";
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">المدفوعات</h1>
        <Button asChild>
          <Link to="/payments/new">
            تسجيل دفعة جديدة
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل المدفوعات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                className="pl-8 pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex-1 sm:max-w-xs">
              <Select
                value={selectedCustomer}
                onValueChange={setSelectedCustomer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المشترك" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المشتركين</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 sm:max-w-xs">
              <Select
                value={selectedPaymentMethod}
                onValueChange={setSelectedPaymentMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع طرق الدفع</SelectItem>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="card">بطاقة ائتمان</SelectItem>
                  <SelectItem value="bank">تحويل بنكي</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={resetFilters}>
              إعادة ضبط
            </Button>
          </div>

          {filteredPayments.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم العملية</TableHead>
                    <TableHead>المشترك</TableHead>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>تاريخ الدفع</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead>ملاحظات</TableHead>
                    <TableHead className="text-left">عرض</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id.substring(0, 8)}</TableCell>
                      <TableCell>{getCustomerName(payment.customerId)}</TableCell>
                      <TableCell>{getBillNumber(payment.billId)}</TableCell>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{getPaymentMethodName(payment.paymentMethod)}</TableCell>
                      <TableCell>{payment.notes || "-"}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          asChild
                        >
                          <Link to={`/customers/${payment.customerId}?bill=${payment.billId}`}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              {searchTerm || selectedCustomer !== "all" || selectedPaymentMethod !== "all"
                ? "لا توجد نتائج مطابقة"
                : "لا توجد مدفوعات حتى الآن"
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;
