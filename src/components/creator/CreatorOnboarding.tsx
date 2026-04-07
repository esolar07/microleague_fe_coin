import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  User, Upload, CheckCircle2, ArrowRight, ArrowLeft,
  Shield, Trophy, Sparkles, Globe, Instagram, Twitter
} from "lucide-react";

interface CreatorOnboardingProps {
  onComplete: () => void;
}

const steps = [
  { id: "profile", label: "Profile", icon: User },
  { id: "verification", label: "Verification", icon: Shield },
  { id: "league", label: "League Setup", icon: Trophy },
  { id: "review", label: "Review", icon: CheckCircle2 },
];

const CreatorOnboarding = ({ onComplete }: CreatorOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    sport: "",
    socialTwitter: "",
    socialInstagram: "",
    website: "",
    idUploaded: false,
    selfieUploaded: false,
    leagueName: "",
    leagueDescription: "",
    leagueType: "",
  });
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "uploading" | "submitted" | "verified">("idle");

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.displayName && formData.bio && formData.sport;
      case 1:
        return verificationStatus === "verified";
      case 2:
        return formData.leagueName && formData.leagueDescription && formData.leagueType;
      default:
        return true;
    }
  };

  const handleVerificationUpload = (type: "id" | "selfie") => {
    updateField(type === "id" ? "idUploaded" : "selfieUploaded", true);
    if (
      (type === "id" && formData.selfieUploaded) ||
      (type === "selfie" && formData.idUploaded)
    ) {
      setVerificationStatus("uploading");
      setTimeout(() => setVerificationStatus("submitted"), 1500);
      setTimeout(() => setVerificationStatus("verified"), 3500);
    }
  };

  const sportOptions = ["Football", "Basketball", "Cricket", "Baseball", "Soccer", "Tennis", "Esports", "MMA/Boxing", "Other"];
  const leagueTypes = ["Professional League", "Amateur League", "Fantasy League", "Community League", "Tournament Series"];

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" /> Creator Program
          </Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2">Become a Creator</h1>
          <p className="text-muted-foreground">Launch your league, token, and merch on MicroLeague</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10 px-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? "bg-success text-success-foreground"
                        : isActive
                        ? "bg-primary text-primary-foreground shadow-mlc-glow"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-2 ${i < currentStep ? "bg-success" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mlc-card"
          >
            {/* Step 0: Profile */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Creator Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Display Name *</label>
                    <Input
                      placeholder="Your creator name"
                      value={formData.displayName}
                      onChange={(e) => updateField("displayName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Bio *</label>
                    <Textarea
                      placeholder="Tell your community about yourself..."
                      value={formData.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Primary Sport *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {sportOptions.map((sport) => (
                        <button
                          key={sport}
                          onClick={() => updateField("sport", sport)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                            formData.sport === sport
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-foreground border-border hover:border-primary/50"
                          }`}
                        >
                          {sport}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                        <Twitter className="w-3.5 h-3.5" /> Twitter/X
                      </label>
                      <Input
                        placeholder="@handle"
                        value={formData.socialTwitter}
                        onChange={(e) => updateField("socialTwitter", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5" /> Instagram
                      </label>
                      <Input
                        placeholder="@handle"
                        value={formData.socialInstagram}
                        onChange={(e) => updateField("socialInstagram", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> Website
                    </label>
                    <Input
                      placeholder="https://yoursite.com"
                      value={formData.website}
                      onChange={(e) => updateField("website", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Verification */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Identity Verification</h2>
                <p className="text-sm text-muted-foreground">We verify creators to protect the community. This is a one-time process.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ID Upload */}
                  <button
                    onClick={() => handleVerificationUpload("id")}
                    disabled={formData.idUploaded}
                    className={`p-6 rounded-xl border-2 border-dashed transition-all text-center ${
                      formData.idUploaded
                        ? "border-success bg-success/5"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    {formData.idUploaded ? (
                      <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    )}
                    <p className="text-sm font-medium text-foreground">Government ID</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.idUploaded ? "Uploaded ✓" : "Passport, Driver License, or ID Card"}
                    </p>
                  </button>

                  {/* Selfie Upload */}
                  <button
                    onClick={() => handleVerificationUpload("selfie")}
                    disabled={formData.selfieUploaded}
                    className={`p-6 rounded-xl border-2 border-dashed transition-all text-center ${
                      formData.selfieUploaded
                        ? "border-success bg-success/5"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    {formData.selfieUploaded ? (
                      <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    )}
                    <p className="text-sm font-medium text-foreground">Selfie Verification</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.selfieUploaded ? "Uploaded ✓" : "Take a photo holding your ID"}
                    </p>
                  </button>
                </div>

                {/* Verification Status */}
                {verificationStatus !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${
                      verificationStatus === "verified"
                        ? "bg-success/10 border-success/30"
                        : "bg-warning/10 border-warning/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {verificationStatus === "verified" ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-warning border-t-transparent rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {verificationStatus === "uploading" && "Uploading documents..."}
                          {verificationStatus === "submitted" && "Verifying your identity..."}
                          {verificationStatus === "verified" && "Identity Verified!"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {verificationStatus === "verified"
                            ? "You're approved to create on MicroLeague"
                            : "This usually takes a few seconds for demo"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 2: League Setup */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">League Setup</h2>
                <p className="text-sm text-muted-foreground">Configure your first league. You can always create more later.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">League Name *</label>
                    <Input
                      placeholder="e.g. Street Champions League"
                      value={formData.leagueName}
                      onChange={(e) => updateField("leagueName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Description *</label>
                    <Textarea
                      placeholder="What's your league about?"
                      value={formData.leagueDescription}
                      onChange={(e) => updateField("leagueDescription", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">League Type *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {leagueTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => updateField("leagueType", type)}
                          className={`px-4 py-3 rounded-lg text-sm font-medium border transition-all text-left ${
                            formData.leagueType === type
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-foreground border-border hover:border-primary/50"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Review & Launch</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Creator</p>
                    <p className="text-sm font-semibold text-foreground">{formData.displayName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formData.sport} • Verified ✓</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">League</p>
                    <p className="text-sm font-semibold text-foreground">{formData.leagueName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formData.leagueType}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-xs font-medium text-primary mb-2">What's included</p>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Creator Dashboard with analytics</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Launch your own league token (pump.fun style)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Merchandise store for your community</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Community perks & tier management</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> 1% MLC transaction fee on token trades</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep((s) => s - 1)}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              {currentStep === 3 ? (
                <Button onClick={onComplete} className="mlc-gradient-bg text-primary-foreground">
                  <Sparkles className="w-4 h-4 mr-1" /> Launch Creator Profile
                </Button>
              ) : (
                <Button onClick={() => setCurrentStep((s) => s + 1)} disabled={!canProceed()}>
                  Continue <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreatorOnboarding;
