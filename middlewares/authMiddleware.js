// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. ดึง Token จาก Header (ที่ชื่อ Authorization)
    const authHeader = req.headers['authorization'];
    // ปกติ Token จะมาในรูปแบบ "Bearer <token>" เราต้องตัดคำว่า Bearer ออก
    const token = authHeader && authHeader.split(' ')[1];

    // 2. ถ้าไม่มี Token -> ไล่กลับไป
    if (!token) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนครับ (No Token)' });

    try {
        // 3. ตรวจสอบ Token (ด้วยกุญแจลับจาก .env)
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. ถ้าผ่าน -> แปะข้อมูล User ID ไว้ใน req ให้คนถัดไปใช้
        req.user = verified; 
        next(); // อนุญาตให้ไปต่อได้
    } catch (err) {
        res.status(400).json({ message: 'Token ไม่ถูกต้อง หรือหมดอายุแล้ว' });
    }
};