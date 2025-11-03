import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { sanitizeInput, isValidEmail, createRateLimiter, detectSuspiciousInput } from "@/utils/sanitize";
import { securityMonitor, SecurityEvents, trackFailedAuth } from "@/utils/securityMonitor";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
}

// Rate limiter: max 5 login attempts per minute
const loginRateLimiter = createRateLimiter(5, 60 * 1000);

const LoginModal = ({ isOpen, onClose, onSwitchToSignup, onSwitchToForgotPassword }: LoginModalProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit
    if (!loginRateLimiter.checkLimit(formData.email)) {
      securityMonitor.logEvent(SecurityEvents.RATE_LIMIT_EXCEEDED, 'high', {
        action: 'login',
        email: formData.email.substring(0, 3) + '***'
      });
      
      toast({
        title: "Too Many Attempts",
        description: "Please wait a minute before trying again.",
        variant: "destructive"
      });
      return;
    }
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(formData.email).toLowerCase();
    
    // Validate email
    if (!isValidEmail(sanitizedEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    // Detect suspicious input patterns
    if (detectSuspiciousInput(sanitizedEmail) || detectSuspiciousInput(formData.password)) {
      securityMonitor.logEvent(SecurityEvents.SUSPICIOUS_INPUT, 'high', {
        action: 'login_attempt',
        email: sanitizedEmail.substring(0, 3) + '***'
      });
      
      toast({
        title: "Invalid Input",
        description: "Your input contains invalid characters.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signIn(sanitizedEmail, formData.password);
    
    if (error) {
      // Track failed authentication
      trackFailedAuth(sanitizedEmail);
      
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    } else {
      // Reset rate limiter on successful login
      loginRateLimiter.reset(formData.email);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in."
      });
      onClose();
      setFormData({ email: "", password: "" });
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            Welcome Back
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            Sign in to your Ebeth Boutique account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            variant="default"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-4">
          Don't have an account?{" "}
          <button 
            onClick={onSwitchToSignup}
            className="text-primary hover:underline font-medium"
          >
            Sign Up
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;