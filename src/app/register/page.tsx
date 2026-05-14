'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, ArrowRight, Upload, Check, User, Briefcase, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'Other'];

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Professional Info', icon: Briefcase },
  { id: 3, title: 'Documents', icon: FileText },
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    designation: '',
    department: '',
    experienceYears: 0,
    description: '',
    photo: null as File | null,
    photoPreview: '',
    acceptTerms: false,
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField('photo', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('photoPreview', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.phone) {
          toast.error('Please fill in all required fields');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        return true;
      case 2:
        if (!formData.designation || !formData.department) {
          toast.error('Please fill in designation and department');
          return false;
        }
        return true;
      case 3:
        if (!formData.photo) {
          toast.error('Please upload a profile photo');
          return false;
        }
        if (!formData.acceptTerms) {
          toast.error('Please accept the terms and conditions');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      data.append('designation', formData.designation);
      data.append('department', formData.department);
      data.append('experienceYears', formData.experienceYears.toString());
      data.append('description', formData.description);
      if (formData.photo) {
        data.append('photo', formData.photo);
      }

      const response = await fetch('/api/employees/register', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background gradient-bg flex items-center justify-center px-6">
        <div className="glass-card p-12 text-center max-w-md w-full animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-3">
            Application Submitted!
          </h2>
          <p className="text-text-secondary leading-relaxed mb-8">
            Your application has been submitted successfully. You will receive an email once your application has been reviewed by our team.
          </p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background gradient-bg">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-xl font-bold text-text-primary">NexaHR</span>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Employee Registration
          </h1>
          <p className="text-text-secondary">Join our team — fill in your details below</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  currentStep === step.id
                    ? 'bg-primary/20 border border-primary/40 text-primary'
                    : currentStep > step.id
                    ? 'bg-success/15 border border-success/30 text-success'
                    : 'bg-surface border border-border text-text-secondary'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-success' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 animate-fade-in">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-slide-up">
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-6">
                Personal Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Home Address
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Professional Info */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-slide-up">
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-6">
                Professional Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Designation / Job Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Software Engineer"
                  value={formData.designation}
                  onChange={(e) => updateField('designation', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Department <span className="text-danger">*</span>
                </label>
                <select
                  className="input-field"
                  value={formData.department}
                  onChange={(e) => updateField('department', e.target.value)}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  className="input-field"
                  min={0}
                  max={50}
                  placeholder="0"
                  value={formData.experienceYears}
                  onChange={(e) => updateField('experienceYears', parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  About Yourself
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={4}
                  placeholder="Brief description about yourself, your skills, and experience..."
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
                <p className="text-xs text-text-secondary/60 mt-1">
                  This will be used for AI-powered profile analysis
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-slide-up">
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-6">
                Documents & Verification
              </h2>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Profile Photo <span className="text-danger">*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
                >
                  {formData.photoPreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={formData.photoPreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-2xl object-cover mb-4 border-2 border-primary/30"
                      />
                      <p className="text-sm text-text-secondary">Click to change photo</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-10 h-10 text-text-secondary mb-3" />
                      <p className="text-text-primary font-medium">Click to upload photo</p>
                      <p className="text-xs text-text-secondary mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-background rounded-xl border border-border">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.acceptTerms}
                  onChange={(e) => updateField('acceptTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary/30"
                />
                <label htmlFor="terms" className="text-sm text-text-secondary leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <span className="text-primary hover:underline">Terms and Conditions</span> and consent
                  to the processing of my personal data for employment purposes.
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {currentStep > 1 ? (
              <button onClick={prevStep} className="btn-secondary flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button onClick={nextStep} className="btn-primary flex items-center gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
