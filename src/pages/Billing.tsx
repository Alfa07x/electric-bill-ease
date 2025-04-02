
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Check, CreditCard, FileText, Plus, Printer, Search, X } from "lucide-react";
import { Bill, BillingPeriod, Customer } from "@/types/models";
import { 
  billService, 
  billingPeriodService, 
  customerService 
} from "@/services/storage.service";
import { formatCurrency, formatDate } from "@/utils/formatters";

const Billing: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [periods, setPeriods] = useState<BillingPeriod[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    // تحميل البيانات
    const loadedBills = billService.getAll();
    const loadedPeriods = billingPeriodService.getAll();
    const loadedCustomers = customerService.getAll();
    
    setBills(loadedBills);
    setFilteredBills(loadedBills);
    setPeriods(loadedPeriods);
    setCustomers(loadedCustomers);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedPeriod, selectedStatus, bills]);

  const applyFilters = () => {
    let filtered = [...bills];
    
    // تطبيق فلتر الفترة
    if (selectedPeriod !== "all") {
      filtered = filtered.filter(bill => bill.periodId === selectedPeriod);
    }
    
    // تطبيق فلتر الحالة
    if (selectedStatus !== "all") {
      const isPaid = selectedStatus === "paid";
      filtered = filtered.filter(bill => bill.isPaid === isPaid);
    }
    
    // تطبيق فلتر البحث
    if (searchTerm) {
      filtered = filtered.filter(bill => {
        const customer = customers.find(c => c.id === bill.customerId);
        
        return (
          customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer?.accountNumber.includes(searchTerm) ||
          customer?.meterNumber.includes(searchTerm) ||
          bill.id.includes(searchTerm)
        );
      });
    }
    
    setFilteredBills(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedPeriod("all");
    setSelectedStatus("all");
  };

  const getCustomerName = (customerId: string): string => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : "-";
  };

  const getPeriodName = (periodId: string): string => {
    const period = periods.find(p => p.id === periodId);
    return period ? period.name : "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">الفواتير</h1>
        <Button asChild>
          <Link to="/billing/new">
            <Plus className="ml-2 h-4 w-4" />
            إنشاء فاتورة جديدة
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن فاتورة..."
                className="pl-8 pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex-1 sm:max-w-xs">
              <Select
                value={selectedPeriod}
                onValueChange={setSelectedPeriod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفترات</SelectItem>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 sm:max-w-xs">
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="paid">مدفوعة</SelectItem>
                  <SelectItem value="unpaid">غير مدفوعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={resetFilters}>
              إعادة ضبط
            </Button>
          </div>

          {filteredBills.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>المشترك</TableHead>
                    <TableHead>الفترة</TableHead>
                    <TableHead>تاريخ الإصدار</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.id.substring(0, 8)}</TableCell>
                      <TableCell>{getCustomerName(bill.customerId)}</TableCell>
                      <TableCell>{getPeriodName(bill.periodId)}</TableCell>
                      <TableCell>{formatDate(bill.issueDate)}</TableCell>
                      <TableCell>{formatCurrency(bill.totalAmount)}</TableCell>
                      <TableCell>
                        {bill.isPaid ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="ml-1 h-3 w-3" />
                            مدفوع
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <X className="ml-1 h-3 w-3" />
                            غير مدفوع
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/customers/${bill.customerId}?bill=${bill.id}`)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/payments/new?billId=${bill.id}`)}
                            disabled={bill.isPaid}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              {searchTerm || selectedPeriod !== "all" || selectedStatus !== "all"
                ? "لا توجد نتائج مطابقة"
                : "لا توجد فواتير حتى الآن"
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
