
import React, { useEffect, useState } from "react";
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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Plus, FileText, Users, Zap, CreditCard, Calendar } from "lucide-react";
import MeterReadingForm from "@/components/MeterReadingForm";
import { 
  customerService, 
  billService, 
  billingPeriodService,
  paymentService,
  initializeData
} from "@/services/storage.service";
import { Bill, BillingPeriod, Customer, Payment } from "@/types/models";
import { formatCurrency } from "@/utils/formatters";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [activePeriod, setActivePeriod] = useState<BillingPeriod | null>(null);
  const [totalBilled, setTotalBilled] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [totalOutstanding, setTotalOutstanding] = useState<number>(0);
  const [billedByType, setBilledByType] = useState<Array<{ name: string; value: number }>>(
    []
  );
  const [paidVsUnpaid, setPaidVsUnpaid] = useState<Array<{ name: string; value: number }>>([]);
  const [topCustomers, setTopCustomers] = useState<Array<{ name: string; value: number }>>(
    []
  );
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);

  useEffect(() => {
    // تهيئة البيانات الافتراضية إذا لم تكن موجودة
    initializeData();
    
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // تحميل البيانات
    const loadedCustomers = customerService.getAll();
    const loadedBills = billService.getAll();
    const period = billingPeriodService.getActive();
    
    setCustomers(loadedCustomers);
    setBills(loadedBills);
    setActivePeriod(period || null);
    
    // حساب المبالغ الإجمالية
    let total = 0;
    let paid = 0;
    let outstanding = 0;
    
    loadedBills.forEach(bill => {
      total += bill.totalAmount;
      paid += bill.paidAmount;
      outstanding += bill.remainingAmount;
    });
    
    setTotalBilled(total);
    setTotalPaid(paid);
    setTotalOutstanding(outstanding);
    
    // تجميع المبالغ حسب نوع العقد
    const billsByType: Record<string, number> = {};
    
    loadedBills.forEach(bill => {
      const customer = loadedCustomers.find(c => c.id === bill.customerId);
      const type = customer?.contractType || "سكني";
      
      if (!billsByType[type]) {
        billsByType[type] = 0;
      }
      
      billsByType[type] += bill.totalAmount;
    });
    
    const billsTypeData = Object.entries(billsByType).map(([name, value]) => ({
      name: getContractTypeName(name),
      value
    }));
    
    setBilledByType(billsTypeData);
    
    // تجميع الفواتير المدفوعة وغير المدفوعة
    const paid_vs_unpaid = [
      { name: "مدفوع", value: paid },
      { name: "غير مدفوع", value: outstanding }
    ];
    
    setPaidVsUnpaid(paid_vs_unpaid);
    
    // أعلى 5 مشتركين من حيث الاستهلاك
    const customerConsumption: Record<string, number> = {};
    
    loadedBills.forEach(bill => {
      const customer = loadedCustomers.find(c => c.id === bill.customerId);
      
      if (customer) {
        if (!customerConsumption[customer.id]) {
          customerConsumption[customer.id] = 0;
        }
        
        customerConsumption[customer.id] += bill.consumption;
      }
    });
    
    const top5Customers = Object.entries(customerConsumption)
      .map(([id, consumption]) => ({
        id,
        name: loadedCustomers.find(c => c.id === id)?.name || "",
        value: consumption
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    setTopCustomers(top5Customers);
    
    // آخر 5 مدفوعات
    const payments = paymentService.getAll()
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 5);
    
    setRecentPayments(payments);
  };

  const getContractTypeName = (type: string): string => {
    switch (type) {
      case "residential": return "سكني";
      case "commercial": return "تجاري";
      case "industrial": return "صناعي";
      case "government": return "حكومي";
      case "other": return "أخرى";
      default: return type;
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  const STATUS_COLORS = ["#4caf50", "#f44336"];

  const handleBillCreated = () => {
    loadDashboardData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          {activePeriod && (
            <p className="text-muted-foreground">
              الفترة الحالية: {activePeriod.name}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/billing/new">
              <Plus className="ml-2 h-4 w-4" />
              فاتورة جديدة
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/customers/new">
              <Plus className="ml-2 h-4 w-4" />
              مشترك جديد
            </Link>
          </Button>
        </div>
      </div>

      {/* ملخص الإحصائيات */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <FileText className="ml-2 h-5 w-5" />
              إجمالي الفواتير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBilled)}</div>
            <p className="text-blue-100 mt-1">{bills.length} فاتورة</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <CreditCard className="ml-2 h-5 w-5" />
              إجمالي المدفوعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-green-100 mt-1">{((totalPaid / totalBilled) * 100).toFixed(1)}% من الإجمالي</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Zap className="ml-2 h-5 w-5" />
              المبالغ المستحقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
            <p className="text-red-100 mt-1">{((totalOutstanding / totalBilled) * 100).toFixed(1)}% من الإجمالي</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* إدخال قراءة عداد جديدة */}
        <MeterReadingForm onSuccess={handleBillCreated} />

        {/* المخططات والإحصائيات */}
        <Tabs defaultValue="charts">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="charts" className="flex-1">الإحصائيات</TabsTrigger>
            <TabsTrigger value="payments" className="flex-1">آخر المدفوعات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts">
            <Card>
              <CardHeader>
                <CardTitle>توزيع الفواتير والمدفوعات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="h-60">
                    <p className="text-center font-medium mb-2">توزيع الفواتير حسب نوع العقد</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={billedByType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {billedByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-60">
                    <p className="text-center font-medium mb-2">حالة المدفوعات</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paidVsUnpaid}
                          cx="50%"
                          cy="50%"
                          startAngle={0}
                          endAngle={360}
                          labelLine={false}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {paidVsUnpaid.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="mt-4 h-60">
                  <p className="text-center font-medium mb-2">أعلى 5 مشتركين من حيث الاستهلاك</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topCustomers}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(value) => [`${value} كيلوواط`, "الاستهلاك"]} />
                      <Bar dataKey="value" fill="#1e88e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>آخر المدفوعات</CardTitle>
              </CardHeader>
              <CardContent>
                {recentPayments.length > 0 ? (
                  <div className="space-y-4">
                    {recentPayments.map(payment => {
                      const customer = customers.find(c => c.id === payment.customerId);
                      
                      return (
                        <div key={payment.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{customer?.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(payment.paymentDate).toLocaleDateString('ar-SA')} - {payment.paymentMethod === 'cash' ? 'نقدي' : payment.paymentMethod === 'card' ? 'بطاقة ائتمان' : payment.paymentMethod === 'bank' ? 'تحويل بنكي' : 'أخرى'}
                            </p>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(payment.amount)}
                          </div>
                        </div>
                      );
                    })}
                    
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/payments">
                        عرض جميع المدفوعات
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    لا توجد مدفوعات حتى الآن
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ملخص المشتركين والفترات */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Users className="ml-2 h-5 w-5" />
              المشتركين
            </CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link to="/customers">عرض الكل</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium">إجمالي المشتركين:</span>
                <span className="text-lg">{customers.length}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium">المشتركين السكنيين:</span>
                <span>{customers.filter(c => c.contractType === "residential" || !c.contractType).length}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium">المشتركين التجاريين:</span>
                <span>{customers.filter(c => c.contractType === "commercial").length}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="font-medium">المشتركين الصناعيين:</span>
                <span>{customers.filter(c => c.contractType === "industrial").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Calendar className="ml-2 h-5 w-5" />
              الفترات الفوترية
            </CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link to="/periods">عرض الكل</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activePeriod ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-medium">الفترة الحالية:</span>
                    <span className="text-lg">{activePeriod.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-medium">تاريخ البدء:</span>
                    <span>{new Date(activePeriod.startDate).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-medium">عدد الفواتير في هذه الفترة:</span>
                    <span>{bills.filter(b => b.periodId === activePeriod.id).length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="font-medium">إجمالي الفواتير في هذه الفترة:</span>
                    <span className="font-bold">
                      {formatCurrency(bills.filter(b => b.periodId === activePeriod.id)
                        .reduce((sum, bill) => sum + bill.totalAmount, 0))}
                    </span>
                  </div>
                </div>
                
                <Button asChild variant="outline" className="w-full">
                  <Link to="/periods/new">
                    إنشاء فترة جديدة
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">لا توجد فترة فوترية نشطة حالياً</p>
                <Button asChild>
                  <Link to="/periods/new">
                    إنشاء فترة جديدة
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
