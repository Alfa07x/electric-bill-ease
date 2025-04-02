
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomerForm from "@/components/CustomerForm";
import { Customer } from "@/types/models";
import { customerService } from "@/services/storage.service";
import { useToast } from "@/hooks/use-toast";

const CustomerEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (id) {
      const foundCustomer = customerService.getById(id);
      
      if (foundCustomer) {
        setCustomer(foundCustomer);
      } else {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على المشترك",
          variant: "destructive"
        });
        navigate("/customers");
      }
    }
    
    setLoading(false);
  }, [id, navigate, toast]);

  const handleSuccess = (updatedCustomer: Customer) => {
    navigate(`/customers/${updatedCustomer.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <p className="text-red-500">لم يتم العثور على المشترك</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">تعديل بيانات المشترك</h1>
        <p className="text-muted-foreground">قم بتعديل بيانات المشترك</p>
      </div>

      <CustomerForm customerId={id} onSuccess={handleSuccess} />
    </div>
  );
};

export default CustomerEdit;
