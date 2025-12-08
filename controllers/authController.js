// controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService'); // <--- 1. เพิ่มบรรทัดนี้

// ฟังก์ชันสมัครสมาชิก
exports.register = async (req, res) => {
    try {
        // 1. รับค่าจากหน้าบ้าน
        const { email, password, name } = req.body;

        // 2. เช็คว่าอีเมลนี้เคยสมัครหรือยัง? (Prisma สั่งง่ายๆ แบบนี้เลย)
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้วครับ" });
        }

        // 3. เข้ารหัสรหัสผ่าน (เพื่อความปลอดภัย)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. บันทึกลง Database
        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword, // บันทึกรหัสลับแทนรหัสจริง
                name: name
            }
        });

        // 5. ส่งผลลัพธ์กลับ (ไม่ควรส่ง password กลับไปนะ)
        res.status(201).json({
            message: "สมัครสมาชิกสำเร็จ!",
            user: { id: newUser.id, email: newUser.email, name: newUser.name }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

    
};

// ฟังก์ชันเข้าสู่ระบบ
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. ค้นหา User ด้วยอีเมล
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        // 2. ถ้าไม่เจอ User หรือ รหัสผ่านผิด (ใช้ bcrypt เช็ค)
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }

        // 3. สร้าง JWT Token (บัตรผ่าน)
        const token = jwt.sign(
            { userId: user.id },       // ข้อมูลที่จะฝังในบัตร
            process.env.JWT_SECRET,    // กุญแจลับจาก .env
            { expiresIn: '1h' }        // บัตรหมดอายุใน 1 ชั่วโมง
        );

        // 4. ส่ง Token กลับไปให้ลูกค้า
        res.json({
            message: "เข้าสู่ระบบสำเร็จ!",
            token: token,
            user: { id: user.id, name: user.name }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// ฟังก์ชันลืมรหัสผ่าน
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // A. เช็คว่ามีอีเมลนี้ในระบบไหม
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบครับ" });
        }

        // B. สุ่มรหัส OTP 6 หลัก (100000 - 999999)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // C. ตั้งเวลาหมดอายุ (อีก 15 นาที)
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        // D. บันทึกลง Database
        await prisma.user.update({
            where: { email: email },
            data: {
                resetToken: otp,
                resetTokenExpiry: expiry
            }
        });

        // E. ส่งอีเมล
        await sendEmail(email, 'รหัส OTP สำหรับรีเซ็ตรหัสผ่าน', `รหัส OTP ของคุณคือ: ${otp} (มีอายุ 15 นาที)`);

        res.json({ message: "ส่งรหัส OTP ไปที่อีเมลแล้วครับ กรุณาเช็ค Inbox" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. เพิ่มฟังก์ชันรีเซ็ตรหัสผ่าน
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // A. ค้นหา User จากอีเมล
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        // B. ตรวจสอบเงื่อนไข 3 อย่าง
        // 1. มี User ไหม?
        // 2. รหัส OTP ตรงกับใน Database ไหม?
        // 3. รหัส OTP หมดอายุหรือยัง?
        if (!user || user.resetToken !== otp || user.resetTokenExpiry < new Date()) {
            return res.status(400).json({ message: "รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้วครับ" });
        }

        // C. เข้ารหัสรหัสผ่านใหม่ (สำคัญมาก!)
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // D. อัปเดตข้อมูลลง Database
        await prisma.user.update({
            where: { email: email },
            data: {
                password: hashedPassword, // เปลี่ยนเป็นรหัสใหม่
                resetToken: null,         // ลบ OTP ทิ้ง (ใช้แล้วทิ้ง)
                resetTokenExpiry: null    // ลบเวลาหมดอายุทิ้ง
            }
        });

        res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสใหม่" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};