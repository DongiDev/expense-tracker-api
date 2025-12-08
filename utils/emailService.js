// utils/emailService.js
const nodemailer = require('nodemailer');

// ฟังก์ชันสำหรับส่งอีเมล
exports.sendEmail = async (to, subject, text) => {
    // 1. สร้างบัญชีทดสอบ (Ethereal) อัตโนมัติ
    // (เฉพาะตอน Dev นะครับ ถ้าขึ้น Production ค่อยเปลี่ยนเป็น Gmail)
    let testAccount = await nodemailer.createTestAccount();

    // 2. ตั้งค่า "บุรุษไปรษณีย์" (Transporter)
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, 
        auth: {
            user: testAccount.user, // User ทดสอบที่สร้างตะกี้
            pass: testAccount.pass  // Pass ทดสอบ
        }
    });

    // 3. เริ่มส่งจดหมาย
    let info = await transporter.sendMail({
        from: '"Expense Tracker System" <no-reply@expenseapp.com>', // ผู้ส่ง
        to: to, // ผู้รับ (อีเมลของ User)
        subject: subject, // หัวข้อ
        text: text, // เนื้อหา (Text ธรรมดา)
        html: `<b>${text}</b>` // เนื้อหา (HTML ตัวหนา)
    });

    console.log("ส่งเมลเรียบร้อยแล้วครับ! ✅");
    console.log("Message sent: %s", info.messageId);
    
    // *** ไฮไลท์อยู่ตรงนี้ ***
    // มันจะปริ้นท์ลิงก์ออกมา ให้เรากดเข้าไปดูหน้าตาอีเมลได้เลย
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};