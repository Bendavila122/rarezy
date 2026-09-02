// Shared HTML shell for every transactional email Rarezy sends via Resend.
// Deployed alongside each function (folders prefixed `_` aren't served as
// their own function) — keeps every email visually consistent without
// duplicating the wrapper markup in each edge function.

const BRAND_GREEN = "#1FA34C";
const LOGO_URL = "https://rarezy.co.uk/rarezy-logo-dark.png";

export function emailShell(bodyHtml: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:32px 16px;background:#f4f5f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;">
            <tr>
              <td style="padding-bottom:28px;text-align:center;">
                <img src="${LOGO_URL}" alt="Rarezy" width="132" style="display:inline-block;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border-radius:2px;border:1px solid #e7e8e5;padding:36px 32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding-top:24px;text-align:center;">
                <p style="margin:0;font-size:12px;line-height:1.7;color:#9a9c96;">
                  Rarezy Ltd &middot; Registered in England &amp; Wales<br />
                  Questions? <a href="mailto:help@rarezy.co.uk" style="color:${BRAND_GREEN};text-decoration:none;">help@rarezy.co.uk</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function verificationCodeEmail(code: string): string {
  return emailShell(`
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND_GREEN};">Verify your email</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.02em;">Here's your code</h1>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#55564f;">Enter this code to continue creating your Rarezy account. It expires in 10 minutes.</p>
    <div style="background:#f2faf5;border:1px solid #cdeedb;border-radius:2px;padding:20px;text-align:center;margin-bottom:24px;">
      <span style="font-size:32px;font-weight:700;letter-spacing:0.4em;color:#128a3e;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">${code}</span>
    </div>
    <p style="margin:0;font-size:12.5px;line-height:1.6;color:#9a9c96;">Didn't request this? You can safely ignore this email.</p>
  `);
}

export function verifiedWelcomeEmail(username: string): string {
  return emailShell(`
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND_GREEN};">You're verified</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.02em;">Welcome to Rarezy, ${username}</h1>
    <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#55564f;">Your ID has been verified. You're all set to log in, buy tickets, and start entering competitions for real watches.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="background:${BRAND_GREEN};border-radius:2px;">
          <a href="https://rarezy.co.uk/login" style="display:inline-block;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 28px;letter-spacing:-0.01em;">Log in to Rarezy</a>
        </td>
      </tr>
    </table>
  `);
}
