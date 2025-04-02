import React from "react";
import { Bill, Customer, MeterReading, BillingPeriod, Payment } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { formatDate } from "@/utils/formatters";

interface BillDetailsProps {
  bill: Bill;
  customer: Customer;
  meterReading: MeterReading;
  period: BillingPeriod;
  payments: Payment[];
  onPrint?: () => void;
}

const BillDetails: React.FC<BillDetailsProps> = ({
  bill,
  customer,
  meterReading,
  period,
  payments,
  onPrint
}) => {
  const printBill = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  // Helper function to safely handle dates
  const getDueDate = (): Date => {
    if (bill.dueDate) {
      const dueDate = bill.dueDate instanceof Date ? bill.dueDate : new Date(bill.dueDate);
      if (!isNaN(dueDate.getTime())) return dueDate;
    }
    
    // If issueDate is not a valid Date object, create a new one
    const issueDate = bill.issueDate instanceof Date && !isNaN(bill.issueDate.getTime())
      ? bill.issueDate
      : bill.issueDate instanceof Date ? new Date() : new Date(bill.issueDate || new Date());
      
    // Add 14 days to issue date as default due date
    const defaultDueDate = new Date(issueDate);
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);
    return defaultDueDate;
  };

  return (
    <Card className="print:shadow-none print:border-none" id="bill-print-section">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">تفاصيل الفاتورة</CardTitle>
        <div className="flex space-x-2 space-x-reverse">
          <Button size="sm" variant="outline" onClick={printBill} className="print:hidden">
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
          <Button size="sm" variant="outline" className="print:hidden">
            <Download className="ml-2 h-4 w-4" />
            تصدير PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="print:text-black">
          {/* شعار وعنوان الفاتورة */}
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div className="flex items-center">
              <div className="bg-electric-primary text-white p-2 rounded-full ml-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 2L3 14h9l-1 8 10-16h-9l1-4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">شركة الكهرباء</h2>
                <p className="text-gray-500">فاتورة استهلاك الكهرباء</p>
              </div>
            </div>
            <div className="text-left">
              <p className="font-bold">رقم الفاتورة: {bill.id.substring(0, 8)}</p>
              <p>تاريخ الإصدار: {formatDate(bill.issueDate)}</p>
              <p>فترة الفوترة: {period.name}</p>
            </div>
          </div>

          {/* معلومات المشترك */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-bold mb-2 text-electric-secondary">معلومات المشترك</h3>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="font-medium pl-2">الاسم:</td>
                    <td>{customer.name}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pl-2">رقم الحساب:</td>
                    <td>{customer.accountNumber}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pl-2">رقم العداد:</td>
                    <td>{customer.meterNumber}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pl-2">العنوان:</td>
                    <td>{customer.address}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pl-2">رقم الهاتف:</td>
                    <td>{customer.phone}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="font-bold mb-2 text-electric-secondary">معلومات الاستهلاك</h3>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="font-medium pl-2">القراءة الحالية:</td>
                    <td>{meterReading.currentReading} كيلوواط</td>
                  </tr>
                  <tr>
                    <td className="font-medium pl-2">القراءة السابقة:</td>
                    <td>{meterReading.previousReading} كيلوواط</td>
                  </tr>
                  <tr>
                    <td className="font-medium pl-2">تاريخ القراءة:</td>
                    <td>{formatDate(meterReading.readingDate)}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pl-2">الاستهلاك:</td>
                    <td>{bill.consumption} كيلوواط</td>
                  </tr>
                  <tr>
                    <td className="font-medium pl-2">نوع العقد:</td>
                    <td>{customer.contractType || "سكني"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* تفاصيل الفاتورة */}
          <div className="mb-6">
            <h3 className="font-bold mb-3 text-electric-secondary">تفاصيل الفاتورة</h3>
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-right">الوصف</th>
                  <th className="border p-2 text-right">التفاصيل</th>
                  <th className="border p-2 text-left">المبلغ (ريال)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">استهلاك الكهرباء</td>
                  <td className="border p-2">{bill.consumption} كيلوواط</td>
                  <td className="border p-2 text-left">{bill.consumptionCost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border p-2">رسوم الاشتراك الثابتة</td>
                  <td className="border p-2">رسوم شهرية ثابتة</td>
                  <td className="border p-2 text-left">{bill.subscriptionFee.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border p-2">ضريبة القيمة المضافة</td>
                  <td className="border p-2">15% من تكلفة الاستهلاك</td>
                  <td className="border p-2 text-left">{bill.taxAmount.toFixed(2)}</td>
                </tr>
                {bill.previousBalance > 0 && (
                  <tr>
                    <td className="border p-2">رصيد سابق</td>
                    <td className="border p-2">مبلغ غير مسدد من الفترة السابقة</td>
                    <td className="border p-2 text-left">{bill.previousBalance.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="bg-gray-100 font-bold">
                  <td className="border p-2">إجمالي الفاتورة</td>
                  <td className="border p-2"></td>
                  <td className="border p-2 text-left">{bill.totalAmount.toFixed(2)}</td>
                </tr>
                {bill.paidAmount > 0 && (
                  <tr className="text-success">
                    <td className="border p-2">المبلغ المدفوع</td>
                    <td className="border p-2"></td>
                    <td className="border p-2 text-left">-{bill.paidAmount.toFixed(2)}</td>
                  </tr>
                )}
                <tr className={`font-bold ${bill.isPaid ? 'text-success' : 'text-danger'}`}>
                  <td className="border p-2">المبلغ المتبقي</td>
                  <td className="border p-2"></td>
                  <td className="border p-2 text-left">{bill.remainingAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* المدفوعات */}
          {payments.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-electric-secondary">سجل المدفوعات</h3>
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-right">تاريخ الدفع</th>
                    <th className="border p-2 text-right">طريقة الدفع</th>
                    <th className="border p-2 text-right">ملاحظات</th>
                    <th className="border p-2 text-left">المبلغ (ريال)</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="border p-2">{formatDate(payment.paymentDate)}</td>
                      <td className="border p-2">{payment.paymentMethod}</td>
                      <td className="border p-2">{payment.notes || '-'}</td>
                      <td className="border p-2 text-left">{payment.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* حالة الفاتورة */}
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  يرجى سداد المبلغ المستحق قبل تاريخ {formatDate(getDueDate())}
                </p>
                <p className="text-sm text-gray-500">
                  للاستفسارات، يرجى الاتصال على: 920001234
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full font-medium ${bill.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {bill.isPaid ? 'مدفوع' : 'غير مدفوع'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillDetails;
