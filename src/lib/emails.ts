import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "no-reply@guemajim.com";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendUserApprovedEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "¡Tu cuenta fue aprobada! — Guemajim",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#b45309">¡Bienvenido/a, ${name}!</h2>
        <p>Tu cuenta en <strong>Guemajim</strong> fue aprobada. Ya podés ingresar a la plataforma y explorar los guemajim disponibles.</p>
        <a href="${BASE_URL}/login" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#b45309;color:white;border-radius:8px;text-decoration:none">Ingresar</a>
      </div>
    `,
  });
}

export async function sendUserRejectedEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Actualización de tu registro — Guemajim",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#b45309">Hola, ${name}</h2>
        <p>Lamentablemente tu solicitud de acceso a <strong>Guemajim</strong> no fue aprobada en esta ocasión.</p>
        <p>Si creés que hay un error, podés contactarnos respondiendo este email.</p>
      </div>
    `,
  });
}

export async function sendNewRegistrationEmail(
  adminEmail: string,
  userName: string,
  userEmail: string,
  dni: string,
  community: string
) {
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: "Nuevo registro pendiente — Guemajim",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#b45309">Nuevo usuario registrado</h2>
        <p><strong>Nombre:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>DNI:</strong> ${dni}</p>
        <p><strong>Comunidad:</strong> ${community}</p>
        <a href="${BASE_URL}/admin" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#b45309;color:white;border-radius:8px;text-decoration:none">Ver en el panel</a>
      </div>
    `,
  });
}

export async function sendRequestReceivedEmail(
  ownerEmail: string,
  ownerName: string,
  itemTitle: string,
  requesterName: string,
  requestId: string
) {
  await resend.emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `Nueva solicitud para "${itemTitle}" — Guemajim`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#b45309">Hola, ${ownerName}</h2>
        <p><strong>${requesterName}</strong> solicitó tu publicación <strong>"${itemTitle}"</strong>.</p>
        <a href="${BASE_URL}/mis-solicitudes" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#b45309;color:white;border-radius:8px;text-decoration:none">Ver solicitud</a>
      </div>
    `,
  });
}

export async function sendRequestStatusEmail(
  requesterEmail: string,
  requesterName: string,
  itemTitle: string,
  accepted: boolean
) {
  const status = accepted ? "aceptada" : "rechazada";
  await resend.emails.send({
    from: FROM,
    to: requesterEmail,
    subject: `Tu solicitud fue ${status} — Guemajim`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#b45309">Hola, ${requesterName}</h2>
        <p>Tu solicitud para <strong>"${itemTitle}"</strong> fue <strong>${status}</strong>.</p>
        ${accepted ? '<p>El dueño/a se pondrá en contacto con vos para coordinar la entrega.</p>' : ''}
        <a href="${BASE_URL}/mis-solicitudes" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#b45309;color:white;border-radius:8px;text-decoration:none">Ver mis solicitudes</a>
      </div>
    `,
  });
}
