// ...existing code...
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user:  "maizaaymena@gmail.com",
        pass: "llde fpxv gbui lgtr" // replace with env var in production
    },
    tls: { rejectUnauthorized: false },
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transport.sendMail({
      from: '"Aymen Maiza" <' + (process.env.EMAIL_USER || "maizaaymena@gmail.com") + ">",
      to,
      subject,
      text,
      html,
    });
    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
// ...existing code...