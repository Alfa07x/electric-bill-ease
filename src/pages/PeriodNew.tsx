
import React from "react";
import { useNavigate } from "react-router-dom";
import BillingPeriodForm from "@/components/BillingPeriodForm";
import { BillingPeriod } from "@/types/models";

const PeriodNew: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (period: BillingPeriod) => {
    navigate("/periods");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إنشاء فترة فوترية جديدة</h1>
        <p className="text-muted-foreground">
          قم بإنشاء فترة فوترية جديدة. سيتم ترحيل المبالغ غير المسددة من الفترة السابقة.
        </p>
      </div>

      <BillingPeriodForm onSuccess={handleSuccess} />
    </div>
  );
};

export default PeriodNew;
