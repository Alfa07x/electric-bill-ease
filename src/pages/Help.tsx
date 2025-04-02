
import React from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Help: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">المساعدة</h1>
        <p className="text-muted-foreground">دليل استخدام نظام إدارة فواتير الكهرباء</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الأسئلة الشائعة</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>كيفية إضافة مشترك جديد؟</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>لإضافة مشترك جديد، اتبع الخطوات التالية:</p>
                  <ol className="list-decimal list-inside mr-4 space-y-1">
                    <li>انتقل إلى صفحة "المشتركين" من القائمة الرئيسية.</li>
                    <li>انقر على زر "إضافة مشترك جديد".</li>
                    <li>أدخل بيانات المشترك (الاسم، العنوان، رقم الهاتف، إلخ).</li>
                    <li>انقر على زر "إضافة المشترك" لحفظ البيانات.</li>
                  </ol>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>كيفية إنشاء فاتورة جديدة؟</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>لإنشاء فاتورة جديدة، يجب إدخال قراءة العداد. اتبع الخطوات التالية:</p>
                  <ol className="list-decimal list-inside mr-4 space-y-1">
                    <li>انتقل إلى صفحة "الفواتير" من القائمة الرئيسية.</li>
                    <li>انقر على زر "إنشاء فاتورة جديدة".</li>
                    <li>اختر المشترك من القائمة المنسدلة.</li>
                    <li>أدخل القراءة الحالية للعداد (القراءة السابقة ستظهر تلقائياً).</li>
                    <li>حدد تاريخ القراءة.</li>
                    <li>انقر على زر "حفظ قراءة العداد وإنشاء الفاتورة".</li>
                  </ol>
                  <p className="mt-2">ملاحظة: يمكنك أيضاً إنشاء فاتورة من صفحة المشترك مباشرة.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>كيفية تسجيل دفعة؟</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>لتسجيل دفعة، اتبع الخطوات التالية:</p>
                  <ol className="list-decimal list-inside mr-4 space-y-1">
                    <li>انتقل إلى صفحة "المدفوعات" من القائمة الرئيسية.</li>
                    <li>انقر على زر "تسجيل دفعة جديدة".</li>
                    <li>اختر المشترك من القائمة المنسدلة.</li>
                    <li>اختر الفاتورة المراد تسديدها.</li>
                    <li>أدخل المبلغ وطريقة الدفع.</li>
                    <li>حدد تاريخ الدفع وأضف أي ملاحظات (اختياري).</li>
                    <li>انقر على زر "تسجيل الدفعة".</li>
                  </ol>
                  <p className="mt-2">ملاحظة: يمكنك أيضاً تسجيل دفعة من صفحة تفاصيل الفاتورة مباشرة.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>كيفية إنشاء فترة فوترية جديدة؟</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>لإنشاء فترة فوترية جديدة، اتبع الخطوات التالية:</p>
                  <ol className="list-decimal list-inside mr-4 space-y-1">
                    <li>انتقل إلى صفحة "الفترات" من القائمة الرئيسية.</li>
                    <li>انقر على زر "إنشاء فترة جديدة".</li>
                    <li>أدخل اسم الفترة (مثال: "مارس 2023").</li>
                    <li>حدد تاريخ بدء الفترة.</li>
                    <li>انقر على زر "إنشاء فترة جديدة".</li>
                  </ol>
                  <p className="mt-2">ملاحظة: عند إنشاء فترة جديدة، سيتم ترحيل المبالغ غير المسددة من الفترة السابقة تلقائياً.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>كيفية طباعة الفواتير؟</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>لطباعة فاتورة، اتبع الخطوات التالية:</p>
                  <ol className="list-decimal list-inside mr-4 space-y-1">
                    <li>انتقل إلى صفحة تفاصيل المشترك.</li>
                    <li>اختر الفاتورة المراد طباعتها.</li>
                    <li>انقر على زر "طباعة" في أعلى تفاصيل الفاتورة.</li>
                    <li>سيتم فتح نافذة الطباعة الخاصة بالمتصفح. اختر الطابعة وإعدادات الطباعة المناسبة.</li>
                    <li>انقر على "طباعة".</li>
                  </ol>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>كيفية تغيير إعدادات النظام؟</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>لتغيير إعدادات النظام، اتبع الخطوات التالية:</p>
                  <ol className="list-decimal list-inside mr-4 space-y-1">
                    <li>انتقل إلى صفحة "الإعدادات" من القائمة الرئيسية.</li>
                    <li>في تبويب "إعدادات النظام"، يمكنك تعديل القيم التالية:</li>
                    <ul className="list-disc list-inside mr-8 space-y-1">
                      <li>سعر الكيلوواط (ريال)</li>
                      <li>رسوم الاشتراك الثابتة (ريال)</li>
                      <li>نسبة الضريبة (0-1)</li>
                    </ul>
                    <li>انقر على زر "حفظ الإعدادات" لتطبيق التغييرات.</li>
                  </ol>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>اتصل بنا</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              إذا كنت بحاجة إلى مساعدة إضافية، يرجى الاتصال بفريق الدعم الفني:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">الدعم الفني</h3>
                <p className="text-muted-foreground">
                  البريد الإلكتروني: support@electricity.com<br />
                  الهاتف: 920001234
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">ساعات العمل</h3>
                <p className="text-muted-foreground">
                  من الأحد إلى الخميس<br />
                  8:00 صباحاً - 4:00 مساءً
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
