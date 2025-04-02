
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Edit, 
  FileText, 
  CreditCard,
  Check,
  X,
  Calendar,
  Printer
} from "lucide-react";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Customer, Bill, Payment, MeterReading } from "@/types/models";
import { 
  customerService, 
  billService, 
  paymentService,
  meterReadingService,
  billingPeriodService
} from "@/services/storage.service";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatCurrency } from "@/utils/formatters";
import PaymentForm from "@/components/PaymentForm";
import BillDetails from "@/components/BillDetails";

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedBillPayments, setSelectedBillPayments] = useState<Payment[]>([]);
  const [selectedBillReading, setSelectedBillReading] = useState<MeterReading | null>(null);
  const [selectedBillPeriod, setSelectedBillPeriod] = useState<string>("");
  const billDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadCustomerData();
    }
  }, [id]);

  useEffect(() => {
    if (selectedBill) {
      // تحميل المدفوعات المرتبطة بالفاتورة المحددة
      const billPayments = paymentService.getByBill(selectedBill.id);
      setSelectedBillPayments(billPayments);
      
      // تحميل قراءة العداد المرتبطة بالفاتورة
      const reading = meterReadingService.getById(selectedBill.meterReadingId);
      setSelectedBillReading(reading || null);
      
      // تحميل الفترة المرتبطة بالفاتورة
      const period = billingPeriodService.getById(selectedBill.periodId);
      setSelectedBillPeriod(period?.name || "");
    } else {
      setSelectedBillPayments([]);
      setSelectedBillReading(null);
      setSelectedBillPeriod("");
    }
  }, [selectedBill]);

  const loadCustomerData = () => {
    const foundCustomer = customerService.getById(id!);
    
    if (foundCustomer) {
      setCustomer(foundCustomer);
      
      // تحميل فواتير المشترك
      const customerBills = billService.getByCustomer(foundCustomer.id);
      setBills(customerBills);
      
      // تحميل قراءات العداد
      const readings = meterReadingService.getAll()
        .filter(reading => reading.customerId === foundCustomer.id)
        .sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
      
      setMeterReadings(readings);
      
      // تحميل المدفوعات
      const customerPayments = paymentService.getByCustomer(foundCustomer.id);
      setPayments(customerPayments);
      
      // تحديد الفاتورة الأحدث افتراضياً
      if (customerBills.length > 0) {
        setSelectedBill(customerBills[0]);
      }
    } else {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على المشترك",
        variant: "destructive"
      });
      navigate("/customers");
    }
    
    setLoading(false);
  };

  const handlePaymentSuccess = () => {
    loadCustomerData();
  };

  const handlePrintBill = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (printWindow && billDetailsRef.current) {
      // Get the HTML content of the bill details
      const content = billDetailsRef.current.innerHTML;
      
      // Create a complete HTML document with necessary styles
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>فاتورة - ${customer?.name || ''}</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; }
              th { background-color: #f2f2f2; }
              .text-success { color: #10b981; }
              .text-danger { color: #ef4444; }
              .text-right { text-align: right; }
              .text-left { text-align: left; }
              .font-bold { font-weight: bold; }
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
    }
  };

  const getContractTypeName = (type: string | undefined): string => {
    switch (type) {
      case "residential": return "سكني";
      case "commercial": return "تجاري";
      case "industrial": return "صناعي";
      case "government": return "حكومي";
      case "other": return "أخرى";
      default: return "سكني";
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <p className="text-red-500">لم يتم العثور على المشترك</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">
            رقم الحساب: {customer.accountNumber} | رقم العداد: {customer.meterNumber}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to={`/customers/${customer.id}/edit`}>
              <Edit className="ml-2 h-4 w-4" />
              تعديل
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/customers">
              العودة للقائمة
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>بيانات المشترك</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">الاسم</dt>
                <dd className="text-lg">{customer.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">العنوان</dt>
                <dd>{customer.address}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">رقم الهاتف</dt>
                <dd>{customer.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">رقم الحساب</dt>
                <dd>{customer.accountNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">رقم العداد</dt>
                <dd>{customer.meterNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">نوع العقد</dt>
                <dd>{getContractTypeName(customer.contractType)}</dd>
              </div>
              {customer.notes && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">ملاحظات</dt>
                  <dd>{customer.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="bills">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="bills" className="flex-1">الفواتير</TabsTrigger>
              <TabsTrigger value="readings" className="flex-1">قراءات العداد</TabsTrigger>
              <TabsTrigger value="payments" className="flex-1">المدفوعات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bills">
              <Card>
                <CardHeader>
                  <CardTitle>فواتير المشترك</CardTitle>
                </CardHeader>
                <CardContent>
                  {bills.length > 0 ? (
                    <div className="space-y-4">
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>رقم الفاتورة</TableHead>
                              <TableHead>الفترة</TableHead>
                              <TableHead>تاريخ الإصدار</TableHead>
                              <TableHead>الاستهلاك</TableHead>
                              <TableHead>المبلغ</TableHead>
                              <TableHead>الحالة</TableHead>
                              <TableHead className="text-left">تفاصيل</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bills.map((bill) => {
                              const period = billingPeriodService.getById(bill.periodId);
                              
                              return (
                                <TableRow 
                                  key={bill.id}
                                  className={selectedBill?.id === bill.id ? "bg-gray-50" : ""}
                                >
                                  <TableCell className="font-medium">{bill.id.substring(0, 8)}</TableCell>
                                  <TableCell>{period?.name || "-"}</TableCell>
                                  <TableCell>{formatDate(bill.issueDate)}</TableCell>
                                  <TableCell>{bill.consumption} كيلوواط</TableCell>
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
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setSelectedBill(bill)}
                                    >
                                      <FileText className="ml-1 h-4 w-4" />
                                      عرض
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {selectedBill && selectedBillReading && (
                        <div className="mt-6" ref={billDetailsRef}>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">تفاصيل الفاتورة</h3>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="print:hidden" onClick={handlePrintBill}>
                                <Printer className="ml-1 h-4 w-4" />
                                طباعة
                              </Button>
                              {!selectedBill.isPaid && (
                                <Button 
                                  size="sm"
                                  onClick={() => document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth" })}
                                >
                                  <CreditCard className="ml-1 h-4 w-4" />
                                  تسجيل دفعة
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <BillDetails 
                            bill={selectedBill}
                            customer={customer}
                            meterReading={selectedBillReading}
                            period={{
                              id: selectedBill.periodId,
                              name: selectedBillPeriod,
                              startDate: new Date(),
                              isActive: false,
                              createdAt: new Date()
                            }}
                            payments={selectedBillPayments}
                            onPrint={handlePrintBill}
                          />
                          
                          {!selectedBill.isPaid && (
                            <div id="payment-section" className="mt-6">
                              <PaymentForm 
                                billId={selectedBill.id} 
                                customerId={customer.id} 
                                onSuccess={handlePaymentSuccess} 
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p className="mb-4">لا توجد فواتير لهذا المشترك حتى الآن</p>
                      <Button asChild>
                        <Link to={`/billing/new?customerId=${customer.id}`}>
                          إنشاء فاتورة جديدة
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="readings">
              <Card>
                <CardHeader>
                  <CardTitle>قراءات العداد</CardTitle>
                </CardHeader>
                <CardContent>
                  {meterReadings.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>تاريخ القراءة</TableHead>
                            <TableHead>الفترة</TableHead>
                            <TableHead>القراءة السابقة</TableHead>
                            <TableHead>القراءة الحالية</TableHead>
                            <TableHead>الاستهلاك</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {meterReadings.map((reading) => {
                            const period = billingPeriodService.getById(reading.periodId);
                            
                            return (
                              <TableRow key={reading.id}>
                                <TableCell>{formatDate(reading.readingDate)}</TableCell>
                                <TableCell>{period?.name || "-"}</TableCell>
                                <TableCell>{reading.previousReading} كيلوواط</TableCell>
                                <TableCell>{reading.currentReading} كيلوواط</TableCell>
                                <TableCell className="font-medium">{reading.consumption} كيلوواط</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      لا توجد قراءات عداد لهذا المشترك حتى الآن
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>سجل المدفوعات</CardTitle>
                </CardHeader>
                <CardContent>
                  {payments.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>تاريخ الدفع</TableHead>
                            <TableHead>رقم الفاتورة</TableHead>
                            <TableHead>المبلغ</TableHead>
                            <TableHead>طريقة الدفع</TableHead>
                            <TableHead>ملاحظات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((payment) => {
                            const bill = billService.getById(payment.billId);
                            const period = bill ? billingPeriodService.getById(bill.periodId)?.name : "-";
                            
                            return (
                              <TableRow key={payment.id}>
                                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                                <TableCell>
                                  {bill ? (
                                    <div>
                                      <div>{bill.id.substring(0, 8)}</div>
                                      <div className="text-xs text-gray-500">{period}</div>
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                                <TableCell>{getPaymentMethodName(payment.paymentMethod)}</TableCell>
                                <TableCell>{payment.notes || "-"}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      لا توجد مدفوعات لهذا المشترك حتى الآن
                    </div>
                  )}
                  
                  {bills.some(bill => !bill.isPaid) && (
                    <div className="mt-6">
                      <Alert className="mb-4">
                        <AlertTitle>تسجيل دفعة جديدة</AlertTitle>
                        <AlertDescription>
                          يمكنك تسجيل دفعة جديدة لأي من الفواتير غير المسددة.
                        </AlertDescription>
                      </Alert>
                      
                      <PaymentForm 
                        customerId={customer.id} 
                        onSuccess={handlePaymentSuccess} 
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
