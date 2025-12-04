require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); // 1. เรียกใช้ http ของ Node.js
const { Server } = require('socket.io'); // 2. เรียกใช้ Socket.io

const app = express();
const server = http.createServer(app); // 3. สร้าง Server ที่ห่อ Express ไว้

// 4. ตั้งค่า Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // ยอมรับการเชื่อมต่อจากทุกที่ (สำหรับ Dev)
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// 5. ฝากตัวแปร io ไว้ใน req เพื่อให้ Controller เรียกใช้ได้
app.use((req, res, next) => {
    req.io = io;
    next();
});

// ตรวจสอบว่ามีคนเชื่อมต่อ Socket เข้ามาไหม
io.on('connection', (socket) => {
    console.log('✨ มีคนเชื่อมต่อ Socket เข้ามาครับ ID:', socket.id);

    socket.on('disconnect', () => {
        console.log('❌ คนนั้นหลุดการเชื่อมต่อแล้ว');
    });
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const transactionRoutes = require('./routes/transactionRoutes');
app.use('/api/transactions', transactionRoutes);

// เปิด Server (เปลี่ยนจาก app.listen เป็น server.listen)
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server + Socket.io running on port ${PORT}`);
});