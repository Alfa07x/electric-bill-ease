
import React from "react";
import { useNavigate } from "react-router-dom";
import CustomerForm from "@/components/CustomerForm";
import { Customer } from "@/types/models";

const CustomerNew: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (customer: Customer) => {
    navigate("/customers");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إضافة مشترك جديد</h1>
        <p className="text-muted-foreground">قم بإدخال بيانات المشترك الجديد</p>
      </div>

      <CustomerForm onSuccess={handleSuccess} />
    </div>
  );
};

export default CustomerNew;
