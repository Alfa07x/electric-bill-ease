
import React, { useState, useEffect, useRef } from "react";
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
import { FileText, Search, Printer } from "lucide-react";
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
  const paymentsTableRef = useRef<HTMLDivElement>(null);

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

  const handlePrintPayments = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (printWindow && paymentsTableRef.current) {
      // Get the current date for the report header
      const currentDate = new Date().toLocaleDateString('ar-SA');
      
      // Create a complete HTML document with necessary styles
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير المدفوعات</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .report-header { text-align: center; margin-bottom: 20px; }
              .report-title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
              .report-date { font-size: 14px; color: #666; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <div class="report-title">تقرير المدفوعات</div>
            <div class="report-date">تاريخ التقرير: ${currentDate}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>رقم العملية</th>
                <th>المشترك</th>
                <th>رقم الفاتورة</th>
                <th>تاريخ الدفع</th>
                <th>المبلغ</th>
                <th>طريقة الدفع</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPayments.map(payment => `
                <tr>
                  <td>${payment.id.substring(0, 8)}</td>
                  <td>${getCustomerName(payment.customerId)}</td>
                  <td>${getBillNumber(payment.billId)}</td>
                  <td>${formatDate(payment.paymentDate)}</td>
                  <td>${formatCurrency(payment.amount)}</td>
                  <td>${getPaymentMethodName(payment.paymentMethod)}</td>
                  <td>${payment.notes || "-"}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">المدفوعات</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/payments/new">
              تسجيل دفعة جديدة
            </Link>
          </Button>
          <Button variant="outline" onClick={handlePrintPayments} className="print:hidden">
            <Printer className="ml-2 h-4 w-4" />
            طباعة التقرير
          </Button>
        </div>
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
            <div className="rounded-md border overflow-hidden" ref={paymentsTableRef}>
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
                    <TableHead className="text-left print:hidden">عرض</TableHead>
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
                      <TableCell className="print:hidden">
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
