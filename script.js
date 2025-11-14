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
  location.reload();
};

// -------- UPDATE BALANCE --------
async function updateBalance() {
  try {
    const res = await fetch(`${API}/user/balance`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById("balance").innerText = `Balance: ₦${data.balance}`;
    }
  } catch (err) {
    console.error(err);
  }
}

// -------- PAYSTACK DEPOSIT --------
document.getElementById("depositBtn").onclick = async () => {
  const amount = prompt("Enter deposit amount (₦):");
  if (!amount) return;
  const email = localStorage.getItem("email");

  try {
    const init = await fetch(`${API}/paystack/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ amount, email }),
    });
    const data = await init.json();
    if (data.data?.authorization_url) {
      window.location.href = data.data.authorization_url;
    } else {
      alert("Error initializing payment");
    }
  } catch (err) {
    console.error(err);
  }
};

// -------- PAYBILLS BUTTONS --------
document.querySelectorAll(".paybill-btn").forEach(btn => {
  btn.onclick = () => {
    const type = btn.getAttribute("data-type");
    showService(type);
  };
});

// -------- SHOW SERVICE FORM --------
function showService(type) {
  const form = document.getElementById("serviceForm");
  const select = document.getElementById("optionSelect");
  const amountInput = document.getElementById("amount");
  const title = document.getElementById("serviceTitle");

  form.style.display = "block";
  title.innerText = `${type} Payment`;
  select.innerHTML = "";
  amountInput.value = "";

  // Simple options for demonstration
  if(type==="Airtime") ["MTN","GLO","AIRTEL","9MOBILE"].forEach(opt=>select.add(new Option(opt,opt)));
  if(type==="Data") ["MTN","GLO","AIRTEL","9MOBILE"].forEach(opt=>select.add(new Option(opt,opt)));
  if(type==="Electricity") ["EEDC","IKEDA","ABUJA"].forEach(opt=>select.add(new Option(opt,opt)));
  if(type==="TV") ["DSTV","GOTV","STARTIMES"].forEach(opt=>select.add(new Option(opt,opt)));
  if(type==="Transportation") ["Bus","Train","Taxi","Flight"].forEach(opt=>select.add(new Option(opt,opt)));

  // Pay button
  document.getElementById("payBtn").onclick = async () => {
    let amount = Number(amountInput.value);
    let description = select.value;
    if(!amount || !description) return alert("Enter all details");

    try{
      const res = await fetch(`${API}/services/pay`, {
        method:"POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer "+localStorage.getItem("token")
        },
        body: JSON.stringify({ type, description, amount })
      });
      const data = await res.json();
      alert(data.message);
      if(data.success) updateBalance();
    } catch(err){
      alert("Error processing payment");
      console.error(err);
    }
  };
}













