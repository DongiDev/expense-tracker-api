const { sendEmail } = require('./utils/emailService');

async function test() {
    console.log("กำลังพยายามส่งเมล...");
    await sendEmail('test@example.com', 'ทดสอบระบบ', 'นี่คือรหัส OTP ของคุณ: 123456');
}

test();