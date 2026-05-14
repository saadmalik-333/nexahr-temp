import nodemailer from 'nodemailer';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendApprovalEmail(data: {
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  department: string;
  joinDate: string;
}) {
  try {
    await transporter.sendMail({
      from: `"NexaHR" <${process.env.GMAIL_USER}>`,
      to: data.email,
      subject: '🎉 Congratulations! Your NexaHR Application is Approved',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1729; color: #f0f4ff; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #3b82f6, #06b6d4); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🎉 Welcome to NexaHR!</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px; line-height: 1.6;">Dear <strong>${data.name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6;">We are pleased to inform you that your application has been <span style="color: #10b981; font-weight: 600;">approved</span>!</p>
            
            <div style="background: #0a0f1e; border: 1px solid #1e2d4a; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="margin: 0 0 16px 0; color: #3b82f6;">Your Employee Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #8b9cc8;">Employee ID</td><td style="padding: 8px 0; font-weight: 600;">${data.employeeId}</td></tr>
                <tr><td style="padding: 8px 0; color: #8b9cc8;">Designation</td><td style="padding: 8px 0;">${data.designation}</td></tr>
                <tr><td style="padding: 8px 0; color: #8b9cc8;">Department</td><td style="padding: 8px 0;">${data.department}</td></tr>
                <tr><td style="padding: 8px 0; color: #8b9cc8;">Join Date</td><td style="padding: 8px 0;">${data.joinDate}</td></tr>
              </table>
            </div>

            <h3 style="color: #3b82f6;">Access Your Employee Portal</h3>
            <ol style="font-size: 14px; line-height: 2; color: #8b9cc8;">
              <li>Visit: <a href="${APP_URL}/portal/login" style="color: #3b82f6;">${APP_URL}/portal/login</a></li>
              <li>Enter your Employee ID: <strong style="color: #f0f4ff;">${data.employeeId}</strong></li>
              <li>Enter your registered email: <strong style="color: #f0f4ff;">${data.email}</strong></li>
            </ol>

            <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">Welcome to the NexaHR family!</p>
            <p style="font-size: 14px; color: #8b9cc8;">Best regards,<br/>NexaHR Management Team</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send approval email:', error);
    return { success: false, error };
  }
}

export async function sendRejectionEmail(data: {
  name: string;
  email: string;
}) {
  try {
    await transporter.sendMail({
      from: `"NexaHR" <${process.env.GMAIL_USER}>`,
      to: data.email,
      subject: 'NexaHR Application Update',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1729; color: #f0f4ff; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e2d4a, #0f1729); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;  color: #00C0FF ; font-weight: 700;">NexaHR</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px; line-height: 1.6;">Dear <strong>${data.name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6;">Thank you for your interest in joining our organization.</p>
            <p style="font-size: 16px; line-height: 1.6;">After careful review, we regret to inform you that your application has not been approved at this time.</p>
            <p style="font-size: 16px; line-height: 1.6;">We appreciate the time you took to apply and wish you the best in your future endeavors.</p>
            <p style="font-size: 14px; color: #8b9cc8; margin-top: 24px;">Best regards,<br/>NexaHR Management Team</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send rejection email:', error);
    return { success: false, error };
  }
}