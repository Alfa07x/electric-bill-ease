
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PaymentForm from "@/components/PaymentForm";
import { Payment } from "@/types/models";

const PaymentNew: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billId, setBillId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const billIdParam = searchParams.get("billId");
    const customerIdParam = searchParams.get("customerId");
    
    if (billIdParam) {
      setBillId(billIdParam);
    }
    
    if (customerIdParam) {
      setCustomerId(customerIdParam);
    }
  }, [searchParams]);

  const handleSuccess = (payment: Payment) => {
    navigate(`/customers/${payment.customerId}?bill=${payment.billId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">تسجيل دفعة جديدة</h1>
        <p className="text-muted-foreground">قم بتسجيل دفعة جديدة لأحد الفواتير</p>
      </div>

      <PaymentForm 
        billId={billId || undefined} 
        customerId={customerId || undefined} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
};

export default PaymentNew;
