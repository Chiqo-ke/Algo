import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, Lock, Sliders, CreditCard, Loader2, CheckCircle2, AlertCircle, LogOut, BarChart3, GraduationCap, Server, Trash2, Pencil, Plus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, apiPut, apiPost, apiDelete, API_ENDPOINTS } from "@/lib/api";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar?: string;
  created_at?: string;
}

interface AccountSettings {
  default_currency: "USD" | "EUR" | "GBP" | "JPY";
  default_simulation_mode: "money" | "pips";
  notification_email: boolean;
  notification_push: boolean;
}

interface PremiumStatus {
  tier: "free" | "basic" | "pro" | "premium";
  status: "active" | "inactive" | "expired";
  expiry_date?: string;
  features: string[];
  usage: {
    strategies: { used: number; limit: number };
    backtests: { used: number; limit: number };
    api_calls: { used: number; limit: number };
  };
}

interface BrokerCredential {
  id: number;
  label: string;
  mt5_login: number;
  mt5_server: string;
  mt5_terminal_path: string;
  is_default: boolean;
  created_at: string;
}

const EMPTY_BROKER_FORM = {
  label: "",
  mt5_login: "",
  mt5_password: "",
  mt5_server: "",
  mt5_terminal_path: "",
  is_default: false,
};

export default function Settings() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});

  // Account settings state
  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    default_currency: "USD",
    default_simulation_mode: "money",
    notification_email: true,
    notification_push: false,
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Premium state
  const [premium, setPremium] = useState<PremiumStatus | null>(null);

  // Broker credentials state
  const [brokerCredentials, setBrokerCredentials] = useState<BrokerCredential[]>([]);
  const [loadingBroker, setLoadingBroker] = useState(false);
  const [brokerDialogOpen, setBrokerDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<BrokerCredential | null>(null);
  const [brokerForm, setBrokerForm] = useState({ ...EMPTY_BROKER_FORM });
  const [savingBroker, setSavingBroker] = useState(false);
  const [deletingBroker, setDeletingBroker] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await apiGet<UserProfile>(API_ENDPOINTS.auth.profile);
      
      if (error) {
        logger.api.error("Failed to fetch user profile", undefined, { error });
        toast({
          title: "Error",
          description: "Failed to load your profile",
          variant: "destructive",
        });
      } else if (data) {
        setProfile(data);
        setProfileData(data);
      }
      
      setLoading(false);
    };

    fetchProfile();
  }, [toast]);

  // Fetch premium status (mock for now)
  useEffect(() => {
    setPremium({
      tier: "pro",
      status: "active",
      expiry_date: "2025-12-31",
      features: [
        "Unlimited strategies",
        "Advanced backtesting",
        "Real-time alerts",
        "Priority support",
      ],
      usage: {
        strategies: { used: 15, limit: 50 },
        backtests: { used: 128, limit: 500 },
        api_calls: { used: 4521, limit: 10000 },
      },
    });
  }, []);

  // Fetch broker credentials when the broker tab is active
  useEffect(() => {
    if (defaultTab === "broker") {
      fetchBrokerCredentials();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileUpdate = async () => {
    if (!profile) return;

    setSaveLoading(true);
    const { error } = await apiPut(
      API_ENDPOINTS.auth.profileDetail(profile.id),
      profileData
    );

    if (error) {
      logger.api.error("Failed to update profile", undefined, { error });
      toast({
        title: "Error",
        description: "Failed to update your profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
      setProfileEditing(false);
    }

    setSaveLoading(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    const { error } = await apiPost(API_ENDPOINTS.auth.changePassword, {
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
    });

    if (error) {
      logger.auth.error("Failed to change password", undefined, { error });
      toast({
        title: "Error",
        description: error || "Failed to change password",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Your password has been changed",
      });
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    }

    setPasswordLoading(false);
  };

  // ─── Broker credentials handlers ─────────────────────────────────────────

  const fetchBrokerCredentials = async () => {
    setLoadingBroker(true);
    const { data, error } = await apiGet<any>(API_ENDPOINTS.trading.credentials);
    if (!error && data) {
      const list: BrokerCredential[] = Array.isArray(data) ? data : data.results ?? [];
      setBrokerCredentials(list);
    }
    setLoadingBroker(false);
  };

  const openAddBrokerDialog = () => {
    setEditingCredential(null);
    setBrokerForm({ ...EMPTY_BROKER_FORM });
    setShowPassword(false);
    setBrokerDialogOpen(true);
  };

  const openEditBrokerDialog = (cred: BrokerCredential) => {
    setEditingCredential(cred);
    setBrokerForm({
      label: cred.label,
      mt5_login: String(cred.mt5_login),
      mt5_password: "",  // never pre-filled for security
      mt5_server: cred.mt5_server,
      mt5_terminal_path: cred.mt5_terminal_path ?? "",
      is_default: cred.is_default,
    });
    setShowPassword(false);
    setBrokerDialogOpen(true);
  };

  const handleSaveBrokerCredential = async () => {
    if (!brokerForm.label.trim() || !brokerForm.mt5_login || !brokerForm.mt5_server.trim()) {
      toast({ title: "Missing fields", description: "Label, Login, and Server are required", variant: "destructive" });
      return;
    }
    if (!editingCredential && !brokerForm.mt5_password) {
      toast({ title: "Missing password", description: "MT5 password is required", variant: "destructive" });
      return;
    }

    setSavingBroker(true);
    const payload: Record<string, unknown> = {
      label: brokerForm.label.trim(),
      mt5_login: parseInt(brokerForm.mt5_login),
      mt5_server: brokerForm.mt5_server.trim(),
      mt5_terminal_path: brokerForm.mt5_terminal_path.trim(),
      is_default: brokerForm.is_default,
    };
    if (brokerForm.mt5_password) payload.mt5_password = brokerForm.mt5_password;

    let error: string | undefined;
    if (editingCredential) {
      ({ error } = await apiPut(API_ENDPOINTS.trading.credentialDetail(editingCredential.id), payload));
    } else {
      ({ error } = await apiPost(API_ENDPOINTS.trading.credentials, payload));
    }

    if (error) {
      toast({ title: "Failed to save", description: error, variant: "destructive" });
    } else {
      toast({ title: editingCredential ? "Credential updated" : "Credential added", description: brokerForm.label });
      setBrokerDialogOpen(false);
      await fetchBrokerCredentials();
    }
    setSavingBroker(false);
  };

  const handleDeleteBrokerCredential = async (id: number) => {
    setDeletingBroker(id);
    const { error } = await apiDelete(API_ENDPOINTS.trading.credentialDetail(id));
    if (error) {
      toast({ title: "Failed to delete", description: error, variant: "destructive" });
    } else {
      toast({ title: "Credential deleted" });
      setBrokerCredentials(prev => prev.filter(c => c.id !== id));
    }
    setDeletingBroker(null);
  };

  const handleAccountSettingsUpdate = async () => {
    setSaveLoading(true);
    // Save account settings to backend
    const { error } = await apiPut(API_ENDPOINTS.auth.profile, accountSettings);

    if (error) {
      logger.api.error("Failed to update account settings", undefined, { error });
      toast({
        title: "Error",
        description: "Failed to update account settings",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account settings updated successfully",
      });
    }

    setSaveLoading(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-full w-full overflow-auto bg-background">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Manage your account, preferences, and subscription</p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 md:grid-cols-6">
              <TabsTrigger value="profile" className="gap-1.5">
                <User className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="gap-1.5">
                <Sliders className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5">
                <Lock className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="broker" className="gap-1.5">
                <Server className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Broker</span>
              </TabsTrigger>
              <TabsTrigger value="premium" className="hidden md:flex gap-1.5">
                <CreditCard className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Premium</span>
              </TabsTrigger>
              <TabsTrigger value="links" className="gap-1.5">
                <BarChart3 className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">More</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card className="border border-border bg-card">
                <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base sm:text-lg">Profile Information</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">View and edit your personal information</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                  {profile && (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                        {/* Username */}
                        <div className="space-y-1.5">
                          <Label htmlFor="username" className="text-xs sm:text-sm">Username</Label>
                          <Input
                            id="username"
                            value={profileData.username || ""}
                            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                            disabled={!profileEditing}
                            className="bg-background"
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-xs sm:text-sm">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email || ""}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            disabled={!profileEditing}
                            className="bg-background"
                          />
                        </div>

                        {/* First Name */}
                        <div className="space-y-1.5">
                          <Label htmlFor="firstName" className="text-xs sm:text-sm">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileData.first_name || ""}
                            onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                            disabled={!profileEditing}
                            className="bg-background"
                          />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-1.5">
                          <Label htmlFor="lastName" className="text-xs sm:text-sm">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileData.last_name || ""}
                            onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                            disabled={!profileEditing}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="space-y-1.5">
                        <Label htmlFor="bio" className="text-xs sm:text-sm">Bio</Label>
                        <textarea
                          id="bio"
                          value={profileData.bio || ""}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          disabled={!profileEditing}
                          className="min-h-16 sm:min-h-20 w-full rounded-lg border border-border bg-background p-2 sm:p-3 text-sm text-foreground placeholder-muted-foreground disabled:opacity-50"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      {/* Member Since */}
                      {profile.created_at && (
                        <div className="space-y-1">
                          <Label className="text-xs sm:text-sm">Member Since</Label>
                          <p className="text-sm text-foreground">
                            {new Date(profile.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        {!profileEditing ? (
                          <Button
                            onClick={() => setProfileEditing(true)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Edit Profile
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={handleProfileUpdate}
                              disabled={saveLoading}
                              className="bg-primary hover:bg-primary/90"
                            >
                              {saveLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => {
                                setProfileEditing(false);
                                setProfileData(profile);
                              }}
                              variant="outline"
                              disabled={saveLoading}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-4">
              <Card className="border border-border bg-card">
                <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base sm:text-lg">Account Settings</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Configure your trading preferences</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                  {/* Default Currency */}
                  <div className="space-y-1.5">
                    <Label htmlFor="currency" className="text-xs sm:text-sm">Default Simulation Currency</Label>
                    <Select
                      value={accountSettings.default_currency}
                      onValueChange={(value) =>
                        setAccountSettings({
                          ...accountSettings,
                          default_currency: value as "USD" | "EUR" | "GBP" | "JPY",
                        })
                      }
                    >
                      <SelectTrigger id="currency" className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - United States Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      The default currency to use for all simulations
                    </p>
                  </div>

                  {/* Default Simulation Mode */}
                  <div className="space-y-1.5">
                    <Label htmlFor="simMode" className="text-xs sm:text-sm">Default Simulation Mode</Label>
                    <Select
                      value={accountSettings.default_simulation_mode}
                      onValueChange={(value) =>
                        setAccountSettings({
                          ...accountSettings,
                          default_simulation_mode: value as "money" | "pips",
                        })
                      }
                    >
                      <SelectTrigger id="simMode" className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="money">Money Simulation</SelectItem>
                        <SelectItem value="pips">Pips Simulation</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How you want to measure results in backtesting
                    </p>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground">Notifications</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Email Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        title="Toggle email notifications"
                        checked={accountSettings.notification_email}
                        onChange={(e) =>
                          setAccountSettings({
                            ...accountSettings,
                            notification_email: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded border-border bg-background accent-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Push Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive browser notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        title="Toggle push notifications"
                        checked={accountSettings.notification_push}
                        onChange={(e) =>
                          setAccountSettings({
                            ...accountSettings,
                            notification_push: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded border-border bg-background accent-primary"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleAccountSettingsUpdate}
                      disabled={saveLoading}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {saveLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card className="border border-border bg-card">
                <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base sm:text-lg">Change Password</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Update your password to keep your account secure</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword" className="text-xs sm:text-sm">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, current_password: e.target.value })
                      }
                      placeholder="Enter your current password"
                      className="bg-background"
                    />
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-xs sm:text-sm">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, new_password: e.target.value })
                      }
                      placeholder="Enter your new password"
                      className="bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirm_password: e.target.value })
                      }
                      placeholder="Confirm your new password"
                      className="bg-background"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handlePasswordChange}
                      disabled={passwordLoading || !passwordData.current_password || !passwordData.new_password}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {passwordLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Premium Tab */}
            <TabsContent value="premium" className="space-y-6">
              {premium && (
                <>
                  {/* Current Plan */}
                  <Card className="border border-border bg-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>Your subscription status and features</CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary capitalize">
                            {premium.tier}
                          </span>
                          {premium.status === "active" ? (
                            <span className="inline-flex items-center gap-1 text-sm text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sm text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              {premium.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Expiry Date */}
                      {premium.expiry_date && (
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Expires On</Label>
                          <p className="text-lg font-medium text-foreground">
                            {new Date(premium.expiry_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}

                      {/* Features */}
                      <div className="space-y-3">
                        <Label className="text-muted-foreground">Included Features</Label>
                        <ul className="space-y-2">
                          {premium.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-foreground">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Manage Plan Button */}
                      <Button className="w-full bg-primary hover:bg-primary/90 md:w-auto">
                        Manage Subscription
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Usage Statistics */}
                  <Card className="border border-border bg-card">
                    <CardHeader>
                      <CardTitle>Usage Statistics</CardTitle>
                      <CardDescription>Your current usage vs plan limits</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Strategies */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">Strategies</p>
                          <p className="text-sm text-muted-foreground">
                            {premium.usage.strategies.used} / {premium.usage.strategies.limit}
                          </p>
                        </div>
                        <Progress
                          className="h-2"
                          value={(premium.usage.strategies.used / premium.usage.strategies.limit) * 100}
                        />
                      </div>

                      {/* Backtests */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">Backtests</p>
                          <p className="text-sm text-muted-foreground">
                            {premium.usage.backtests.used} / {premium.usage.backtests.limit}
                          </p>
                        </div>
                        <Progress
                          className="h-2"
                          value={(premium.usage.backtests.used / premium.usage.backtests.limit) * 100}
                        />
                      </div>

                      {/* API Calls */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">API Calls</p>
                          <p className="text-sm text-muted-foreground">
                            {premium.usage.api_calls.used} / {premium.usage.api_calls.limit}
                          </p>
                        </div>
                        <Progress
                          className="h-2"
                          value={(premium.usage.api_calls.used / premium.usage.api_calls.limit) * 100}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Broker Tab */}
            <TabsContent value="broker" className="space-y-4">
              <Card className="border border-border bg-card">
                <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <div>
                      <CardTitle className="text-base sm:text-lg">Broker Accounts</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Saved MT5 credentials for live trading sessions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingBroker ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : brokerCredentials.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                      <Server className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm mb-4">No broker accounts saved yet</p>
                      <Button onClick={openAddBrokerDialog} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1.5" /> Add your first account
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {brokerCredentials.map((cred) => (
                        <div
                          key={cred.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-medium text-sm">{cred.label}</p>
                              {cred.is_default && (
                                <Badge
                                  className="text-[10px] h-4 bg-primary/10 text-primary border-primary/30"
                                  variant="outline"
                                >
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {cred.mt5_server} · Login: {cred.mt5_login}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditBrokerDialog(cred)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteBrokerCredential(cred.id)}
                              disabled={deletingBroker === cred.id}
                            >
                              {deletingBroker === cred.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="pt-1">
                        <Button onClick={openAddBrokerDialog} variant="outline" size="sm" className="w-full">
                          <Plus className="h-4 w-4 mr-1.5" /> Add Account
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* More Tab - Combined Premium and Quick Links */}
            <TabsContent value="links" className="space-y-4">
              {/* Premium section for mobile */}
              <div className="md:hidden space-y-4">
                {loading ? (
                  <Card className="border border-border bg-card">
                    <CardContent className="py-8 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </CardContent>
                  </Card>
                ) : premium ? (
                  <>
                    <Card className="border border-border bg-card">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle>Premium Status</CardTitle>
                            <CardDescription>Your subscription details</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <p className="text-sm text-muted-foreground">Current Plan</p>
                            <p className="text-lg font-bold text-foreground capitalize">{premium.tier}</p>
                          </div>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold",
                            premium.status === "active" && "bg-green-500/20 text-green-600",
                            premium.status === "inactive" && "bg-gray-500/20 text-gray-600",
                            premium.status === "expired" && "bg-red-500/20 text-red-600"
                          )}>
                            {premium.status.toUpperCase()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : null}
              </div>
              
              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Navigation</CardTitle>
                  <CardDescription>Access other sections of the app</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => navigate("/analytics")}
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => navigate("/learning")}
                  >
                    <GraduationCap className="w-5 h-5 mr-3" />
                    Learning Hub
                  </Button>
                  <Separator className="my-4" />
                  <Button
                    variant="destructive"
                    className="w-full justify-start h-12"
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Broker Add / Edit Dialog ─────────────────────────────────── */}
      <Dialog open={brokerDialogOpen} onOpenChange={setBrokerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCredential ? "Edit Broker Account" : "Add Broker Account"}
            </DialogTitle>
            <DialogDescription>
              MT5 credentials used to start live trading sessions.
              {editingCredential && " Leave password blank to keep the existing one."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Label */}
            <div className="space-y-1.5">
              <Label htmlFor="broker-label">Label *</Label>
              <Input
                id="broker-label"
                placeholder="e.g. My ICMarkets Account"
                value={brokerForm.label}
                onChange={(e) => setBrokerForm((f) => ({ ...f, label: e.target.value }))}
              />
            </div>

            {/* MT5 Login */}
            <div className="space-y-1.5">
              <Label htmlFor="broker-login">MT5 Login *</Label>
              <Input
                id="broker-login"
                type="number"
                placeholder="e.g. 123456789"
                value={brokerForm.mt5_login}
                onChange={(e) => setBrokerForm((f) => ({ ...f, mt5_login: e.target.value }))}
              />
            </div>

            {/* MT5 Password */}
            <div className="space-y-1.5">
              <Label htmlFor="broker-password">
                MT5 Password {editingCredential ? "(leave blank to keep)" : "*"}
              </Label>
              <div className="relative">
                <Input
                  id="broker-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={editingCredential ? "••••••••" : "Enter MT5 password"}
                  value={brokerForm.mt5_password}
                  onChange={(e) => setBrokerForm((f) => ({ ...f, mt5_password: e.target.value }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* MT5 Server */}
            <div className="space-y-1.5">
              <Label htmlFor="broker-server">MT5 Server *</Label>
              <Input
                id="broker-server"
                placeholder="e.g. ICMarketsSC-Demo"
                value={brokerForm.mt5_server}
                onChange={(e) => setBrokerForm((f) => ({ ...f, mt5_server: e.target.value }))}
                autoComplete="off"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Your broker\u2019s server name (e.g. ICMarkets-Demo or FBS-Demo) \u2014 provided by your broker, not your MT5 account username.
              </p>
            </div>

            {/* Terminal Path */}
            <div className="space-y-1.5">
              <Label htmlFor="broker-terminal">Terminal Path <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                id="broker-terminal"
                placeholder="C:\Program Files\MetaTrader 5\terminal64.exe"
                value={brokerForm.mt5_terminal_path}
                onChange={(e) =>
                  setBrokerForm((f) => ({ ...f, mt5_terminal_path: e.target.value }))
                }
              />
            </div>

            {/* Default toggle */}
            <div className="flex items-center gap-3 pt-1">
              <input
                id="broker-default"
                type="checkbox"
                title="Set as default broker account"
                checked={brokerForm.is_default}
                onChange={(e) => setBrokerForm((f) => ({ ...f, is_default: e.target.checked }))}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <Label htmlFor="broker-default" className="cursor-pointer">
                Set as default broker account
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBrokerDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveBrokerCredential}
              disabled={savingBroker}
              className="bg-primary hover:bg-primary/90"
            >
              {savingBroker ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {editingCredential ? "Update" : "Save"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
