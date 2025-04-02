
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
import { Badge } from "@/components/ui/badge";
import { Calendar, Check } from "lucide-react";
import { BillingPeriod, Bill } from "@/types/models";
import { 
  billingPeriodService, 
  billService 
} from "@/services/storage.service";
import { formatCurrency, formatDate } from "@/utils/formatters";

const Periods: React.FC = () => {
  const [periods, setPeriods] = useState<BillingPeriod[]>([]);
  const [periodStats, setPeriodStats] = useState<Record<string, { 
    billCount: number; 
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  }>>({});

  useEffect(() => {
    // تحميل البيانات
    loadPeriods();
  }, []);

  const loadPeriods = () => {
    const loadedPeriods = billingPeriodService.getAll()
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    setPeriods(loadedPeriods);
    
    // حساب إحصائيات كل فترة
    const stats: Record<string, { 
      billCount: number; 
      totalAmount: number;
      paidAmount: number;
      outstandingAmount: number;
    }> = {};
    
    const bills = billService.getAll();
    
    loadedPeriods.forEach(period => {
      const periodBills = bills.filter(bill => bill.periodId === period.id);
      const totalAmount = periodBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      const paidAmount = periodBills.reduce((sum, bill) => sum + bill.paidAmount, 0);
      const outstandingAmount = totalAmount - paidAmount;
      
      stats[period.id] = {
        billCount: periodBills.length,
        totalAmount,
        paidAmount,
        outstandingAmount
      };
    });
    
    setPeriodStats(stats);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">الفترات الفوترية</h1>
        <Button asChild>
          <Link to="/periods/new">
            <Calendar className="ml-2 h-4 w-4" />
            إنشاء فترة جديدة
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الفترات</CardTitle>
        </CardHeader>
        <CardContent>
          {periods.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الفترة</TableHead>
                    <TableHead>تاريخ البدء</TableHead>
                    <TableHead>عدد الفواتير</TableHead>
                    <TableHead>إجمالي الفواتير</TableHead>
                    <TableHead>المدفوع</TableHead>
                    <TableHead>المتبقي</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map((period) => {
                    const stats = periodStats[period.id] || {
                      billCount: 0,
                      totalAmount: 0,
                      paidAmount: 0,
                      outstandingAmount: 0
                    };
                    
                    return (
                      <TableRow key={period.id}>
                        <TableCell className="font-medium">{period.name}</TableCell>
                        <TableCell>{formatDate(period.startDate)}</TableCell>
                        <TableCell>{stats.billCount}</TableCell>
                        <TableCell>{formatCurrency(stats.totalAmount)}</TableCell>
                        <TableCell className="text-green-600">
                          {formatCurrency(stats.paidAmount)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {formatCurrency(stats.outstandingAmount)}
                        </TableCell>
                        <TableCell>
                          {period.isActive ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <Check className="ml-1 h-3 w-3" />
                              نشطة
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              غير نشطة
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p className="mb-4">لا توجد فترات فوترية حتى الآن</p>
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
  );
};

export default Periods;
