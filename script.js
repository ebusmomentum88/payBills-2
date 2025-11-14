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
let isLogin = true;

// Show dashboard if logged in
if (token) showDashboard();

// Toggle Login/Signup
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

// Login/Signup
authBtn.onclick = async () => {
  let email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();
  const name = nameInput.value.trim();

  if (!email || !password || (!isLogin && !name)) return alert("Fill all fields");

  const endpoint = isLogin ? "/auth/login" : "/auth/signup";
  const body = isLogin ? { email, password } : { name, email, phone: "", password };

  try {
    const res = await fetch(`${API}${endpoint}`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.token){
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      showDashboard();
    } else alert(data.message);
  } catch(err){ alert("Connection error"); console.error(err); }
};

// Show dashboard
async function showDashboard(){
  authSection.style.display = "none";
  dashboard.style.display = "block";
  logoutBtn.style.display = "inline-block";
  await updateBalance();
}

// Logout
logoutBtn.onclick = () => {
  localStorage.clear();
  location.reload();
};

// Update balance
async function updateBalance(){
  try{
    const res = await fetch(`${API}/user/balance`, {
      headers:{ Authorization:"Bearer "+localStorage.getItem("token") }
    });
    const data = await res.json();
    if(data.success)
      document.getElementById("balance").innerText = `Balance: ₦${data.balance}`;
  }catch(err){ console.error(err); }
}

// Pay bills function (called from UI)
async function payBill(type){
  const amount = parseFloat(prompt(`Enter amount for ${type}:`));
  if(!amount) return;
  const description = prompt(`Enter description for ${type}:`) || type;
  try{
    const res = await fetch(`${API}/services/pay`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:"Bearer "+localStorage.getItem("token") },
      body:JSON.stringify({ type, description, amount })
    });
    const data = await res.json();
    if(data.success){
      alert(`${type} payment successful! Reference: ${data.reference}`);
      updateBalance();
    } else alert(data.message);
  }catch(err){ alert("Payment failed"); }
}

// Deposit function
async function deposit(){
  const amount = parseFloat(document.getElementById("depositAmount").value);
  if(!amount) return alert("Enter deposit amount");
  const email = localStorage.getItem("email");

  try{
    const init = await fetch(`${API}/paystack/initialize`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:"Bearer "+localStorage.getItem("token") },
      body:JSON.stringify({ amount, email })
    });
    const data = await init.json();
    if(data.status){
      alert("Payment initialized. Complete payment on Paystack popup.");
      const reference = data.data.reference;
      // Verify after a short delay for demo
      setTimeout(async()=>{
        const verify = await fetch(`${API}/paystack/verify`, {
          method:"POST",
          headers:{ "Content-Type":"application/json", Authorization:"Bearer "+localStorage.getItem("token") },
          body:JSON.stringify({ reference })
        });
        const res = await verify.json();
        if(res.success){
          alert("Deposit successful!");
          updateBalance();
        } else alert(res.message);
      }, 5000);
    } else alert(data.message);
  }catch(err){ alert("Deposit failed"); console.error(err); }
}















