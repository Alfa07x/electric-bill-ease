
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SystemSettings } from "@/types/models";
import { settingsService, notificationService } from "@/services/storage.service";

const SystemSettingsForm: React.FC = () => {
  const { toast } = useToast();
  const [kilowattPrice, setKilowattPrice] = useState<number>(0);
  const [subscriptionFee, setSubscriptionFee] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // تحميل إعدادات النظام الحالية
    const settings = settingsService.get();
    setKilowattPrice(settings.kilowattPrice);
    setSubscriptionFee(settings.subscriptionFee);
    setTaxRate(settings.taxRate);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (kilowattPrice <= 0) {
      toast({
        title: "خطأ",
        description: "يجب أن يكون سعر الكيلوواط أكبر من صفر",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // تحديث إعدادات النظام
      const updatedSettings = settingsService.update({
        kilowattPrice,
        subscriptionFee,
        taxRate
      });
      
      // إنشاء إشعار بتحديث الإعدادات
      notificationService.create({
        title: "تم تحديث إعدادات النظام",
        message: "تم تحديث إعدادات النظام بنجاح",
        type: "update"
      });
      
      toast({
        title: "تم بنجاح",
        description: "تم تحديث إعدادات النظام بنجاح",
      });
    } catch (error) {
      console.error("Error updating system settings:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث إعدادات النظام",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات النظام</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kilowattPrice">سعر الكيلوواط (ريال)</Label>
            <Input
              id="kilowattPrice"
              type="number"
              step="0.01"
              value={kilowattPrice}
              onChange={(e) => setKilowattPrice(Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscriptionFee">رسوم الاشتراك الثابتة (ريال)</Label>
            <Input
              id="subscriptionFee"
              type="number"
              step="0.01"
              value={subscriptionFee}
              onChange={(e) => setSubscriptionFee(Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxRate">نسبة الضريبة (0-1)</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              required
            />
            <p className="text-sm text-muted-foreground">
              مثال: 0.15 تعني 15%
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SystemSettingsForm;
