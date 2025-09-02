// app/(dashboard)/profile/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, ShieldCheck, Briefcase, Gift, Stethoscope, Baby, Edit, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';

// Define the type for the fetched profile data
type ProfileData = {
    name: string;
    email: string;
    role: string;
    gender: string;
    dateOfBirth: string;
    bio: string | null;
    annualLeaveBalance: number;
    sickLeaveBalance: number;
    maternityLeaveBalance: number;
    paternityLeaveBalance: number;
};

// Zod schema for the bio form
const bioSchema = z.object({
  bio: z.string().max(300, "Bio cannot exceed 300 characters.").optional(),
});

type BioFormValues = z.infer<typeof bioSchema>;

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);

  const form = useForm<BioFormValues>({
    resolver: zodResolver(bioSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to fetch profile data.');
        const data = await response.json();
        setProfile(data);
        form.reset({ bio: data.bio || '' });
      } catch (error) {
        toast.error('Could not load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [form]);
  
  const onBioSubmit = async (data: BioFormValues) => {
    try {
        const response = await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bio: data.bio }),
        });

        if (!response.ok) throw new Error('Failed to update bio.');
        
        const updatedProfile = await response.json();
        setProfile(prev => prev ? { ...prev, bio: updatedProfile.bio } : null);
        toast.success('Bio updated successfully!');
        setIsEditingBio(false);

    } catch (error) {
        toast.error('An error occurred while updating bio.');
    }
  };


  if (loading) return <div className="p-8">Loading profile...</div>;
  if (!profile) return <div className="p-8">Could not load profile.</div>;

  const leaveBalances = [
    { Icon: Briefcase, label: "Annual Leave", balance: profile.annualLeaveBalance, color: "bg-blue-100 text-blue-800" },
    { Icon: Stethoscope, label: "Sick Leave", balance: profile.sickLeaveBalance, color: "bg-orange-100 text-orange-800" },
    ...(profile.gender === 'FEMALE' ? [{ Icon: Baby, label: "Maternity Leave", balance: profile.maternityLeaveBalance, color: "bg-pink-100 text-pink-800" }] : []),
    ...(profile.gender === 'MALE' ? [{ Icon: Gift, label: "Paternity Leave", balance: profile.paternityLeaveBalance, color: "bg-teal-100 text-teal-800" }] : []),
  ];

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="bg-gray-200 p-4 rounded-full">
            <User className="h-10 w-10 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
            <p className="text-md text-gray-500">{profile.email}</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Details & Bio */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{profile.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-gray-500" />
                  <Badge variant="outline">{profile.role}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Gift className="h-4 w-4 text-gray-500" />
                  <span>Born on {new Date(profile.dateOfBirth).toLocaleDateString('en-KE')}</span>
                </div>
                 <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-500">Gender:</span>
                  <span>{profile.gender}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Bio</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsEditingBio(!isEditingBio)}>
                  {isEditingBio ? <Save className="h-4 w-4" onClick={form.handleSubmit(onBioSubmit)} /> : <Edit className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent>
                {isEditingBio ? (
                  <form onSubmit={form.handleSubmit(onBioSubmit)}>
                    <Textarea
                      placeholder="Tell us a bit about yourself..."
                      {...form.register('bio')}
                      className="min-h-[100px]"
                    />
                     <Button type="submit" size="sm" className="mt-2">Save Bio</Button>
                  </form>
                ) : (
                  <p className="text-sm text-gray-600 italic">
                    {profile.bio || "No bio added yet. Click the edit icon to add one."}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Leave Balances */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Leave Balances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {leaveBalances.map(({ Icon, label, balance, color }) => (
                  <div key={label} className={`p-4 rounded-lg flex items-center justify-between ${color}`}>
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{label}</span>
                    </div>
                    <span className="text-lg font-bold">{balance} days</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
