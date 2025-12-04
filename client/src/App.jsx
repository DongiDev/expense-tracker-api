import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3000");

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [transactions, setTransactions] = useState([]);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [form, setForm] = useState({ type: "EXPENSE", amount: "", category: "", description: "" });

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const amt = Number(tx.amount) || 0;
        if (tx.type === "INCOME") {
          acc.income += amt;
        } else {
          acc.expense += amt;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const balance = summary.income - summary.expense;
  const highlightCategories = useMemo(() => {
    const names = transactions.slice(0, 6).map((tx) => tx.category).filter(Boolean);
    return Array.from(new Set(names));
  }, [transactions]);

  useEffect(() => {
    if (token) {
      fetchTransactions();
      socket.on("new_transaction", (payload) => {
        // แจ้งเตือนสวยๆ (ถ้าใช้ Library อื่นแทน alert จะดีมาก แต่นี้เอาแบบง่ายก่อน)
        setTransactions((prev) => [payload.data, ...prev]);
      });
    }
    return () => {
      socket.off("new_transaction");
    };
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert("Login พลาด: " + err.response.data.message);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/transactions", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ ...form, amount: "", description: "" });
    } catch (err) {
      alert("บันทึกไม่ผ่าน: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setTransactions([]);
  };

  // ฟังก์ชันจัดรูปแบบเงิน (ใส่ลูกน้ำ)
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // --- ส่วน Login (หน้าตาใหม่) ---
  if (!token) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h1>🔐 Welcome Back</h1>
          <p>เข้าสู่ระบบบันทึกรายรับ-รายจ่าย</p>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="glow-on-hover">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  // --- ส่วน Dashboard (หน้าตาใหม่) ---
  return (
    <div className="app-wrapper">
      <div className="bg-ornaments">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
      </div>
      <nav className="top-nav">
        <div className="nav-left">
          <div className="brand-mark">ET</div>
          <div>
            <p className="nav-eyebrow">Expense Tracker</p>
            <h1 className="nav-title">Control the flow</h1>
          </div>
        </div>
        <div className="nav-actions">
          <button className="nav-btn subtle">Dashboard</button>
          <button className="nav-btn subtle">Analytics</button>
          <button className="nav-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="main-container">
        <div className="header">
          <div className="title-group">
            <h1>💸 My Wallet</h1>
            <span className="status-badge">● Online</span>
          </div>
        </div>

        <div className="hero-card glass-effect dark-panel">
          <div>
            <p className="eyebrow">Personal finance snapshot</p>
            <h2>ควบคุมรายรับรายจ่ายได้อย่างมั่นใจ</h2>
            <p className="hero-sub">อัปเดตแบบเรียลไทม์ และแจ้งเตือนทุกครั้งที่มีการเพิ่มรายการใหม่</p>
            <div className="chip-row">
              {highlightCategories.length === 0 ? (
                <span className="pill">ยังไม่มีหมวดหมู่</span>
              ) : (
                highlightCategories.map((name) => (
                  <span key={name} className="pill">#{name}</span>
                ))
              )}
            </div>
          </div>
          <div className="hero-badge">
            <div className="pulse" />
            <span>Realtime feed</span>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card gradient-blue">
            <p>ยอดคงเหลือ</p>
            <h3>{balance >= 0 ? "+" : "-"}{Math.abs(balance).toLocaleString()}</h3>
            <small>รวมรายรับหักรายจ่าย</small>
          </div>
          <div className="summary-card gradient-green">
            <p>รายรับ</p>
            <h3>+{summary.income.toLocaleString()}</h3>
            <small>สะสมทั้งหมด</small>
          </div>
          <div className="summary-card gradient-pink">
            <p>รายจ่าย</p>
            <h3>-{summary.expense.toLocaleString()}</h3>
            <small>ใช้จ่ายไปแล้ว</small>
          </div>
        </div>

        <div className="card glass-effect">
          <h3>✨ เพิ่มรายการใหม่</h3>
          <form onSubmit={handleSubmit} className="add-form">
            <div className="form-group">
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="INCOME">รายรับ (+)</option>
                    <option value="EXPENSE">รายจ่าย (-)</option>
                </select>
                <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
            </div>
            <input type="text" placeholder="หมวดหมู่ (เช่น อาหาร, เดินทาง)" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
            <input type="text" placeholder="รายละเอียดเพิ่มเติม..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <button type="submit" className="save-btn">บันทึกข้อมูล</button>
          </form>
        </div>

        <div className="transaction-list">
          <h3>📜 รายการล่าสุด</h3>
          {transactions.length === 0 ? <p className="empty-state">ยังไม่มีรายการ...</p> : null}
          
          {transactions.map((tx) => (
            <div key={tx.id} className={`transaction-item ${tx.type === 'INCOME' ? 'income-border' : 'expense-border'}`}>
              <div className="tx-info">
                <div className="tx-category">{tx.category}</div>
                <div className="tx-desc">{tx.description}</div>
                <div className="tx-date">{new Date(tx.date).toLocaleDateString('th-TH')}</div>
              </div>
              <div className={`tx-amount ${tx.type === 'INCOME' ? 'text-green' : 'text-red'}`}>
                {tx.type === 'INCOME' ? '+' : '-'}{formatNumber(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
