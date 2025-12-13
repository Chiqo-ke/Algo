import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Sliders, CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPut, API_ENDPOINTS } from "@/lib/api";
import { logger } from "@/lib/logger";

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

export default function Settings() {
  const { toast } = useToast();
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
    const { error } = await apiPut(`${API_ENDPOINTS.auth.user}change_password/`, {
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
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="mt-2 text-muted-foreground">Manage your account, preferences, and subscription</p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="premium">Premium</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="border border-border bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>View and edit your personal information</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile && (
                    <>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Username */}
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={profileData.username || ""}
                            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                            disabled={!profileEditing}
                            className="bg-background"
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
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
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileData.first_name || ""}
                            onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                            disabled={!profileEditing}
                            className="bg-background"
                          />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
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
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          value={profileData.bio || ""}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          disabled={!profileEditing}
                          className="min-h-24 w-full rounded-lg border border-border bg-background p-3 text-foreground placeholder-muted-foreground disabled:opacity-50"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      {/* Member Since */}
                      {profile.created_at && (
                        <div className="space-y-2">
                          <Label>Member Since</Label>
                          <p className="text-foreground">
                            {new Date(profile.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
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
            <TabsContent value="account" className="space-y-6">
              <Card className="border border-border bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Configure your trading preferences</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Default Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Simulation Currency</Label>
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
                    <p className="text-sm text-muted-foreground">
                      The default currency to use for all simulations
                    </p>
                  </div>

                  {/* Default Simulation Mode */}
                  <div className="space-y-2">
                    <Label htmlFor="simMode">Default Simulation Mode</Label>
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
                    <p className="text-sm text-muted-foreground">
                      How you want to measure results in backtesting
                    </p>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Notifications</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <input
                        type="checkbox"
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
                        <p className="font-medium text-foreground">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                      </div>
                      <input
                        type="checkbox"
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
                  <div className="flex gap-3 pt-4">
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
            <TabsContent value="security" className="space-y-6">
              <Card className="border border-border bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>Update your password to keep your account secure</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
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
                    <p className="text-sm text-muted-foreground">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                  <div className="flex gap-3 pt-4">
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
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${(premium.usage.strategies.used / premium.usage.strategies.limit) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Backtests */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">Backtests</p>
                          <p className="text-sm text-muted-foreground">
                            {premium.usage.backtests.used} / {premium.usage.backtests.limit}
                          </p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${(premium.usage.backtests.used / premium.usage.backtests.limit) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* API Calls */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">API Calls</p>
                          <p className="text-sm text-muted-foreground">
                            {premium.usage.api_calls.used} / {premium.usage.api_calls.limit}
                          </p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${(premium.usage.api_calls.used / premium.usage.api_calls.limit) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
