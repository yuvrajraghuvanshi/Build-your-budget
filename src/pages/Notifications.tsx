import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, AlertTriangle, TrendingUp, Target, CreditCard, Settings } from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "warning",
    title: "Budget Alert: Entertainment",
    message: "You've exceeded your entertainment budget by $30.50 this month.",
    time: "2 hours ago",
    unread: true,
    icon: AlertTriangle,
    color: "text-warning"
  },
  {
    id: 2,
    type: "success",
    title: "Goal Achievement",
    message: "Congratulations! You've reached 75% of your vacation savings goal.",
    time: "1 day ago",
    unread: true,
    icon: Target,
    color: "text-success"
  },
  {
    id: 3,
    type: "info",
    title: "Monthly Report Ready",
    message: "Your December financial report is now available for review.",
    time: "2 days ago",
    unread: false,
    icon: TrendingUp,
    color: "text-info"
  },
  {
    id: 4,
    type: "alert",
    title: "Bill Reminder",
    message: "Your credit card payment of $324.50 is due in 3 days.",
    time: "3 days ago",
    unread: false,
    icon: CreditCard,
    color: "text-destructive"
  }
];

const notificationSettings = [
  { id: 'budget_alerts', label: 'Budget limit alerts', description: 'Get notified when approaching budget limits', enabled: true },
  { id: 'goal_updates', label: 'Goal milestone updates', description: 'Notifications for savings goal progress', enabled: true },
  { id: 'bill_reminders', label: 'Bill payment reminders', description: 'Reminders for upcoming bill payments', enabled: true },
  { id: 'spending_insights', label: 'Weekly spending insights', description: 'Weekly summary of your spending patterns', enabled: false },
  { id: 'investment_updates', label: 'Investment portfolio updates', description: 'Updates on your investment performance', enabled: false },
  { id: 'monthly_reports', label: 'Monthly financial reports', description: 'Comprehensive monthly financial summaries', enabled: true },
];

const Notifications = () => {
  const [settings, setSettings] = useState(notificationSettings);
  
  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  const markAllAsRead = () => {
    // Function to mark all notifications as read
    console.log("Marking all as read");
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your financial activity</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{unreadCount} unread</Badge>
            <Button variant="outline" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>All Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <Card key={notification.id} className={`transition-all hover:shadow-md ${notification.unread ? 'border-primary/50 bg-card' : 'opacity-75'}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full bg-muted/20 ${notification.unread ? 'ring-2 ring-primary/20' : ''}`}>
                        <Icon className={`w-5 h-5 ${notification.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${notification.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className={`text-sm mt-1 ${notification.unread ? 'text-muted-foreground' : 'text-muted-foreground/75'}`}>
                          {notification.message}
                        </p>
                        {notification.unread && (
                          <div className="flex justify-end mt-3">
                            <Button variant="ghost" size="sm" className="text-xs">
                              Mark as read
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose which notifications you'd like to receive
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{setting.label}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {setting.description}
                      </p>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => toggleSetting(setting.id)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive push notifications in the app</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive important alerts via SMS</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Notifications;