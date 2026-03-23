"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Palette, 
  Bell, 
  Shield, 
  Download, 
  Camera,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// 1. Menggunakan hook useAuth yang baru kamu berikan
// Pastikan path import ini sesuai dengan lokasi file useAuth kamu
import { useAuth } from "../../hooks/useAuth"; 

// 2. Menggunakan Sonner mutlak
import { toast } from "sonner";

interface UserSettings {
  theme: 'light' | 'dark' | 'high-contrast';
  fontSize: 'small' | 'medium' | 'large';
  notifications: {
    moodReminders: boolean;
    journalReminders: boolean;
    breathingReminders: boolean;
    achievementAlerts: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    dyslexicFont: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
  };
}

export default function ProfilePage() {
  // Mengambil user dan updateProfile dari useAuth hook
  const { user, updateProfile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    photoURL: user?.photoURL || "",
  });

  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    fontSize: 'medium',
    notifications: {
      moodReminders: true,
      journalReminders: true,
      breathingReminders: false,
      achievementAlerts: true,
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      dyslexicFont: false,
    },
    privacy: {
      dataSharing: false,
      analytics: true,
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Load user settings
    if (user) {
      setProfileData({
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // updateProfile dari useAuth menerima Partial<UserProfile> dan mengembalikan Promise<{ success, error }>
      const result = await updateProfile(profileData);
      
      if (result && !result.success) {
        toast.error("Error", {
          description: result.error || "Failed to update profile",
        });
      } else {
        toast.success("Success", {
          description: "Your profile has been updated",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Save settings to Firebase
      toast.success("Success", {
        description: "Your settings have been saved",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to save settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    // Export user data
    toast.info("Export Started", {
      description: "Your data is being prepared for download",
    });
  };

  const handleDeleteAccount = () => {
    // Handle account deletion
    toast.error("Account Deletion", {
      description: "This feature is not yet available",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileData.photoURL} />
                    <AvatarFallback className="text-lg">
                      {profileData.displayName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-1">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
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
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isLoading}>
                    {isLoading ? (
                      <LoadingSpinner size="sm" text="Saving..." />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value: 'light' | 'dark' | 'high-contrast') => 
                        setSettings(prev => ({ ...prev, theme: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="high-contrast">High Contrast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Select
                      value={settings.fontSize}
                      onValueChange={(value: 'small' | 'medium' | 'large') => 
                        setSettings(prev => ({ ...prev, fontSize: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? (
                      <LoadingSpinner size="sm" text="Saving..." />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Appearance
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Options</CardTitle>
                <CardDescription>
                  Configure accessibility features to suit your needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    checked={settings.accessibility.highContrast}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        accessibility: { ...prev.accessibility, highContrast: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reduced Motion</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimize animations throughout the app
                    </p>
                  </div>
                  <Switch
                    checked={settings.accessibility.reducedMotion}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        accessibility: { ...prev.accessibility, reducedMotion: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Screen Reader Support</Label>
                    <p className="text-sm text-muted-foreground">
                      Optimize for screen reader usage
                    </p>
                  </div>
                  <Switch
                    checked={settings.accessibility.screenReader}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        accessibility: { ...prev.accessibility, screenReader: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dyslexic Font</Label>
                    <p className="text-sm text-muted-foreground">
                      Use OpenDyslexic font for better readability
                    </p>
                  </div>
                  <Switch
                    checked={settings.accessibility.dyslexicFont}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        accessibility: { ...prev.accessibility, dyslexicFont: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? (
                      <LoadingSpinner size="sm" text="Saving..." />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Accessibility
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose which notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mood Check-in Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Daily reminders to track your mood
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.moodReminders}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, moodReminders: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Journal Prompts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get inspired with daily journal prompts
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.journalReminders}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, journalReminders: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Breathing Exercise Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Gentle reminders to practice breathing exercises
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.breathingReminders}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, breathingReminders: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Achievement Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Celebrate your milestones and achievements
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.achievementAlerts}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, achievementAlerts: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? (
                      <LoadingSpinner size="sm" text="Saving..." />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Notifications
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Manage your privacy settings and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anonymous data sharing for research
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.dataSharing}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, dataSharing: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help us improve by sharing usage analytics
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.analytics}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, analytics: checked }
                      }))
                    }
                  />
                </div>

                <div className="border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    className="w-full mb-2"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Download all your data in JSON format
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>

                <Button className="w-full">
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}