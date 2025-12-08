# 💰 Expense Tracker (Real-time Web App)

ระบบบันทึกรายรับ-รายจ่ายออนไลน์ พัฒนาด้วย Node.js และ MySQL พร้อมระบบแจ้งเตือน Real-time และ Dashboard สรุปยอดเงิน

![Project Status](https://img.shields.io/badge/Status-Completed-success)

## ✨ ฟีเจอร์หลัก (Features)
* **Authentication:** ระบบสมัครสมาชิกและเข้าสู่ระบบ (Secure Login)
* **JWT Security:** ยืนยันตัวตนด้วย JSON Web Token
* **Real-time Update:** แจ้งเตือนรายการใหม่ทันทีโดยไม่ต้องรีเฟรชหน้า (Socket.io)
* **Data Visualization:** กราฟโดนัทสรุปค่าใช้จ่ายแยกหมวดหมู่ (Chart.js)
* **Glassmorphism UI:** ดีไซน์ทันสมัย สบายตา
* **Responsive:** ใช้งานได้ดีบนหน้าจอคอมพิวเตอร์

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
* **Backend:** Node.js, Express
* **Database:** MySQL, Prisma ORM
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
* **Tools:** Socket.io, bcryptjs, SweetAlert2, Chart.js

## 🚀 วิธีติดตั้งและรันโปรเจกต์ (Installation)

1. **ทำการ Clone โปรเจกต์ลงเครื่องก่อน**
   (อย่าลืมเปลี่ยน `your-username` เป็นชื่อ GitHub ของคุณ)
```bash
git clone [https://github.com/your-username/expense-tracker-api.git](https://github.com/your-username/expense-tracker-api.git);

## ติดตั้ง Dependencies ที่ต้องใช้ (ใน Terminal)
npm install

## ตั้งค่า Database (.env) สร้างไฟล์ .env และใส่ค่าดังนี้
DATABASE_URL="mysql://root:password@localhost:3306/expense_tracker"
JWT_SECRET="your_secret_key"

## สร้างตารางใน Database (ใน Terminal)
npx prisma migrate dev --name init

## รัน Server (ใน Terminal)
npx run dev

Developed by [DongiDev]