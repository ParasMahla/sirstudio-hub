import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  message?: string;
  variant?: "floating" | "inline";
  size?: "sm" | "default" | "lg";
  className?: string;
}

const WHATSAPP_NUMBER = "+919460980809"; // +91 94609 80809

const WhatsAppButton = ({ 
  message = "Hi SIR STUDIO! I'm interested in learning more about your academic services.", 
  variant = "inline",
  size = "default",
  className = ""
}: WhatsAppButtonProps) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

  const handleClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === "floating") {
    return (
      <Button
        onClick={handleClick}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#22C55E] shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
        size="icon"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size={size}
      className={`bg-[#25D366] hover:bg-[#22C55E] text-white border-[#25D366] hover:border-[#22C55E] ${className}`}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      WhatsApp
    </Button>
  );
};

export default WhatsAppButton;