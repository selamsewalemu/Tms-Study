import { Injectable } from "@angular/core";
import { StudentRegistration } from "../models/student-registration.model";

export interface EmailPayload {
  to: string;
  subject: string;
  bodyText: string;   // plain-text version (for mailto)
  bodyHtml: string;   // rich HTML version (for preview)
}

const TMS_NAME    = "TMS Core — Training Management System";
const TMS_WEBSITE = "http://localhost:4200";
const TMS_SUPPORT = "support@tmscore.edu";
const TMS_PHONE   = "+251 111 234 567";
const TMS_ADDRESS = "TMS Core Campus, Addis Ababa, Ethiopia";

@Injectable({ providedIn: "root" })
export class EmailService {

  /* ─────────────────────────────────────────────────────────────
     BUILD EMAIL PAYLOADS
  ───────────────────────────────────────────────────────────── */

  buildApprovalEmail(reg: StudentRegistration): EmailPayload {
    const name     = `${reg.firstName} ${reg.lastName}`;
    const subject  = `🎓 Congratulations! Your TMS Application Has Been Approved — ${reg.id}`;
    const loginUrl = `${TMS_WEBSITE}/login`;
    const statusUrl = `${TMS_WEBSITE}/registration-status?ref=${reg.id}`;

    const bodyText = this.approvalText(reg, name, loginUrl);
    const bodyHtml = this.approvalHtml(reg, name, loginUrl, statusUrl);

    return { to: reg.email, subject, bodyText, bodyHtml };
  }

  buildRejectionEmail(reg: StudentRegistration): EmailPayload {
    const name    = `${reg.firstName} ${reg.lastName}`;
    const subject = `TMS Application Update — Reference ${reg.id}`;
    const reapplyUrl = `${TMS_WEBSITE}/signup`;

    const bodyText = this.rejectionText(reg, name, reapplyUrl);
    const bodyHtml = this.rejectionHtml(reg, name, reapplyUrl);

    return { to: reg.email, subject, bodyText, bodyHtml };
  }

  /* ─────────────────────────────────────────────────────────────
     SEND ACTIONS
  ───────────────────────────────────────────────────────────── */

  /** Opens the user's default mail client via mailto: */
  sendViaMail(payload: EmailPayload): void {
    const encoded = encodeURIComponent(payload.bodyText);
    const subject = encodeURIComponent(payload.subject);
    const link = `mailto:${payload.to}?subject=${subject}&body=${encoded}`;
    window.open(link, "_blank");
  }

  /** Opens Gmail compose in a new tab with everything pre-filled */
  sendViaGmail(payload: EmailPayload): void {
    const to      = encodeURIComponent(payload.to);
    const subject = encodeURIComponent(payload.subject);
    const body    = encodeURIComponent(payload.bodyText);
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  /* ─────────────────────────────────────────────────────────────
     APPROVAL — PLAIN TEXT
  ───────────────────────────────────────────────────────────── */
  private approvalText(reg: StudentRegistration, name: string, loginUrl: string): string {
    return `Dear ${name},

Congratulations! We are delighted to inform you that your application to ${TMS_NAME} has been reviewed and APPROVED.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  APPLICATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Reference ID    : ${reg.id}
  Programme       : ${reg.desiredProgram}
  Submitted       : ${this.fmt(reg.submittedAt)}
  Decision Date   : ${this.today()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  YOUR LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Portal URL  : ${loginUrl}
  Username    : ${reg.username}
  Password    : ${reg.generatedPassword}

  IMPORTANT: Please change your password immediately after your first login.
  Keep your credentials confidential at all times.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Visit ${loginUrl}
  2. Sign in using the credentials above
  3. Complete your student profile
  4. Browse and enrol in your courses
  5. Change your password in Account Settings

${reg.adminNote ? `ADMISSION NOTE:\n"${reg.adminNote}"\n` : ""}
We are thrilled to welcome you to our learning community. Your academic journey with us starts now, and we are committed to supporting you every step of the way.

We wish you great success in your studies.

Warm regards,

Admissions Office
${TMS_NAME}
Email   : ${TMS_SUPPORT}
Phone   : ${TMS_PHONE}
Address : ${TMS_ADDRESS}
Website : ${TMS_WEBSITE}

─────────────────────────────────────────────────────────────
This email was sent to ${reg.email} regarding application ${reg.id}.
If you did not submit this application, please contact ${TMS_SUPPORT}.
─────────────────────────────────────────────────────────────
`;
  }

  /* ─────────────────────────────────────────────────────────────
     APPROVAL — HTML
  ───────────────────────────────────────────────────────────── */
  private approvalHtml(
    reg: StudentRegistration,
    name: string,
    loginUrl: string,
    statusUrl: string,
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Application Approved</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"Segoe UI",Arial,sans-serif;font-size:15px;line-height:1.6;background:#f0f4f8;color:#1e293b}
  .wrapper{max-width:620px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10)}
  /* Header */
  .header{background:linear-gradient(135deg,#4f46e5 0%,#6366f1 50%,#38bdf8 100%);padding:40px 36px 32px;text-align:center}
  .header-icon{width:72px;height:72px;background:rgba(255,255,255,.15);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,.35)}
  .header h1{color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;margin-bottom:6px}
  .header p{color:rgba(255,255,255,.85);font-size:15px}
  /* Body */
  .body{padding:36px 36px 28px}
  .greeting{font-size:17px;font-weight:700;color:#0f172a;margin-bottom:10px}
  .intro{color:#475569;margin-bottom:28px;line-height:1.7}
  /* Detail box */
  .detail-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 22px;margin-bottom:24px}
  .detail-box-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:14px}
  .detail-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f1f5f9;font-size:14px}
  .detail-row:last-child{border-bottom:none}
  .detail-label{color:#64748b;font-weight:500}
  .detail-value{color:#1e293b;font-weight:600;text-align:right}
  .badge-approved{display:inline-block;background:#dcfce7;color:#166534;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
  /* Credentials */
  .cred-section{background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #86efac;border-radius:12px;padding:22px 24px;margin-bottom:24px}
  .cred-title{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#166534;margin-bottom:16px}
  .cred-row{display:flex;align-items:center;gap:12px;margin-bottom:12px}
  .cred-icon{width:36px;height:36px;background:#16a34a;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .cred-block{flex:1}
  .cred-key{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:#4ade80;font-weight:700;margin-bottom:2px}
  .cred-val{font-family:"Courier New",monospace;font-size:16px;font-weight:800;color:#14532d;letter-spacing:.05em;background:#f0fdf4;padding:5px 10px;border-radius:6px;display:inline-block;border:1px solid #86efac}
  .cred-warning{background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:10px 14px;font-size:13px;color:#92400e;margin-top:6px;line-height:1.5}
  /* Steps */
  .steps-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;margin-bottom:14px}
  .step{display:flex;align-items:flex-start;gap:12px;margin-bottom:10px}
  .step-num{width:24px;height:24px;background:#6366f1;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;margin-top:1px}
  .step-text{font-size:14px;color:#475569;line-height:1.5;padding-top:2px}
  /* CTA */
  .cta{text-align:center;margin:28px 0}
  .cta-btn{display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff !important;text-decoration:none;border-radius:10px;font-weight:800;font-size:15px;letter-spacing:-.01em;box-shadow:0 4px 16px rgba(99,102,241,.35)}
  /* Admin note */
  .admin-note{background:#f0f9ff;border-left:4px solid #38bdf8;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:24px;font-size:14px;color:#0c4a6e;line-height:1.6}
  .admin-note-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#38bdf8;margin-bottom:6px}
  /* Closing */
  .closing{color:#475569;font-size:14px;margin-bottom:28px;line-height:1.7}
  /* Footer */
  .footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 36px;text-align:center}
  .footer-brand{font-weight:800;color:#6366f1;font-size:14px;margin-bottom:8px}
  .footer-info{color:#94a3b8;font-size:12px;line-height:1.8}
  .footer-divider{border:none;border-top:1px solid #e2e8f0;margin:16px 0}
  .footer-legal{color:#cbd5e1;font-size:11px;line-height:1.7}
</style>
</head>
<body>
<div class="wrapper">

  <!-- Header -->
  <div class="header">
    <div class="header-icon">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M5 13l4 4L19 7" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h1>Application Approved!</h1>
    <p>Congratulations — your journey begins today</p>
  </div>

  <!-- Body -->
  <div class="body">

    <p class="greeting">Dear ${name},</p>
    <p class="intro">
      We are very pleased to inform you that, after a thorough review of your application and supporting documents,
      the Admissions Committee has officially <strong>approved</strong> your registration with
      <strong>TMS Core — Training Management System</strong>.
      <br/><br/>
      Your academic file has been created and your portal account is now active.
      Please find your login credentials and next steps below.
    </p>

    <!-- Application details -->
    <div class="detail-box">
      <div class="detail-box-title">Application Details</div>
      <div class="detail-row">
        <span class="detail-label">Reference ID</span>
        <span class="detail-value" style="font-family:monospace">${reg.id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Programme</span>
        <span class="detail-value">${reg.desiredProgram}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Education Level</span>
        <span class="detail-value">${reg.educationLevel}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Submitted</span>
        <span class="detail-value">${this.fmt(reg.submittedAt)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Decision Date</span>
        <span class="detail-value">${this.today()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value"><span class="badge-approved">✓ Approved</span></span>
      </div>
    </div>

    <!-- Credentials -->
    <div class="cred-section">
      <div class="cred-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="#16a34a" stroke-width="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Your Login Credentials
      </div>
      <div class="cred-row">
        <div class="cred-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="7" r="4" stroke="#fff" stroke-width="2"/>
          </svg>
        </div>
        <div class="cred-block">
          <div class="cred-key">Username</div>
          <div class="cred-val">${reg.username}</div>
        </div>
      </div>
      <div class="cred-row">
        <div class="cred-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="#fff" stroke-width="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="cred-block">
          <div class="cred-key">Password</div>
          <div class="cred-val">${reg.generatedPassword}</div>
        </div>
      </div>
      <div class="cred-warning">
        ⚠️ <strong>Important:</strong> Please change your password immediately after your first login.
        Never share your credentials with anyone.
      </div>
    </div>

    <!-- Next steps -->
    <div class="steps-title">Next Steps</div>
    <div class="step">
      <div class="step-num">1</div>
      <div class="step-text">Click the button below to go to the TMS Portal login page</div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-text">Sign in using the username and password provided above</div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div class="step-text">Complete your student profile and upload any remaining documents</div>
    </div>
    <div class="step">
      <div class="step-num">4</div>
      <div class="step-text">Browse the course catalogue and enrol in your chosen subjects</div>
    </div>
    <div class="step">
      <div class="step-num">5</div>
      <div class="step-text">Change your temporary password in <em>Account Settings → Security</em></div>
    </div>

    <!-- CTA -->
    <div class="cta">
      <a href="${loginUrl}" class="cta-btn">Sign In to TMS Portal →</a>
    </div>

    ${reg.adminNote ? `
    <!-- Admin note -->
    <div class="admin-note">
      <div class="admin-note-label">📋 Note from the Admissions Office</div>
      ${reg.adminNote}
    </div>` : ""}

    <!-- Closing -->
    <p class="closing">
      We warmly welcome you to the TMS Core learning community. Our dedicated faculty and support staff
      are here to help you achieve your academic goals. Should you have any questions or require assistance,
      please do not hesitate to reach out to us at
      <a href="mailto:${TMS_SUPPORT}" style="color:#6366f1;font-weight:600">${TMS_SUPPORT}</a>.
      <br/><br/>
      Wishing you a successful and rewarding academic journey ahead.
      <br/><br/>
      <strong>With warm congratulations,</strong><br/>
      The Admissions Office<br/>
      <em>${TMS_NAME}</em>
    </p>

  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-brand">${TMS_NAME}</div>
    <div class="footer-info">
      📧 ${TMS_SUPPORT} &nbsp;|&nbsp; 📞 ${TMS_PHONE}<br/>
      📍 ${TMS_ADDRESS}<br/>
      🌐 <a href="${TMS_WEBSITE}" style="color:#6366f1">${TMS_WEBSITE}</a>
    </div>
    <hr class="footer-divider"/>
    <div class="footer-legal">
      This message was sent to ${reg.email} regarding application reference ${reg.id}.<br/>
      If you did not submit this application, please contact us immediately at ${TMS_SUPPORT}.<br/>
      © ${new Date().getFullYear()} TMS Core. All rights reserved.
    </div>
  </div>

</div>
</body>
</html>`;
  }

  /* ─────────────────────────────────────────────────────────────
     REJECTION — PLAIN TEXT
  ───────────────────────────────────────────────────────────── */
  private rejectionText(reg: StudentRegistration, name: string, reapplyUrl: string): string {
    return `Dear ${name},

Thank you sincerely for your interest in joining ${TMS_NAME} and for taking the time to submit your application.

After careful and thorough review of your application (Reference: ${reg.id}), we regret to inform you that we are unable to offer you a place in the programme at this time.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  APPLICATION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Reference ID    : ${reg.id}
  Programme       : ${reg.desiredProgram}
  Submitted       : ${this.fmt(reg.submittedAt)}
  Decision Date   : ${this.today()}
  Decision        : Not Approved

${reg.adminNote ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  REASON FOR DECISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ${reg.adminNote}

` : ""}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WHAT YOU CAN DO NEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Review the reason noted above and address the identified issue(s)
  2. Gather any missing or updated documentation
  3. Submit a fresh application at: ${reapplyUrl}
  4. Contact our admissions team for personalised guidance:
     Email: ${TMS_SUPPORT}
     Phone: ${TMS_PHONE}

We recognise that receiving this news may be disappointing, and we genuinely appreciate the effort you invested in your application. This decision is not a reflection of your potential — we encourage you to address the feedback and reapply.

Our admissions office remains available to answer your questions and to guide you through the process for a future application.

We sincerely wish you the very best in your endeavours.

Respectfully yours,

Admissions Office
${TMS_NAME}
Email   : ${TMS_SUPPORT}
Phone   : ${TMS_PHONE}
Address : ${TMS_ADDRESS}
Website : ${TMS_WEBSITE}

─────────────────────────────────────────────────────────────
This email was sent to ${reg.email} regarding application ${reg.id}.
If you have questions, please contact ${TMS_SUPPORT}.
─────────────────────────────────────────────────────────────
`;
  }

  /* ─────────────────────────────────────────────────────────────
     REJECTION — HTML
  ───────────────────────────────────────────────────────────── */
  private rejectionHtml(reg: StudentRegistration, name: string, reapplyUrl: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Application Update</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"Segoe UI",Arial,sans-serif;font-size:15px;line-height:1.6;background:#f0f4f8;color:#1e293b}
  .wrapper{max-width:620px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10)}
  .header{background:linear-gradient(135deg,#334155 0%,#475569 100%);padding:40px 36px 32px;text-align:center}
  .header-icon{width:72px;height:72px;background:rgba(255,255,255,.12);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,.25)}
  .header h1{color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:6px}
  .header p{color:rgba(255,255,255,.75);font-size:15px}
  .body{padding:36px 36px 28px}
  .greeting{font-size:17px;font-weight:700;color:#0f172a;margin-bottom:10px}
  .intro{color:#475569;margin-bottom:28px;line-height:1.7}
  .detail-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 22px;margin-bottom:24px}
  .detail-box-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:14px}
  .detail-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f1f5f9;font-size:14px}
  .detail-row:last-child{border-bottom:none}
  .detail-label{color:#64748b;font-weight:500}
  .detail-value{color:#1e293b;font-weight:600;text-align:right}
  .badge-rejected{display:inline-block;background:#fee2e2;color:#991b1b;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
  .reason-box{background:#fff7ed;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:16px 18px;margin-bottom:24px}
  .reason-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#c2410c;margin-bottom:8px}
  .reason-text{font-size:14px;color:#431407;line-height:1.7}
  .next-box{background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px 22px;margin-bottom:24px}
  .next-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#0284c7;margin-bottom:14px;display:flex;align-items:center;gap:6px}
  .next-step{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;font-size:14px;color:#475569}
  .next-num{width:22px;height:22px;background:#0ea5e9;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;margin-top:1px}
  .encouragement{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px 20px;margin-bottom:24px;font-size:14px;color:#14532d;line-height:1.7}
  .cta{text-align:center;margin:24px 0}
  .cta-btn{display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#0ea5e9,#0284c7);color:#ffffff !important;text-decoration:none;border-radius:10px;font-weight:800;font-size:14px;letter-spacing:-.01em;box-shadow:0 4px 14px rgba(14,165,233,.30)}
  .closing{color:#475569;font-size:14px;margin-bottom:28px;line-height:1.7}
  .footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 36px;text-align:center}
  .footer-brand{font-weight:800;color:#475569;font-size:14px;margin-bottom:8px}
  .footer-info{color:#94a3b8;font-size:12px;line-height:1.8}
  .footer-divider{border:none;border-top:1px solid #e2e8f0;margin:16px 0}
  .footer-legal{color:#cbd5e1;font-size:11px;line-height:1.7}
</style>
</head>
<body>
<div class="wrapper">

  <!-- Header -->
  <div class="header">
    <div class="header-icon">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M12 8v4m0 4h.01" stroke="rgba(255,255,255,.9)" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.9)" stroke-width="2"/>
      </svg>
    </div>
    <h1>Application Status Update</h1>
    <p>Regarding your registration — Ref: ${reg.id}</p>
  </div>

  <!-- Body -->
  <div class="body">

    <p class="greeting">Dear ${name},</p>
    <p class="intro">
      Thank you sincerely for your interest in joining <strong>TMS Core — Training Management System</strong>
      and for the time and effort you invested in submitting your application.
      <br/><br/>
      After a careful and thorough review by our Admissions Committee, we regret to inform you that
      we are <strong>unable to offer you a place</strong> in the requested programme at this time.
      We understand this may be disappointing news, and we want to assure you that
      this decision was made with great care and consideration.
    </p>

    <!-- Application summary -->
    <div class="detail-box">
      <div class="detail-box-title">Application Summary</div>
      <div class="detail-row">
        <span class="detail-label">Reference ID</span>
        <span class="detail-value" style="font-family:monospace">${reg.id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Programme Applied</span>
        <span class="detail-value">${reg.desiredProgram}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date Submitted</span>
        <span class="detail-value">${this.fmt(reg.submittedAt)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Decision Date</span>
        <span class="detail-value">${this.today()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Decision</span>
        <span class="detail-value"><span class="badge-rejected">Not Approved</span></span>
      </div>
    </div>

    ${reg.adminNote ? `
    <!-- Reason -->
    <div class="reason-box">
      <div class="reason-label">📋 Reason for Decision</div>
      <div class="reason-text">${reg.adminNote}</div>
    </div>` : ""}

    <!-- What to do next -->
    <div class="next-box">
      <div class="next-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        What You Can Do Next
      </div>
      <div class="next-step"><div class="next-num">1</div><span>Review the reason stated above and address the identified gaps</span></div>
      <div class="next-step"><div class="next-num">2</div><span>Collect updated or missing documents (transcripts, IDs, certificates)</span></div>
      <div class="next-step"><div class="next-num">3</div><span>Submit a new application once the issues have been resolved</span></div>
      <div class="next-step"><div class="next-num">4</div><span>Contact our Admissions Office for personalised guidance before reapplying</span></div>
    </div>

    <!-- Encouragement -->
    <div class="encouragement">
      💚 <strong>A message from our team:</strong><br/>
      This decision does not define your potential or your future. Many successful students
      have overcome initial setbacks to go on to achieve remarkable things. We genuinely encourage
      you to address the feedback, strengthen your application, and try again.
      Our team is here to support you through that process.
    </div>

    <!-- CTA -->
    <div class="cta">
      <a href="${reapplyUrl}" class="cta-btn">Submit a New Application →</a>
    </div>

    <!-- Closing -->
    <p class="closing">
      For any questions, clarifications, or guidance, please feel free to contact our Admissions Office
      at <a href="mailto:${TMS_SUPPORT}" style="color:#0284c7;font-weight:600">${TMS_SUPPORT}</a>
      or call us on <strong>${TMS_PHONE}</strong>.
      We are committed to helping you find your path forward.
      <br/><br/>
      We thank you once more for your interest and wish you every success in your future endeavours.
      <br/><br/>
      <strong>Respectfully yours,</strong><br/>
      The Admissions Office<br/>
      <em>${TMS_NAME}</em>
    </p>

  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-brand">${TMS_NAME}</div>
    <div class="footer-info">
      📧 ${TMS_SUPPORT} &nbsp;|&nbsp; 📞 ${TMS_PHONE}<br/>
      📍 ${TMS_ADDRESS}<br/>
      🌐 <a href="${TMS_WEBSITE}" style="color:#475569">${TMS_WEBSITE}</a>
    </div>
    <hr class="footer-divider"/>
    <div class="footer-legal">
      This message was sent to ${reg.email} regarding application reference ${reg.id}.<br/>
      If you have any questions, please contact us at ${TMS_SUPPORT}.<br/>
      © ${new Date().getFullYear()} TMS Core. All rights reserved.
    </div>
  </div>

</div>
</body>
</html>`;
  }

  /* ── Date helpers ────────────────────────────────────────────── */
  private fmt(iso: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  private today(): string {
    return new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
  }
}
