// controllers/transactionController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// เพิ่มรายการใหม่
exports.addTransaction = async (req, res) => {
    try {
        const { type, amount, category, description } = req.body;
        
        // ** ทีเด็ดอยู่ตรงนี้: ดึง ID คนที่ล็อกอินมาจาก Token **
        const userId = req.user.userId; 

        const newTx = await prisma.transaction.create({
            data: {
                type: type,         // 'INCOME' หรือ 'EXPENSE'
                amount: parseFloat(amount), // แปลงเป็นทศนิยมกันเหนียว
                category: category,
                description: description,
                userId: userId      // ผูกกับ User คนนี้
            }
        });

        req.io.emit('new_transaction', { message: "มีรายการใหม่จ้า!", data: newTx });
        res.status(201).json({ message: "บันทึกสำเร็จ!", data: newTx });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ดึงรายการทั้งหมด (เฉพาะของ User คนนี้)
exports.getMyTransactions = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const transactions = await prisma.transaction.findMany({
            where: { userId: userId }, // ค้นหาเฉพาะของฉัน
            orderBy: { date: 'desc' }  // เรียงจากใหม่ไปเก่า
        });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... (โค้ดเดิมของคุณอยู่ด้านบน)

// แก้ไขรายการ
exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.params; // รับ ID รายการที่จะแก้จาก URL
        const { type, amount, category, description } = req.body;
        const userId = req.user.userId || req.user.id; // ดักไว้ทั้ง 2 แบบ

        // 1. เช็คก่อนว่ารายการนี้เป็นของ User คนนี้จริงไหม? (ป้องกันการแก้ข้อมูลคนอื่น)
        const existingTx = await prisma.transaction.findFirst({
            where: { id: Number(id), userId: userId }
        });

        if (!existingTx) {
            return res.status(404).json({ message: "ไม่พบรายการ หรือคุณไม่มีสิทธิ์แก้ไข" });
        }

        // 2. ถ้าเจอ ก็สั่งอัปเดตเลย
        const updatedTx = await prisma.transaction.update({
            where: { id: Number(id) },
            data: {
                type,
                amount: parseFloat(amount),
                category,
                description
            }
        });

        res.json({ message: "แก้ไขสำเร็จ", data: updatedTx });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ลบรายการ
exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId || req.user.id;

        // 1. เช็คความเป็นเจ้าของก่อนลบ
        const existingTx = await prisma.transaction.findFirst({
            where: { id: Number(id), userId: userId }
        });

        if (!existingTx) {
            return res.status(404).json({ message: "ไม่พบรายการ หรือคุณไม่มีสิทธิ์ลบ" });
        }

        // 2. ลบโลด
        await prisma.transaction.delete({
            where: { id: Number(id) }
        });

        res.json({ message: "ลบรายการสำเร็จแล้ว" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

