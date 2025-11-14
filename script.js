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

// -------- INITIAL UI STATE --------
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

    if (data.success && data.token) {
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
  attachPaybillHandlers(); // enable all paybill buttons
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
    if (!data.data || !data.data.authorization_url) {
      alert("Error initializing payment");
      return;
    }

    window.location.href = data.data.authorization_url;
  } catch (err) {
    console.error(err);
  }
};

// -------- PAYBILLS HANDLER --------
function attachPaybillHandlers() {
  const billButtons = document.querySelectorAll(".paybill-btn");
  billButtons.forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.type;
      showServiceForm(type);
    };
  });
}

// -------- SHOW SERVICE FORM --------
function showServiceForm(type) {
  const form = document.getElementById("serviceForm");
  const select = document.getElementById("optionSelect");
  const amountInput = document.getElementById("amount");
  const title = document.getElementById("serviceTitle");

  form.style.display = "block";
  title.innerText = `${type} Payment`;
  select.innerHTML = "";
  amountInput.value = "";

  document.querySelectorAll(".extra-input").forEach(el => el.remove());

  // Dynamic form fields for each service type
  if (type === "Airtime" || type === "Data") {
    ["MTN", "GLO", "AIRTEL", "9MOBILE"].forEach(opt => select.add(new Option(opt, opt)));
    const phone = document.createElement("input");
    phone.className = "extra-input";
    phone.id = "phoneNumber";
    phone.placeholder = "Enter Phone Number";
    amountInput.insertAdjacentElement("beforebegin", phone);
  }

  if (type === "Electricity") {
    ["Aba Power", "EEDC", "Ikeja Electric", "Abuja Disco"].forEach(opt => select.add(new Option(opt,opt)));
    const meterNumber = document.createElement("input");
    meterNumber.className = "extra-input";
    meterNumber.id = "meterNumber";
    meterNumber.placeholder = "Enter Meter Number";
    amountInput.insertAdjacentElement("beforebegin", meterNumber);
  }

  if (type === "TV") {
    ["DSTV","GOTV","Startimes"].forEach(opt => select.add(new Option(opt,opt)));
    const smartCard = document.createElement("input");
    smartCard.className = "extra-input";
    smartCard.id = "smartCard";
    smartCard.placeholder = "Enter Smart Card Number";
    amountInput.insertAdjacentElement("beforebegin", smartCard);
  }

  if (type === "Transportation") {
    ["Bus", "Train", "Taxi", "Flight"].forEach(opt => select.add(new Option(opt,opt)));
    const passenger = document.createElement("input");
    passenger.className = "extra-input";
    passenger.id = "passengerId";
    passenger.placeholder = "Enter Passenger ID / Booking Ref";
    amountInput.insertAdjacentElement("beforebegin", passenger);
  }

  // -------- PAY BUTTON ----------
  document.getElementById("payBtn").onclick = async () => {
    const amount = Number(amountInput.value);
    const description = select.value;
    if (!amount || !description) return alert("Please enter all details");

    let extra = {};
    if (type === "Airtime" || type === "Data") extra.phone = document.getElementById("phoneNumber")?.value;
    if (type === "Electricity") extra.meterNumber = document.getElementById("meterNumber")?.value;
    if (type === "TV") extra.smartCard = document.getElementById("smartCard")?.value;
    if (type === "Transportation") extra.passengerId = document.getElementById("passengerId")?.value;

    try {
      const res = await fetch(`${API}/services/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ type, description, amount, ...extra }),
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) updateBalance();
    } catch (err) {
      alert("Error processing payment");
    }
  };
}











