// controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// ... (ฟังก์ชัน register เดิม) ...

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