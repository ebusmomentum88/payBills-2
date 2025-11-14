const API = "https://paymomentbackend.onrender.com/api";
let token = localStorage.getItem("token");

// AUTH ELEMENTS
const authSection = document.getElementById("auth-section");
const dashboard = document.getElementById("dashboard");
const authBtn = document.getElementById("authBtn");
const switchAuth = document.getElementById("switchAuth");
const authTitle = document.getElementById("authTitle");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const logoutBtn = document.getElementById("logoutBtn");
const balanceEl = document.getElementById("balance");

let isLogin = true;

// Hide dashboard & logout initially
dashboard.style.display = "none";
logoutBtn.style.display = "none";
balanceEl.style.display = "none";

// Show dashboard if token exists
if (token) showDashboard();

// SWITCH LOGIN/SIGNUP
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

// LOGIN / SIGNUP
authBtn.onclick = async () => {
  let email = emailInput.value.trim().toLowerCase();
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
      body: JSON.stringify(body)
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

// SHOW DASHBOARD
async function showDashboard() {
  authSection.style.display = "none";
  dashboard.style.display = "block";
  logoutBtn.style.display = "inline-block";
  balanceEl.style.display = "block";
  await updateBalance();
}

// LOGOUT
logoutBtn.onclick = () => {
  localStorage.clear();
  dashboard.style.display = "none";
  logoutBtn.style.display = "none";
  balanceEl.style.display = "none";
  authSection.style.display = "block";
};

// UPDATE BALANCE
async function updateBalance() {
  if (!localStorage.getItem("token")) return;
  try {
    const res = await fetch(`${API}/user/balance`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    });
    const data = await res.json();
    if (data.success) {
      balanceEl.innerText = `Balance: ₦${data.balance}`;
    }
  } catch (err) {
    console.error(err);
  }
}

// DEPOSIT BUTTON
document.getElementById("depositBtn").onclick = async () => {
  if (!token) return alert("Please login first");

  const amount = prompt("Enter deposit amount (₦):");
  if (!amount) return;

  const email = localStorage.getItem("email");

  try {
    const init = await fetch(`${API}/paystack/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ amount, email })
    });

    const data = await init.json();
    if (!data.data || !data.data.authorization_url) {
      alert("Error initializing payment");
      return;
    }

    window.location.href = data.data.authorization_url;
  } catch (err) {
    console.error(err);
    alert("Deposit failed");
  }
};

// ALL SERVICES / PAY BUTTONS
function attachServiceButtons() {
  document.querySelectorAll(".serviceBtn").forEach(btn => {
    btn.onclick = () => {
      if (!token) return alert("Please login to use this service");
      const type = btn.dataset.type;
      showService(type); // your existing showService function
    };
  });
}

attachServiceButtons();











