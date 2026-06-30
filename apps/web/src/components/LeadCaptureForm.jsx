import React, { useState } from 'react';
import { X, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { formatPhoneNumber } from '@/utils/phoneFormatter.js';

const LeadCaptureForm = ({ isOpen, onClose, toolId, toolTitle, calculationResults, onSubmitSuccess, requiresOtp }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    mobile: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: null,
    email: null,
    mobile: null
  });

  // Strict OTP State
  const [showOtp, setShowOtp] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [sessionId, setSessionId] = useState(null);

  const validateField = (name, value) => {
    let error = null;
    if (name === 'name' && !value.trim()) error = "Name is required";
    if (name === 'email') {
      if (!value.trim()) error = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/i.test(value)) error = "Please enter a valid email";
    }
    if (name === 'mobile') {
      if (requiresOtp && !value.trim()) {
        error = "Mobile number is required for verification";
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);
    const mobileError = validateField('mobile', formData.mobile);
    setErrors({ name: nameError, email: emailError, mobile: mobileError });
    return !nameError && !emailError && !mobileError;
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!isFormValid()) return;

    // Validate and format phone number
    const phoneResult = formatPhoneNumber(formData.mobile);
    
    if (!phoneResult.isValid) {
      toast.error('Please enter a valid international mobile number');
      setErrors(prev => ({ ...prev, mobile: phoneResult.error }));
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending OTP via API...', phoneResult.formattedNumber);
      
      const response = await apiServerClient.fetch('/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneResult.formattedNumber })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error('Server returned an error response');
      }

      const data = await response.json();

      if (data.success) {
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
        setShowOtp(true);
        toast.success('OTP sent successfully');
      } else {
        throw new Error('API success flag was false');
      }
    } catch (error) {
      console.error('OTP Send Technical Error:', error);
      toast.error('Please enter a valid international mobile number');
    } finally {
      setIsLoading(false);
    }
  };

  const submitLead = async (verifiedStatus) => {
    try {
      // Save to PocketBase
      await pb.collection('hydra_leads').create({
        name: formData.name,
        email: formData.email,
        city: formData.city,
        mobile: formData.mobile,
        toolId: toolId,
        toolTitle: toolTitle,
        calculationResults: calculationResults
      }, { $autoCancel: false });

      toast.success('Details verified securely.');
      onSubmitSuccess(formData.name, verifiedStatus);
      
      // Reset form
      setFormData({ name: '', email: '', city: '', mobile: '' });
      setShowOtp(false);
      setOtpValue('');
      setSessionId(null);
    } catch (error) {
      console.error('Lead capture error:', error);
      toast.error('Failed to verify details. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    if (requiresOtp) {
      if (!showOtp) {
        await handleSendOtp();
        return;
      }
      
      if (otpValue.length < 4) {
        toast.error('Please enter a valid OTP.');
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiServerClient.fetch('/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, otp: otpValue })
        });

        if (!response.ok) {
          throw new Error('Verification request failed');
        }

        const data = await response.json();

        if (data.success && data.verified) {
          toast.success('OTP verified successfully!');
          await submitLead(true);
        } else {
          toast.error(data.error || 'Invalid or expired OTP. Please try again.');
        }
      } catch (error) {
        console.error('OTP Verification Error:', error);
        toast.error('An error occurred during verification. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      await submitLead(true);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="bg-card rounded-2xl border border-border max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary/5 blur-[80px] pointer-events-none rounded-full" />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="text-xl font-bold text-foreground tracking-tight">Unlock Your Plan</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="bg-muted/50 border border-border rounded-xl p-4 flex gap-3 mb-6">
            <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Your ${toolTitle} calculation is ready. Enter your details below to reveal your tailored insights.
            </p>
          </div>

          {!showOtp ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={isLoading} className={errors.name ? 'border-destructive' : ''} placeholder="Your Name" />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={isLoading} className={errors.email ? 'border-destructive' : ''} placeholder="name@example.com" />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number {requiresOtp && <span className="text-destructive">*</span>}</Label>
                  <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} disabled={isLoading} className={errors.mobile ? 'border-destructive' : ''} placeholder="+1 234 567 8900" />
                  {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City/Region</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} disabled={isLoading} placeholder="New York" />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
                <KeyRound className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Enter the OTP sent to</p>
                <p className="text-lg font-bold text-primary tracking-wider mt-1">{formatPhoneNumber(formData.mobile).formattedNumber || formData.mobile}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-center block">One Time Password</Label>
                <Input 
                  id="otp" 
                  type="text" 
                  maxLength={6} 
                  value={otpValue} 
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))} 
                  className="text-center text-2xl tracking-[0.5em] font-bold h-14" 
                  placeholder="••••" 
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <button type="button" onClick={handleSendOtp} disabled={isLoading} className="text-sm text-primary hover:underline w-full text-center mt-2 disabled:opacity-50">
                Resend OTP
              </button>
            </div>
          )}

          <div className="pt-4">
            <Button type="submit" disabled={isLoading || (!showOtp && requiresOtp && !formData.mobile)} className="w-full bg-primary text-primary-foreground hover:brightness-110 py-6 font-bold text-base transition-all active:scale-[0.98]">
              {isLoading ? 'Processing...' : (requiresOtp && !showOtp ? 'Get OTP' : 'View My Results')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadCaptureForm;