import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface PaystackPaymentProps {
  email: string;
  amount: number; // in kobo (multiply by 100)
  currency: string;
  reference: string;
  publicKey: string;
  onSuccess: (reference: any) => void;
  onCancel: () => void;
  onError: (error: any) => void;
  children: React.ReactNode;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        callback: (response: any) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

const PaystackPayment = ({
  email,
  amount,
  currency = 'NGN',
  reference,
  publicKey, // Paystack public key passed from parent component
  onSuccess,
  onCancel,
  onError,
  children
}: PaystackPaymentProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!window.PaystackPop) {
      toast({
        title: "Payment Error",
        description: "Payment system is loading. Please try again in a moment.",
        variant: "destructive"
      });
      return;
    }

    try {
      const paystack = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        currency,
        ref: reference,
        callback: (response) => {
          if (response.status === 'success') {
            onSuccess(response);
            toast({
              title: "Payment Successful",
              description: `Transaction reference: ${response.reference}`
            });
          } else {
            onError(response);
            toast({
              title: "Payment Failed",
              description: "Your payment could not be processed.",
              variant: "destructive"
            });
          }
        },
        onClose: () => {
          onCancel();
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment process."
          });
        }
      });

      paystack.openIframe();
    } catch (error) {
      // Payment error handled by toast
      onError(error);
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment.",
        variant: "destructive"
      });
    }
  };

  return (
    <div onClick={handlePayment} style={{ cursor: 'pointer' }}>
      {children}
    </div>
  );
};

export default PaystackPayment;