
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Clock,
  Check,
  Trash
} from "lucide-react";
import { Notification } from "@/types/models";
import { notificationService } from "@/services/storage.service";
import { useToast } from "@/hooks/use-toast";

const Notifications: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const loadedNotifications = notificationService.getAll()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setNotifications(loadedNotifications);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
    
    toast({
      title: "تم",
      description: "تم تحديد جميع الإشعارات كمقروءة",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "create":
        return <div className="bg-blue-100 text-blue-700 p-2 rounded-full"><Bell className="h-5 w-5" /></div>;
      case "update":
        return <div className="bg-green-100 text-green-700 p-2 rounded-full"><Check className="h-5 w-5" /></div>;
      case "delete":
        return <div className="bg-red-100 text-red-700 p-2 rounded-full"><Trash className="h-5 w-5" /></div>;
      case "payment":
        return <div className="bg-purple-100 text-purple-700 p-2 rounded-full"><Bell className="h-5 w-5" /></div>;
      case "period":
        return <div className="bg-yellow-100 text-yellow-700 p-2 rounded-full"><Clock className="h-5 w-5" /></div>;
      default:
        return <div className="bg-gray-100 text-gray-700 p-2 rounded-full"><Bell className="h-5 w-5" /></div>;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `منذ ${hours} ساعة`;
    } else {
      return notificationDate.toLocaleDateString('ar-SA');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">الإشعارات</h1>
          <p className="text-muted-foreground">
            {notifications.filter(n => !n.isRead).length} إشعارات غير مقروءة
          </p>
        </div>
        <Button variant="outline" onClick={markAllAsRead}>
          <Check className="ml-2 h-4 w-4" />
          تحديد الكل كمقروء
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جميع الإشعارات</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start gap-4 p-4 rounded-lg border ${!notification.isRead ? 'bg-gray-50' : ''}`}
                >
                  <div>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className={`font-medium ${!notification.isRead ? 'font-bold' : ''}`}>
                        {notification.title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              لا توجد إشعارات
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
