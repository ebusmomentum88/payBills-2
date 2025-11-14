const API = "https://paymomentbackend.onrender.com/api";
let token = localStorage.getItem("token");

// -------- AUTH ELEMENTS --------
const authSection = document.getElementById("auth-section");
const dashboard = document.getElementById("dashboard");
const authBtn = document.getElementById("authBtn");
const switchAuth = document.getElementById("switchAuth");
const authTitle = document.getElementById("authTitle");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const logoutBtn = document.getElementById("logoutBtn");
let isLogin = true;

// Hide dashboard & logout initially
dashboard.style.display = "none";
logoutBtn.style.display = "none";

// Show dashboard if token exists
if (token) showDashboard();

// -------- SWITCH LOGIN/SIGNUP --------
switchAuth.onclick = (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  authTitle.innerText = isLogin ? "Login" : "Sign Up";
  authBtn.innerText = isLogin ? "Login" : "Sign Up";
  nameInput.style.display = isLogin ? "none" : "block";
  document.getElementById("toggleAuth").innerHTML = isLogin
    ? 'No account? <a href="#" id="switchAuth">Sign Up</a>'
    : 'Already have an account? <a href="#" id="switchAuth">Login</a>';
  document.getElementById("switchAuth").onclick = switchAuth.onclick;
};

// -------- LOGIN / SIGNUP --------
authBtn.onclick = async () => {
  let email = emailInput.value.trim().toLowerCase(); // normalize
  const password = passwordInput.value.trim();
  const name = nameInput.value.trim();

  if (!email || !password || (!isLogin && !name)) {
    alert("Please fill all fields");
    return;
  }

  const endpoint = isLogin ? "/auth/login" : "/auth/signup";
  const body = isLogin ? { email, password } : { name, email, phone: "", password };

  try {
    const res = await fetch(`${API}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      showDashboard();
    } else {
      alert(data.message || "Action completed");
    }
  } catch (err) {
    alert("Connection error");
    console.error(err);
  }
};

// -------- SHOW DASHBOARD --------
async function showDashboard() {
  authSection.style.display = "none";
  dashboard.style.display = "block";
  logoutBtn.style.display = "inline-block";
  await updateBalance();
}

// -------- LOGOUT --------
logoutBtn.onclick = () => {
  localStorage.clear();
  dashboard.style.display = "none";
  logoutBtn.style.display = "none";
  authSection.style.display = "block";
};

// -------- UPDATE BALANCE --------
async function updateBalance() {
  if (!localStorage.getItem("token")) return;
  try {
    const res = await fetch(`${API}/user/balance`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById("balance").innerText = `Balance: ₦${data.balance}`;
      document.getElementById("balance").style.display = "block";
    }
  } catch (err) {
    console.error(err);
  }
}

// -------- PAYSTACK DEPOSIT & SERVICES --------
// Keep your existing deposit, services, and payment code here
// Add a check: if (!token) { alert("Login first"); return; }













