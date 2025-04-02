
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MeterReadingForm from "@/components/MeterReadingForm";
import { Bill } from "@/types/models";

const BillingNew: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const customerIdParam = searchParams.get("customerId");
    if (customerIdParam) {
      setCustomerId(customerIdParam);
    }
  }, [searchParams]);

  const handleSuccess = (bill: Bill) => {
    navigate(`/customers/${bill.customerId}?bill=${bill.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إنشاء فاتورة جديدة</h1>
        <p className="text-muted-foreground">قم بإدخال قراءة العداد لإنشاء فاتورة جديدة</p>
      </div>

      <MeterReadingForm onSuccess={handleSuccess} />
    </div>
  );
};

export default BillingNew;
