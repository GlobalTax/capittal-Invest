import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  investor_user_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { investor_user_id }: InvitationRequest = await req.json();

    if (!investor_user_id) {
      return new Response(
        JSON.stringify({ error: "investor_user_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch the investor user
    const { data: investor, error: fetchError } = await supabase
      .from("investor_users")
      .select("*")
      .eq("id", investor_user_id)
      .single();

    if (fetchError || !investor) {
      return new Response(
        JSON.stringify({ error: "Investor not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate new invitation token if expired or doesn't exist
    let invitationToken = investor.invitation_token;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    if (!invitationToken || new Date(investor.invitation_expires_at) < new Date()) {
      invitationToken = crypto.randomUUID();
      
      const { error: updateError } = await supabase
        .from("investor_users")
        .update({
          invitation_token: invitationToken,
          invitation_expires_at: expiresAt.toISOString(),
          invited_at: new Date().toISOString(),
        })
        .eq("id", investor_user_id);

      if (updateError) {
        console.error("Error updating invitation token:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update invitation token" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Build the invitation link
    const baseUrl = Deno.env.get("SITE_URL") || "https://ethos-venture.lovable.app";
    const invitationLink = `${baseUrl}/investor/accept-invitation?token=${invitationToken}`;

    // Send the email using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ethos Venture <onboarding@resend.dev>",
        to: [investor.email],
        subject: "Invitación al Portal del Inversor - Ethos Venture",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invitación al Portal del Inversor</title>
          </head>
          <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a1a; margin-bottom: 10px;">Ethos Venture</h1>
              <p style="color: #666; font-size: 14px;">Portal del Inversor</p>
            </div>
            
            <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h2 style="color: #1a1a1a; margin-top: 0;">Hola${investor.full_name ? ` ${investor.full_name}` : ''},</h2>
              
              <p>Has sido invitado a acceder al Portal del Inversor de Ethos Venture, donde podrás:</p>
              
              <ul style="color: #555;">
                <li>Consultar el estado de tus inversiones</li>
                <li>Acceder a documentos e informes</li>
                <li>Ver el performance de tus fondos</li>
                <li>Recibir actualizaciones importantes</li>
              </ul>
              
              <p style="margin-top: 25px;">Para activar tu cuenta, haz clic en el siguiente enlace:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationLink}" 
                   style="display: inline-block; background: #1a1a1a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                  Activar mi cuenta
                </a>
              </div>
              
              <p style="font-size: 13px; color: #888;">
                Este enlace expirará en 7 días. Si tienes problemas para hacer clic en el botón, 
                copia y pega la siguiente URL en tu navegador:
              </p>
              <p style="font-size: 12px; color: #aaa; word-break: break-all;">
                ${invitationLink}
              </p>
            </div>
            
            <div style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
              <p>Si no esperabas recibir esta invitación, puedes ignorar este email.</p>
              <p>&copy; ${new Date().getFullYear()} Ethos Venture Partners. Todos los derechos reservados.</p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    console.log("Invitation email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation sent successfully",
        email_id: emailData.id 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-investor-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
