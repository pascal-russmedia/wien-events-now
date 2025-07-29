import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventStatusNotificationRequest {
  eventId: string;
  eventName: string;
  email: string;
  status: 'Approved' | 'Rejected';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Sending event status notification email...");
    
    const { eventId, eventName, email, status }: EventStatusNotificationRequest = await req.json();

    let subject: string;
    let html: string;

    if (status === 'Approved') {
      // Use the correct Lovable app URL for the event detail page
      const eventUrl = `https://preview--live-wohin-russmedia.lovable.app/event/${eventId}`;
      
      subject = `🎉 Dein Event ist jetzt live`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 6px solid #ffd700; padding-bottom: 10px;">Dein Event ist jetzt live</h1>
          
          <p>Hallo,</p>
          
          <p>dein Event "<strong>${eventName}</strong>" wurde freigegeben und ist ab sofort sichtbar.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 6px solid #ffd700;">
            <h3 style="margin-top: 0; color: #333;">✅ Ab sofort für jeden sichbar</h3>
            <p>Entdecke wie wir dein Event in Szene gesetzt haben:</p>
            <a href="${eventUrl}" style="display: inline-block; background-color: #ffd700; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0;">
              Event ansehen
            </a>
          </div>

          <p>Wir wünschen dir viel Erfolg bei deiner Veranstaltung!</p>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            Liebe Grüße,<br>
            Dein Wohin Team
          </p>
        </div>
      `;
    } else {
      subject = `Event abgelehnt`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 6px solid #ffd700; padding-bottom: 10px;">Event abgelehnt</h1>
          
          <p>Hallo,</p>
          
          <p>vielen Dank für die Einreichung von deinem Event "<strong>${eventName}</strong>".</p>
          
          <div style="background-color: #fef2f2; padding: 20px; margin: 20px 0; border-left: 6px solid #ef4444;">
            <h3 style="margin-top: 0; color: #333;">Event abgelehnt</h3>
            <p>Nach Prüfung haben wir festgestellt, dass dein Event nicht mit den Zielen und Richtlinien unserer Plattform übereinstimmt bzw. nicht vollständig ist.</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; font-weight: bold;">Nochmal versuchen</p>
            <a href="https://preview--live-wohin-russmedia.lovable.app/add" style="display: inline-block; background-color: #ffd700; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
              Neues Event hinzufügen
            </a>
          </div>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            Liebe Grüße,<br>
            Dein Wohin Team
          </p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Wohin <wohin@wohin.russmedia.com>",
      to: [email],
      subject: subject,
      html: html,
    });

    console.log("Status notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending status notification email:", error);
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
