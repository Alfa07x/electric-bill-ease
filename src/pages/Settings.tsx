
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SystemSettingsForm from "@/components/SystemSettingsForm";

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات النظام</p>
      </div>

      <Tabs defaultValue="system">
        <TabsList className="w-full mb-4 max-w-md">
          <TabsTrigger value="system" className="flex-1">إعدادات النظام</TabsTrigger>
          <TabsTrigger value="about" className="flex-1">حول النظام</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <SystemSettingsForm />
        </TabsContent>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>حول النظام</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">نظام إدارة فواتير الكهرباء</h3>
                <p className="text-muted-foreground">
                  نظام متكامل لإدارة فواتير شركة الكهرباء يتيح إمكانية إدخال قراءات العدادات وإصدار الفواتير وإدارة المدفوعات.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">المميزات</h3>
                <ul className="list-disc list-inside space-y-1 mr-4 text-muted-foreground">
                  <li>إدارة المشتركين وبياناتهم</li>
                  <li>إدخال قراءات العدادات وحساب الاستهلاك</li>
                  <li>إصدار الفواتير بشكل تلقائي</li>
                  <li>تسجيل المدفوعات وتتبع حالة الفواتير</li>
                  <li>إدارة الفترات الفوترية ونقل الأرصدة السابقة</li>
                  <li>طباعة الفواتير والتقارير</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">معلومات الإصدار</h3>
                <p className="text-muted-foreground">
                  الإصدار: 1.0.0<br />
                  تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
