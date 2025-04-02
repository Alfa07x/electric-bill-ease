
import React, { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, FileText, CreditCard, Settings, Bell, ChevronDown, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { notificationService } from "@/services/storage.service";
import { cn } from "@/lib/utils";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = React.useState(0);

  useEffect(() => {
    // حساب عدد الإشعارات غير المقروءة
    setUnreadCount(notificationService.getUnread().length);
  }, [location.pathname]);

  const navItems = [
    { path: "/", label: "الرئيسية", icon: <Home className="ml-2" size={20} /> },
    { path: "/customers", label: "المشتركين", icon: <Users className="ml-2" size={20} /> },
    { path: "/billing", label: "الفواتير", icon: <FileText className="ml-2" size={20} /> },
    { path: "/payments", label: "المدفوعات", icon: <CreditCard className="ml-2" size={20} /> },
    { path: "/periods", label: "الفترات", icon: <Calendar className="ml-2" size={20} /> },
    { path: "/settings", label: "الإعدادات", icon: <Settings className="ml-2" size={20} /> },
  ];

  const showNotifications = () => {
    navigate("/notifications");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-electric-primary text-white py-3 px-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Zap size={28} className="ml-2" />
            <Link to="/" className="text-xl font-bold">
              نظام إدارة فواتير الكهرباء
            </Link>
          </div>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={showNotifications}
              className="relative mr-2 hover:bg-electric-secondary"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center hover:bg-electric-secondary">
                  <span className="ml-1">الخيارات</span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/help")}>
                  المساعدة
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white py-2 shadow-sm border-b">
        <div className="container mx-auto">
          <ul className="flex flex-wrap space-x-1 space-x-reverse">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md transition-colors",
                    location.pathname === item.path
                      ? "bg-electric-light text-electric-dark font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="container mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 border-t">
        <div className="container mx-auto text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} نظام إدارة فواتير الكهرباء - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
