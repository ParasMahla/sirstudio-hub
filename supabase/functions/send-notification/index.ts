import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  inquiryId: string;
  type: 'new_inquiry' | 'inquiry_update';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { inquiryId, type }: NotificationRequest = await req.json();

    // Fetch the inquiry details
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single();

    if (error || !inquiry) {
      throw new Error('Inquiry not found');
    }

    // For now, just log the notification
    // In production, you would integrate with email service like Resend
    console.log(`Notification ${type} for inquiry:`, {
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      service: inquiry.service,
      message: inquiry.message,
      created_at: inquiry.created_at
    });

    // Simulate email sending
    const emailData = {
      to: "info@sirstudio.com",
      subject: type === 'new_inquiry' 
        ? `New Inquiry from ${inquiry.name}` 
        : `Inquiry Update - ${inquiry.name}`,
      text: `
        Name: ${inquiry.name}
        Email: ${inquiry.email}
        Phone: ${inquiry.phone || 'Not provided'}
        Service: ${inquiry.service}
        Message: ${inquiry.message || 'No message provided'}
        Status: ${inquiry.status}
        Submitted: ${new Date(inquiry.created_at).toLocaleString()}
        
        ${type === 'new_inquiry' ? 'Please respond to this inquiry promptly.' : 'This inquiry has been updated.'}
      `
    };

    console.log('Email would be sent:', emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${type} notification processed`,
        inquiry: {
          id: inquiry.id,
          name: inquiry.name,
          service: inquiry.service
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);