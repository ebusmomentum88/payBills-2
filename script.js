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
  const email = emailInput.value.trim();
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

    if (isLogin && data.token) {
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
    if (data.success)
      document.getElementById("balance").innerText = `Balance: ₦${data.balance}`;
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

// -------- SERVICES WITH REAL OPAY PLANS --------
function showService(type) {
  const form = document.getElementById("serviceForm");
  const select = document.getElementById("optionSelect");
  const amountInput = document.getElementById("amount");
  const title = document.getElementById("serviceTitle");

  form.style.display = "block";
  title.innerText = `${type} Payment`;
  select.innerHTML = "";
  amountInput.value = "";

  document.querySelectorAll(".extra-input").forEach(el => el.remove());

  if (type === "Airtime") {
    ["MTN", "GLO", "AIRTEL", "9MOBILE"].forEach(opt => select.add(new Option(opt, opt)));

    const phone = document.createElement("input");
    phone.className = "extra-input";
    phone.id = "phoneNumber";
    phone.placeholder = "Enter Phone Number";
    amountInput.insertAdjacentElement("beforebegin", phone);
  }

  if (type === "Data") {
    ["MTN", "GLO", "AIRTEL", "9MOBILE"].forEach(opt => select.add(new Option(opt, opt)));

    const phone = document.createElement("input");
    phone.className = "extra-input";
    phone.id = "phoneNumber";
    phone.placeholder = "Enter Phone Number";
    amountInput.insertAdjacentElement("beforebegin", phone);

    const planType = document.createElement("select");
    planType.className = "extra-input";
    planType.id = "dataType";
    planType.innerHTML = `<option value="">Select Plan Type</option>
      <option value="Daily">Daily</option>
      <option value="Weekly">Weekly</option>
      <option value="Monthly">Monthly</option>`;
    amountInput.insertAdjacentElement("beforebegin", planType);

    const planSelect = document.createElement("select");
    planSelect.className = "extra-input";
    planSelect.id = "dataPlan";
    planSelect.innerHTML = `<option value="">Select Data Plan</option>`;
    amountInput.insertAdjacentElement("beforebegin", planSelect);

    const plansByNetwork = {
      MTN: {
        Daily: [{name:"100MB-₦50",value:50},{name:"500MB-₦200",value:200}],
        Weekly: [{name:"1GB-₦500",value:500},{name:"2GB-₦900",value:900}],
        Monthly: [{name:"5GB-₦2500",value:2500},{name:"10GB-₦4500",value:4500}]
      },
      GLO: {
        Daily: [{name:"100MB-₦40",value:40},{name:"500MB-₦180",value:180}],
        Weekly: [{name:"1GB-₦450",value:450},{name:"2GB-₦850",value:850}],
        Monthly: [{name:"5GB-₦2400",value:2400},{name:"10GB-₦4300",value:4300}]
      },
      AIRTEL: {
        Daily: [{name:"100MB-₦45",value:45},{name:"500MB-₦190",value:190}],
        Weekly: [{name:"1GB-₦480",value:480},{name:"2GB-₦870",value:870}],
        Monthly: [{name:"5GB-₦2450",value:2450},{name:"10GB-₦4400",value:4400}]
      },
      "9MOBILE": {
        Daily: [{name:"100MB-₦50",value:50},{name:"500MB-₦200",value:200}],
        Weekly: [{name:"1GB-₦500",value:500},{name:"2GB-₦900",value:900}],
        Monthly: [{name:"5GB-₦2500",value:2500},{name:"10GB-₦4500",value:4500}]
      }
    };

    const updatePlans = () => {
      planSelect.innerHTML = `<option value="">Select Data Plan</option>`;
      const net = select.value;
      const type = planType.value;
      if (!net || !type) return;
      plansByNetwork[net][type].forEach(p => planSelect.add(new Option(p.name,p.value)));
    };

    select.onchange = updatePlans;
    planType.onchange = updatePlans;
  }

  if (type === "Electricity") {
    ["Aba Power", "EEDC", "Ikeja Electric", "Abuja Disco"].forEach(opt => select.add(new Option(opt,opt)));

    const meterType = document.createElement("select");
    meterType.className = "extra-input";
    meterType.id = "meterType";
    meterType.innerHTML = `<option value="">Select Meter Type</option><option value="Prepaid">Prepaid</option><option value="Postpaid">Postpaid</option>`;
    amountInput.insertAdjacentElement("beforebegin", meterType);

    const meterNo = document.createElement("input");
    meterNo.className = "extra-input";
    meterNo.id = "meterNumber";
    meterNo.placeholder = "Enter Meter Number";
    amountInput.insertAdjacentElement("beforebegin", meterNo);
  }

  if (type === "Transportation") {
    ["Bus", "Train", "Taxi", "Flight"].forEach(opt => select.add(new Option(opt,opt)));
    const passenger = document.createElement("input");
    passenger.className = "extra-input";
    passenger.id = "passengerId";
    passenger.placeholder = "Enter Passenger ID / Booking Ref";
    amountInput.insertAdjacentElement("beforebegin", passenger);
  }

  if (type === "TV") {
    ["DSTV","GOTV","Startimes"].forEach(opt => select.add(new Option(opt,opt)));
    const smartCard = document.createElement("input");
    smartCard.className = "extra-input";
    smartCard.id = "smartCard";
    smartCard.placeholder = "Enter Smart Card Number";
    amountInput.insertAdjacentElement("beforebegin", smartCard);
  }

  // ---------- PAY BUTTON ----------
  document.getElementById("payBtn").onclick = async () => {
    let amount = Number(amountInput.value);
    let description = select.value;
    if (!amount || !description) return alert("Please enter all details");

    let extra = {};
    if (type === "Airtime") extra = { phone: document.getElementById("phoneNumber")?.value };
    if (type === "Data") extra = {
      phone: document.getElementById("phoneNumber")?.value,
      planType: document.getElementById("dataType")?.value,
      plan: document.getElementById("dataPlan")?.value
    };
    if (type === "Electricity") extra = {
      meterNumber: document.getElementById("meterNumber")?.value,
      meterType: document.getElementById("meterType")?.value
    };
    if (type === "Transportation") extra = { passengerId: document.getElementById("passengerId")?.value };
    if (type === "TV") extra = { smartCard: document.getElementById("smartCard")?.value };

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












