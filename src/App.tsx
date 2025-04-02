
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout";
import Index from "./pages/Index";
import Customers from "./pages/Customers";
import CustomerNew from "./pages/CustomerNew";
import CustomerEdit from "./pages/CustomerEdit";
import CustomerDetails from "./pages/CustomerDetails";
import Billing from "./pages/Billing";
import BillingNew from "./pages/BillingNew";
import Payments from "./pages/Payments";
import PaymentNew from "./pages/PaymentNew";
import Periods from "./pages/Periods";
import PeriodNew from "./pages/PeriodNew";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            
            {/* مسارات المشتركين */}
            <Route path="customers" element={<Customers />} />
            <Route path="customers/new" element={<CustomerNew />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="customers/:id/edit" element={<CustomerEdit />} />
            
            {/* مسارات الفواتير */}
            <Route path="billing" element={<Billing />} />
            <Route path="billing/new" element={<BillingNew />} />
            
            {/* مسارات المدفوعات */}
            <Route path="payments" element={<Payments />} />
            <Route path="payments/new" element={<PaymentNew />} />
            
            {/* مسارات الفترات */}
            <Route path="periods" element={<Periods />} />
            <Route path="periods/new" element={<PeriodNew />} />
            
            {/* مسارات أخرى */}
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="help" element={<Help />} />
            
            {/* مسار غير موجود */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
