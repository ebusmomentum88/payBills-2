const API = "https://paymomentbackend.onrender.com/api";
let token = localStorage.getItem("token");

// Elements
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

// Show dashboard if token exists
if (token) showDashboard();

// Switch login/signup
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

// Login/signup
authBtn.onclick = async () => {
  let email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();
  const name = nameInput.value.trim();

  if (!email || !password || (!isLogin && !name)) return alert("Please fill all fields");

  const endpoint = isLogin ? "/auth/login" : "/auth/signup";
  const body = isLogin ? { email, password } : { name, email, phone: "", password };

  try {
    const res = await fetch(`${API}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      showDashboard();
    } else alert(data.message || "Action completed");
  } catch (err) { console.error(err); alert("Connection error"); }
};

// Show dashboard
async function showDashboard() {
  authSection.style.display = "none";
  dashboard.style.display = "block";
  logoutBtn.style.display = "inline-block";
  await updateBalance();
}

// Logout
logoutBtn.onclick = () => { localStorage.clear(); location.reload(); };

// Update balance
async function updateBalance() {
  if (!token) return balanceEl.style.display = "none";
  try {
    const res = await fetch(`${API}/user/balance`, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    if (data.success) {
      balanceEl.style.display = "block";
      balanceEl.innerText = `Balance: ₦${data.balance}`;
    }
  } catch (err) { console.error(err); }
}

// Paybills
document.querySelectorAll(".paybill").forEach(btn => {
  btn.addEventListener("click", () => { showService(btn.dataset.type); });
});

// Paystack deposit
document.getElementById("depositBtn").onclick = async () => {
  const amount = prompt("Enter deposit amount (₦):");
  if (!amount) return;
  const email = localStorage.getItem("email");

  try {
    const init = await fetch(`${API}/paystack/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ amount, email }),
    });
    const data = await init.json();
    if (!data.data || !data.data.authorization_url) return alert("Error initializing payment");
    window.location.href = data.data.authorization_url;
  } catch (err) { console.error(err); }
};

// Show service
function showService(type) {
  const form = document.getElementById("serviceForm");
  const select = document.getElementById("optionSelect");
  const amountInput = document.getElementById("amount");
  const title = document.getElementById("serviceTitle");
  const payBtn = document.getElementById("payServiceBtn");

  form.style.display = "block";
  title.innerText = `${type} Payment`;
  select.innerHTML = "";
  amountInput.value = "";

  document.querySelectorAll(".extra-input").forEach(el => el.remove());

  // Airtime, Data, Electricity, TV, Transport setup like Opay
  // (similar to previous script)
  // ... (reuse dynamic inputs from previous version)
  
  payBtn.onclick = async () => {
    const amount = parseFloat(amountInput.value);
    if (!amount || isNaN(amount)) return alert("Enter valid amount");

    try {
      const res = await fetch(`${API}/services/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ type, description: `${type} Payment`, amount })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        updateBalance();
        form.style.display = "none";
      } else alert(data.message || "Payment failed");
    } catch (err) { console.error(err); alert("Payment error"); }
  };
}










