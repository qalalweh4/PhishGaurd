const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const demoBtn = document.getElementById("demoBtn");

const emailText = document.getElementById("emailText");
const urlText = document.getElementById("urlText");

const resultBox = document.getElementById("resultBox");
const resultBadge = document.getElementById("resultBadge");
const statusBar = document.getElementById("statusBar");
const statusMessage = document.getElementById("statusMessage");
const statusIndicator = document.getElementById("statusIndicator");
const confidenceBar = document.getElementById("confidenceBar");
const confidenceText = document.getElementById("confidenceText");
const loadingSpinner = document.querySelector(".loading-spinner");
const btnText = document.querySelector(".btn-text");

function setBadge(label, confidence = 0){
  resultBadge.className = "badge rounded-pill px-3 py-2";
  
  if(label === "Safe"){
    resultBadge.classList.add("bg-success");
    resultBadge.innerHTML = "<i class='bi bi-check-circle me-1'></i>آمن";
    updateConfidence(confidence, "success");
  } else if(label === "Suspicious"){
    resultBadge.classList.add("bg-warning");
    resultBadge.innerHTML = "<i class='bi bi-exclamation-triangle me-1'></i>مشبوه";
    updateConfidence(confidence, "warning");
  } else if(label === "Phishing"){
    resultBadge.classList.add("bg-danger");
    resultBadge.innerHTML = "<i class='bi bi-x-circle me-1'></i>تصيد";
    updateConfidence(confidence, "danger");
  } else {
    resultBadge.classList.add("bg-secondary");
    resultBadge.textContent = "جاهز للتحليل";
    updateConfidence(0, "secondary");
  }
}

function updateConfidence(confidence, type) {
  const percentage = Math.round(confidence * 100);
  confidenceBar.style.width = percentage + "%";
  confidenceBar.className = `progress-bar bg-${type}`;
  confidenceBar.setAttribute("aria-valuenow", percentage);
  confidenceText.textContent = percentage + "%";
}

function setStatus(status, message, type = 'info') {
  statusIndicator.className = `status-indicator status-${status}`;
  
  if (message) {
    statusBar.className = `alert alert-${type} d-flex align-items-center`;
    statusBar.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info-circle'} me-2"></i><span>${message}</span>`;
  } else {
    statusBar.className = "alert alert-info d-none";
  }
}

async function analyze(){
  const payload = {
    text: emailText.value.trim() || null,
    url: urlText.value.trim() || null
  };

  if(!payload.text && !payload.url){
    setStatus('error', '⚠️ أدخل نص بريد أو رابط على الأقل.', 'warning');
    return;
  }

  // Show loading state
  setStatus('processing', '⏳ جاري التحليل...', 'info');
  setBadge(null);
  resultBox.textContent = "جاري التحليل...";
  loadingSpinner.classList.add('active');
  btnText.textContent = 'جاري التحليل...';
  analyzeBtn.disabled = true;

  try{
    const res = await fetch("/api/analyze",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    setBadge(data.label, data.confidence);
    resultBox.textContent = data.explanation;
    setStatus('ready', '✅ تم التحليل وتسجيل النتيجة في السجل.', 'success');
  } catch(err){
    setStatus('error', '❌ حدث خطأ أثناء الاتصال بالـ API.', 'danger');
    resultBox.textContent = String(err);
    setBadge(null);
  } finally {
    loadingSpinner.classList.remove('active');
    btnText.textContent = 'تحليل';
    analyzeBtn.disabled = false;
  }
}

analyzeBtn.addEventListener("click", analyze);

clearBtn.addEventListener("click", ()=>{
  emailText.value = "";
  urlText.value = "";
  resultBox.textContent = "أدخل البيانات ثم اضغط \"تحليل\" للحصول على النتيجة.";
  setStatus('ready', '', 'info');
  setBadge(null);
});

demoBtn.addEventListener("click", ()=>{
  emailText.value = "عاجل: تم إيقاف حسابك. الرجاء تحقق من حسابك فوراً وإدخال رمز OTP لتجنب إغلاق الحساب!";
  urlText.value = "http://secure-login.verify-account.xyz/login?user=you@company.com";
  setStatus('ready', '🧪 تم وضع مثال للتجربة.', 'info');
});
