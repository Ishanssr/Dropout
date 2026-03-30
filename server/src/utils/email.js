const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Dropamyn <notifications@dropamyn.com>';

async function sendDropLiveEmail(userEmail, userName, drop) {
  if (!resend) {
    console.warn('[Email] Resend not configured — skipping email to', userEmail);
    return null;
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `🔥 ${drop.title} is LIVE NOW — Dropamyn`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0f; color: #fff; border-radius: 16px; overflow: hidden;">
          ${drop.imageUrl ? `<img src="${drop.imageUrl}" alt="${drop.title}" style="width: 100%; height: 280px; object-fit: cover;" />` : ''}
          <div style="padding: 28px 24px;">
            <div style="font-size: 11px; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 8px;">🔔 Drop Alert</div>
            <h1 style="font-size: 22px; font-weight: 700; color: #fff; margin: 0 0 8px; line-height: 1.3;">${drop.title}</h1>
            <p style="font-size: 14px; color: #888; margin: 0 0 6px;">by <strong style="color: #ccc;">${drop.brand?.name || 'Unknown Brand'}</strong></p>
            ${drop.price && drop.price.trim() ? `<p style="font-size: 18px; font-weight: 700; color: #3b82f6; margin: 12px 0;">${drop.price}</p>` : ''}
            <p style="font-size: 14px; color: #999; line-height: 1.6; margin: 12px 0 24px;">${(drop.description || '').slice(0, 200)}${drop.description?.length > 200 ? '...' : ''}</p>
            <a href="https://dropamyn.com/drop/${drop.id}" style="display: inline-block; padding: 14px 32px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 50px; font-size: 14px; font-weight: 600;">View Drop →</a>
            ${drop.website ? `<a href="${drop.website}" style="display: inline-block; margin-left: 12px; padding: 14px 32px; background: rgba(255,255,255,0.06); color: #fff; text-decoration: none; border-radius: 50px; font-size: 14px; font-weight: 600; border: 1px solid rgba(255,255,255,0.1);">Shop Now ↗</a>` : ''}
          </div>
          <div style="padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: #666;">
            Hey ${userName || 'there'}, you asked us to notify you when this drop goes live. Here it is!
          </div>
        </div>
      `,
    });
    console.log(`[Email] Sent drop-live notification to ${userEmail} for "${drop.title}"`);
    return result;
  } catch (err) {
    console.error(`[Email] Failed to send to ${userEmail}:`, err.message);
    return null;
  }
}

module.exports = { sendDropLiveEmail };
