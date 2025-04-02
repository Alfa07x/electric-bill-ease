
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, FileText, Edit, Trash } from "lucide-react";
import { Customer } from "@/types/models";
import { customerService, notificationService } from "@/services/storage.service";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Customers: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(
        customer =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.accountNumber.includes(searchTerm) ||
          customer.meterNumber.includes(searchTerm) ||
          customer.phone.includes(searchTerm) ||
          customer.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const loadCustomers = () => {
    const loadedCustomers = customerService.getAll();
    setCustomers(loadedCustomers);
    setFilteredCustomers(loadedCustomers);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      try {
        customerService.delete(customerToDelete.id);
        
        notificationService.create({
          title: "تم حذف مشترك",
          message: `تم حذف المشترك: ${customerToDelete.name}`,
          type: "delete"
        });
        
        toast({
          title: "تم بنجاح",
          description: "تم حذف المشترك بنجاح",
        });
        
        loadCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف المشترك",
          variant: "destructive"
        });
      }
    }
    
    setIsDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  const getContractTypeName = (type: string | undefined): string => {
    switch (type) {
      case "residential": return "سكني";
      case "commercial": return "تجاري";
      case "industrial": return "صناعي";
      case "government": return "حكومي";
      case "other": return "أخرى";
      default: return "سكني";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">المشتركين</h1>
        <Button asChild>
          <Link to="/customers/new">
            <Plus className="ml-2 h-4 w-4" />
            إضافة مشترك جديد
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المشتركين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن مشترك..."
                className="pl-8 pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredCustomers.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>رقم الحساب</TableHead>
                    <TableHead>رقم العداد</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>نوع العقد</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.accountNumber}</TableCell>
                      <TableCell>{customer.meterNumber}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{getContractTypeName(customer.contractType)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}`)}>
                                <FileText className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}/edit`)}>
                                <Edit className="ml-2 h-4 w-4" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/billing/new?customerId=${customer.id}`)}>
                                <FileText className="ml-2 h-4 w-4" />
                                إضافة فاتورة
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClick(customer)} className="text-red-500">
                                <Trash className="ml-2 h-4 w-4" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              {searchTerm ? "لا توجد نتائج مطابقة" : "لا يوجد مشتركين حتى الآن"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* حوار تأكيد الحذف */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف المشترك "{customerToDelete?.name}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
