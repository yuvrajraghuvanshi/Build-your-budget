import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  Shield, 
  CreditCard, 
  Smartphone, 
  Mail, 
  Edit, 
  Camera, 
  Loader2,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const { user } = useAuth();
  console.log({user})
  const { toast } = useToast();
  const { 
    profile, 
    loading, 
    updateProfileDetails, 
    changePassword 
  } = useProfile();
  console.log({profile})

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    monthlyIncome: "",
    occupation: "",
    financialGoal: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [preferences, setPreferences] = useState({
    currency: "USD",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    darkMode: false,
    emailReports: true,
    transactionAlerts: true
  });

  // Initialize profile data when profile is loaded
  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: user.user_metadata.first_name || "",
        lastName: user.user_metadata.last_name || "",
        email: user?.email || "",
        monthlyIncome: profile.monthly_income?.toString() || "",
        occupation: profile.occupation || "",
        financialGoal: profile.financial_goal || ""
      });

      setPreferences(prev => ({
        ...prev,
        currency: profile.preferred_currency || "USD"
      }));
    }
  }, [profile, user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await updateProfileDetails(
        profileData.firstName,
        profileData.lastName,
        profileData.monthlyIncome ? parseFloat(profileData.monthlyIncome) : undefined,
        profileData.occupation || undefined,
        profileData.financialGoal || undefined
      );
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    
    try {
      const { error } = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
        variant: "default",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Preferences</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleProfileUpdate}>
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-success rounded-full flex items-center justify-center">
                        <User className="w-12 h-12 text-success-foreground" />
                      </div>
                      {isEditing && (
                        <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0">
                          <Camera className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {profileData.firstName} {profileData.lastName}
                      </h3>
                      <p className="text-muted-foreground">{profileData.email}</p>
                      <Badge variant="secondary" className="mt-2">Premium Member</Badge>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome">Monthly Income (optional)</Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={profileData.monthlyIncome}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData(prev => ({ ...prev, monthlyIncome: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation (optional)</Label>
                      <Input
                        id="occupation"
                        value={profileData.occupation}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData(prev => ({ ...prev, occupation: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="financialGoal">Financial Goal (optional)</Label>
                      <Input
                        id="financialGoal"
                        value={profileData.financialGoal}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData(prev => ({ ...prev, financialGoal: e.target.value }))}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        type="submit"
                        className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                      >
                        Save Changes
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="pt-4">
                  <h4 className="font-medium mb-4">Change Password</h4>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ 
                            ...prev, 
                            currentPassword: e.target.value 
                          }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ 
                            ...prev, 
                            newPassword: e.target.value 
                          }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ 
                            ...prev, 
                            confirmPassword: e.target.value 
                          }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Changing Password...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </form>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Active Sessions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">This Device</p>
                          <p className="text-sm text-muted-foreground">Current session • {preferences.timezone}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input value={preferences.currency} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input value={preferences.timezone} disabled />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Dark Mode</h4>
                      <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                    </div>
                    <Switch 
                      checked={preferences.darkMode}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, darkMode: checked }))}
                    />
                  </div>
                  {/* <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Reports</h4>
                      <p className="text-sm text-muted-foreground">Receive monthly financial reports</p>
                    </div>
                    <Switch 
                      checked={preferences.emailReports}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailReports: checked }))}
                    />
                  </div> */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Transaction Alerts</h4>
                      <p className="text-sm text-muted-foreground">Get notified of new transactions</p>
                    </div>
                    <Switch 
                      checked={preferences.transactionAlerts}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, transactionAlerts: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;