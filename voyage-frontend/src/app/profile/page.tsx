"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAgentStore } from "@/stores/agentStore";
import { UserType } from "@/types";
import { 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  CheckCircle, 
  Upload,
  Save,
  Eye,
  Calendar,
  Users,
  Languages,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const countries = [
  "United States", "United Kingdom", "Germany", "France", "Italy", "Spain",
  "Greece", "Czech Republic", "Austria", "Netherlands", "Switzerland", "Portugal"
];

const languages = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", 
  "Greek", "Czech", "Dutch", "Russian", "Mandarin", "Japanese"
];

const specializations = [
  "Luxury Travel", "Adventure Travel", "Cultural Tours", "Beach Resorts",
  "City Breaks", "Honeymoon Packages", "Family Vacations", "Business Travel",
  "Group Tours", "Cruise Holidays", "Wellness Retreats", "Eco Tourism"
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { 
    travelAgentProfile, 
    dmcAgentProfile, 
    isLoadingProfile,
    setLoadingProfile,
    setTravelAgentProfile,
    setDMCAgentProfile
  } = useAgentStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState("profile");

  const isDMC = user?.user_type === UserType.DMC_AGENT;
  const currentProfile = isDMC ? dmcAgentProfile : travelAgentProfile;

  // Mock profile data
  useEffect(() => {
    if (user && !currentProfile) {
      setLoadingProfile(true);
      setTimeout(() => {
        if (isDMC) {
          const mockDMCProfile = {
            id: "dmc1",
            user_id: user.id,
            company_name: "Mediterranean Dreams",
            phone: "+39 081 878 1024",
            website: "https://meddreams.com",
            regions_covered: ["Italy", "Greece", "Spain"],
            languages_spoken: ["English", "Italian", "Greek"],
            years_of_experience: 12,
            specializations: ["Luxury Travel", "Beach Resorts", "Cultural Tours"],
            is_verified: true,
            verification_documents: ["business_license.pdf", "insurance_cert.pdf"],
            created_at: "2020-03-15T10:00:00Z",
            updated_at: "2024-08-01T14:30:00Z"
          };
          setDMCAgentProfile(mockDMCProfile);
          setFormData(mockDMCProfile);
        } else {
          const mockTravelProfile = {
            id: "ta1",
            user_id: user.id,
            company_name: "Elite Travel Co.",
            phone: "+1 555 123 4567",
            website: "https://elitetravel.com",
            countries_of_operation: ["United States", "Italy", "Greece"],
            languages_spoken: ["English", "Spanish", "Italian"],
            years_of_experience: 8,
            specializations: ["Luxury Travel", "Honeymoon Packages", "Cultural Tours"],
            is_verified: true,
            verification_documents: ["travel_license.pdf", "iata_cert.pdf"],
            created_at: "2021-06-20T09:00:00Z",
            updated_at: "2024-07-28T16:15:00Z"
          };
          setTravelAgentProfile(mockTravelProfile);
          setFormData(mockTravelProfile);
        }
        setLoadingProfile(false);
      }, 1000);
    }
  }, [user, currentProfile, isDMC]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev: any) => {
      const currentArray = prev[field] || [];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter((item: string) => item !== value) };
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isDMC) {
        setDMCAgentProfile(formData);
      } else {
        setTravelAgentProfile(formData);
      }
      
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(currentProfile);
    setIsEditing(false);
  };

  if (isLoadingProfile) {
    return (
      <MainLayout>
        <div className="container py-6">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-responsive">
        <PageHeader
          title="Profile"
          description="Manage your professional profile and account settings."
          breadcrumbs={[
            { label: "Dashboard", href: user?.user_type === "travel_agent" ? "/dashboard/travel-agent" : "/dashboard/dmc-agent" },
            { label: "Profile" },
          ]}
          action={
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback className="text-2xl">
                    {user ? getInitials(user.full_name) : "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {user?.full_name}
                    {currentProfile?.is_verified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </CardTitle>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary">
                      {isDMC ? "DMC Agent" : "Travel Agent"}
                    </Badge>
                    {currentProfile?.is_verified && (
                      <Badge variant="default" className="bg-green-500">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  {currentProfile?.company_name && (
                    <p className="text-muted-foreground">{currentProfile.company_name}</p>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member since</span>
                  <span>{format(new Date(currentProfile?.created_at || user?.created_at || new Date()), "MMM yyyy")}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Experience</span>
                  <span>{currentProfile?.years_of_experience || 0} years</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Regions</span>
                  <span>{isDMC ? currentProfile?.regions_covered?.length || 0 : currentProfile?.countries_of_operation?.length || 0}</span>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Specializations</h4>
                  <div className="flex flex-wrap gap-1">
                    {currentProfile?.specializations?.slice(0, 3).map((spec: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {currentProfile?.specializations?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{currentProfile.specializations.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Languages</h4>
                  <div className="flex flex-wrap gap-1">
                    {currentProfile?.languages_spoken?.slice(0, 3).map((lang: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                    {currentProfile?.languages_spoken?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{currentProfile.languages_spoken.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <a href={`/profile/public/${currentProfile?.id}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    View Public Profile
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input
                          value={formData.company_name || ""}
                          onChange={(e) => handleInputChange("company_name", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Years of Experience</Label>
                        <Input
                          type="number"
                          value={formData.years_of_experience || ""}
                          onChange={(e) => handleInputChange("years_of_experience", parseInt(e.target.value))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={formData.phone || ""}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input
                          value={formData.website || ""}
                          onChange={(e) => handleInputChange("website", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {isDMC ? "Regions Covered" : "Countries of Operation"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {countries.map((country) => (
                        <div key={country} className="flex items-center space-x-2">
                          <Checkbox
                            id={country}
                            checked={(isDMC ? formData.regions_covered : formData.countries_of_operation)?.includes(country) || false}
                            onCheckedChange={(checked) => 
                              handleArrayFieldChange(
                                isDMC ? "regions_covered" : "countries_of_operation", 
                                country, 
                                checked as boolean
                              )
                            }
                            disabled={!isEditing}
                          />
                          <Label htmlFor={country} className="text-sm">
                            {country}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="h-5 w-5" />
                      Languages Spoken
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {languages.map((language) => (
                        <div key={language} className="flex items-center space-x-2">
                          <Checkbox
                            id={language}
                            checked={formData.languages_spoken?.includes(language) || false}
                            onCheckedChange={(checked) => 
                              handleArrayFieldChange("languages_spoken", language, checked as boolean)
                            }
                            disabled={!isEditing}
                          />
                          <Label htmlFor={language} className="text-sm">
                            {language}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Specializations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {specializations.map((specialization) => (
                        <div key={specialization} className="flex items-center space-x-2">
                          <Checkbox
                            id={specialization}
                            checked={formData.specializations?.includes(specialization) || false}
                            onCheckedChange={(checked) => 
                              handleArrayFieldChange("specializations", specialization, checked as boolean)
                            }
                            disabled={!isEditing}
                          />
                          <Label htmlFor={specialization} className="text-sm">
                            {specialization}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="verification" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Verification Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Verified Account</p>
                          <p className="text-sm text-green-700">Your account has been verified</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500">Verified</Badge>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Verification Documents</h4>
                      {currentProfile?.verification_documents?.map((doc: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{doc}</span>
                          </div>
                          <Badge variant="outline">Approved</Badge>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Additional Documents
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input value={user?.email} disabled />
                      <p className="text-xs text-muted-foreground">
                        Contact support to change your email address
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={user?.full_name} disabled />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-medium">Preferences</h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="email-notifications" defaultChecked />
                          <Label htmlFor="email-notifications">Email notifications</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox id="marketing" />
                          <Label htmlFor="marketing">Marketing communications</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox id="sms" />
                          <Label htmlFor="sms">SMS notifications</Label>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-medium text-red-600">Danger Zone</h4>
                      <Button variant="destructive" className="w-full">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}