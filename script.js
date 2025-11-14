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
    if (data.success) document.getElementById("balance").innerText = `Balance: ₦${data.balance}`;
  } catch (err) {
    console.error(err);
  }
}

// -------- PAYBILLS BUTTONS --------
document.querySelectorAll(".paybill").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    showService(type);
  });
});

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

// -------- SERVICES FUNCTION (Pay Now) --------
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

  if (type === "Airtime" || type === "Data") {
    ["MTN","GLO","AIRTEL","9MOBILE"].forEach(opt => select.add(new Option(opt,opt)));
    const phone = document.createElement("input");
    phone.className = "extra-input";
    phone.id = "phoneNumber";
    phone.placeholder = "Enter Phone Number";
    amountInput.insertAdjacentElement("beforebegin", phone);
  }

  if (type === "Data") {
    const planType = document.createElement("select");
    planType.className = "extra-input";
    planType.id = "dataType";
    planType.innerHTML = `<option value="">Select Plan Type</option>
      <option value="Daily">Daily</option><option value="Weekly">Weekly</option><option value="Monthly">Monthly</option>`;
    amountInput.insertAdjacentElement("beforebegin", planType);

    const planSelect = document.createElement("select");
    planSelect.className = "extra-input";
    planSelect.id = "dataPlan";
    planSelect.innerHTML = `<option value="">Select Data Plan</option>`;
    amountInput.insertAdjacentElement("beforebegin", planSelect);

    const plansByNetwork = {
      MTN: { Daily:[{name:"100MB-₦50",value:50}], Weekly:[{name:"1GB-₦500",value:500}], Monthly:[{name:"5GB-₦2500",value:2500}] },
      GLO: { Daily:[{name:"100MB-₦40",value:40}], Weekly:[{name:"1GB-₦450",value:450}], Monthly:[{name:"5GB-₦2400",value:2400}] },
      AIRTEL: { Daily:[{name:"100MB-₦45",value:45}], Weekly:[{name:"1GB-₦480",value:480}], Monthly:[{name:"5GB-₦2450",value:2450}] },
      "9MOBILE": { Daily:[{name:"100MB-₦50",value:50}], Weekly:[{name:"1GB-₦500",value:500}], Monthly:[{name:"5GB-₦2500",value:2500}] }
    };

    const updatePlans = () => {
      planSelect.innerHTML = `<option value="">Select Data Plan</option>`;
      const net = select.value;
      const typePlan = planType.value;
      if (!net || !typePlan) return;
      plansByNetwork[net][typePlan].forEach(p => planSelect.add(new Option(p.name,p.value)));
    };

    select.onchange = updatePlans;
    planType.onchange = updatePlans;
  }

  if (type === "Electricity") {
    ["IKEJA","EKO","ENUGU","PHCN"].forEach(opt => select.add(new Option(opt,opt)));
  }

  if (type === "TV") {
    ["DSTV","GOTV","STARTIMES"].forEach(opt => select.add(new Option(opt,opt)));
    const smartCard = document.createElement("input");
    smartCard.className = "extra-input";
    smartCard.id = "smartCard";
    smartCard.placeholder = "Enter Smart Card Number";
    amountInput.insertAdjacentElement("beforebegin", smartCard);
  }

  if (type === "Transportation") {
    ["Uber","Bolt","Gokada"].forEach(opt => select.add(new Option(opt,opt)));
  }

  // Pay Now Button
  payBtn.onclick = async () => {
    const amount = parseFloat(amountInput.value);
    if (!amount || isNaN(amount)) return alert("Enter valid amount");
    const description = type + " Payment";

    try {
      const res = await fetch(`${API}/services/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ type, description, amount })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        updateBalance();
        form.style.display = "none";
      } else alert(data.message || "Payment failed");
    } catch (err) {
      console.error(err);
      alert("Payment error");
    }
  };
}










