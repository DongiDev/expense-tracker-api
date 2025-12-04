// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware'); // เรียกยามมา

// ต้องผ่านยาม (authMiddleware) ก่อน ถึงจะเข้าไปทำรายการได้
router.post('/', authMiddleware, transactionController.addTransaction);
router.get('/', authMiddleware, transactionController.getMyTransactions);
router.put('/:id', authMiddleware, transactionController.updateTransaction); // เพิ่มบรรทัดนี้
router.delete('/:id', authMiddleware, transactionController.deleteTransaction); // เพิ่มบรรทัดนี้

module.exports = router;