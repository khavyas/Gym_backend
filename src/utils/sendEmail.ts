const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
  try {
    const msg = {
      to: options.to,
      from: process.env.EMAIL_FROM, // must match your verified sender
      subject: options.subject,
      html: options.html,
    };

    const info = await sgMail.send(msg);
    console.log("✅ Email sent successfully via SendGrid:", info[0].statusCode);
    return info;
  } catch (error) {
    console.error("❌ Error sending email via SendGrid:", error.message);
    if (error.response) {
      console.error("Response:", error.response.body);
    }
    throw new Error("Email sending failed: " + error.message);
  }
};

module.exports = sendEmail;





// const nodemailer = require('nodemailer');

// const sendEmail = async (options) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: `"MyApp Support" <${process.env.EMAIL_USER}>`,
//       to: options.to,
//       subject: options.subject,
//       html: options.html,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent successfully:", info.response);
//     return info;

//   } catch (error) {
//     console.error("❌ Error sending email:", error.message);
//     throw new Error("Email sending failed: " + error.message);
//   }
// };

// module.exports = sendEmail;
