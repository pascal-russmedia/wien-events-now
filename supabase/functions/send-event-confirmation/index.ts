import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventConfirmationRequest {
  eventId: string;
  eventName: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Sending event confirmation email...");
    
    const { eventId, eventName, email }: EventConfirmationRequest = await req.json();

    // Use the correct Lovable app URL
    const editUrl = `https://preview--live-wohin-russmedia.lovable.app/edit-event/${eventId}?email=${encodeURIComponent(email)}`;

    const emailResponse = await resend.emails.send({
      from: "Wohin <wohin@wohin.russmedia.com>",
      to: [email],
      subject: `Event erfolgreich eingereicht`,
      text: `
Hallo,

dein Event "${eventName}" ist bei uns eingegangen und wird nach Prüfung veröffentlicht.

Änderungen notwendig?
Über folgenden Link kannst du dein Event jederzeit bearbeiten:
${editUrl}

So geht's weiter:
- Unser Team prüft dein Event
- Wir informieren dich nach Freigabe
- Dein Event wird veröffentlicht

Vielen Dank für die Einreichung. Bei Fragen einfach auf diese E-Mail antworten.

Liebe Grüße,
Dein Wohin Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 6px solid #ffd700; padding-bottom: 10px;">Event eingereicht</h1>
          
          <p>Hallo,</p>
          
          <p>dein Event "<strong>${eventName}</strong>" ist bei uns eingegangen und wird nach Prüfung veröffentlicht.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 6px solid #ffd700;">
            <h3 style="margin-top: 0; color: #333;">Änderungen notwendig?</h3>
            <p>Über folgenden Link kannst du dein Event jederzeit bearbeiten.</p>
            <a href="${editUrl}" style="display: inline-block; background-color: #ffd700; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0;">
              Event bearbeiten
            </a>
          </div>
          
          <p><strong>So geht's weiter:</strong></p>
          <ul>
            <li>Unser Team prüft dein Event</li>
            <li>Wir informieren dich nach Freigabe</li>
            <li>Dein Event wird veröffentlicht</li>
          </ul>
          
          <p>Vielen Dank für die Einreichung. Bei Fragen einfach auf diese E-Mail antworten.</p>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            Liebe Grüße,<br>
            Dein Wohin Team
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
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
