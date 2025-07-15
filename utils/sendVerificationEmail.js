import nodemailer from "nodemailer";

const sendVerificationEmail = async (to, code) => {
  const verificationUrl = `http://localhost:3000/verify-email?code=${code}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "abdammar2023@gmail.com", // 
      pass: "aeqe ygwo iqju ymtz",        
    },
  });

  await transporter.sendMail({
    from: `"Support Team" <yourtestingemail@gmail.com>`,
    to,
    subject: "تأكيد البريد الإلكتروني",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>رمز التحقق الخاص بك</h2>
        <p>يرجى إدخال الكود التالي:</p>
        <h3 style="color: #FF6F61">${code}</h3>
        <p>أو اضغط على الرابط لتأكيد بريدك:</p>
        <a href="${verificationUrl}" target="_blank">${verificationUrl}</a>
        <p style="font-size: 12px; color: gray;">هذا الرابط صالح لمدة 5 دقائق.</p>
      </div>
    `,
  });

  console.log(`📧 تم إرسال كود التحقق إلى ${to}`);
};

export default sendVerificationEmail;
