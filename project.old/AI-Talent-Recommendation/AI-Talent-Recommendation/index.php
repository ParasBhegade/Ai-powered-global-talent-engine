<?php
session_start();
require_once 'config.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>AI Powered Global Talent & Recommendation Engine</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">

<style>
/* ===== Root Theme ===== */
:root{
  --accent1:#00eaff;
  --accent2:#7b3cff;
  --glass: rgba(255,255,255,0.04);
  --soft: rgba(255,255,255,0.02);
}

/* Reset */
*{margin:0;padding:0;box-sizing:border-box;}
body{
    margin: 0;
    font-family: Inter, sans-serif;
    background: linear-gradient(-45deg, #1e1e2f, #111, #002244, #003366);
    background-size: 400% 400%;
    animation: gradient 12s ease infinite;
    color:#e6f6ff;
    overflow-x:hidden;
    -webkit-font-smoothing:antialiased;
}

@keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}


/* ===== Moving Background ===== */
.bg-anim{
  position:fixed; inset:0; z-index:-2; pointer-events:none;
  background:
      radial-gradient(circle at 20% 10%, rgba(123,60,255,0.20), transparent 12%),
      radial-gradient(circle at 80% 90%, rgba(0,234,255,0.18), transparent 15%);
  background-blend-mode:screen;
  animation:bgMove 5s linear infinite;
  transform:translateZ(0);
}
@keyframes bgMove{
  0%{transform:translate(0,0) scale(1);}
  25%{transform:translate(-6px,4px) scale(1.02);}
  50%{transform:translate(-12px,8px) scale(1.05);}
  75%{transform:translate(-6px,4px) scale(1.02);}
  100%{transform:translate(0,0) scale(1);}
}

/* ===== Container ===== */
.container{max-width:1200px;margin:auto;padding:24px;}

/* ===== TOP NAVBAR ===== */
.top-nav{
  display:flex;
  justify-content:flex-end;
  gap:12px;
  margin-bottom:20px;
}
.top-nav a{
  padding:10px 16px;
  border-radius:10px;
  font-size:14px;
  font-weight:700;
  text-decoration:none !important;
  cursor:pointer;
}

/* Buttons */
.btn-login{
  background:rgba(255,255,255,0.08);
  border:1px solid rgba(0,238,255,0.35);
  color:#bffaff;
}
.btn-signup{
  background:linear-gradient(90deg,#00eaff,#7b3cff);
  color:#001018;
}
.btn-admin{
  background:linear-gradient(90deg,#ff8a00,#ff2070);
  color:#1a000f;
}

/* ===== HERO ===== */
.hero{
  text-align:center;
  padding:60px 20px 40px;
}
.logo-big{
  width:120px;height:120px;border-radius:24px;margin:auto;
  background:linear-gradient(135deg,var(--accent1),var(--accent2));
  display:flex;align-items:center;justify-content:center;
  font-size:42px;font-weight:900;color:#021020;
  box-shadow:0 18px 45px rgba(123,60,255,0.30);
}
.hero-title{font-size:46px;font-weight:800;margin-top:20px;color:#fff;}
.hero-tagline{margin-top:8px;font-size:20px;opacity:.85;color:#bcdff6;}

/* ===== HERO SUB ===== */
.hero-sub{
  margin-top:40px;padding:28px;border-radius:14px;
  background:rgba(255,255,255,0.02);
  box-shadow:0 10px 30px rgba(0,0,0,0.6);
  text-align:center;
}
.hero-sub h2{font-size:32px;margin-bottom:12px;}
.hero-sub p{font-size:16px;opacity:.9;margin-bottom:20px;}
.btn-cta{
  padding:12px 20px;border-radius:10px;
  background:linear-gradient(90deg,var(--accent1),var(--accent2));
  color:#071020;font-weight:700;border:none;cursor:pointer;margin:0 8px;
}

/* ===== FEATURES ===== */
.features{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
  gap:18px;margin-top:28px;
}
.card{
  background:var(--glass);padding:18px;border-radius:12px;
  border:1px solid rgba(255,255,255,0.03);
  box-shadow:0 12px 30px rgba(0,0,0,0.45);
}
.card h4{margin-bottom:8px;color:#def7ff;}

/* ===== COMPANIES ===== */
.companies{text-align:center;margin-top:50px;}
.logo-strip{overflow:hidden;margin-top:14px;}
.marquee{
  display:flex;gap:18px;
  animation:scrollCompanies 18s linear infinite;
}
@keyframes scrollCompanies{
  0%{transform:translateX(0);}
  100%{transform:translateX(-50%);}
}
.company-pill{
  padding:10px 16px;background:rgba(0,0,0,0.4);
  border-radius:999px;color:#fff;font-weight:600;
  border:1px solid rgba(255,255,255,0.08);
  box-shadow:0 10px 20px rgba(0,0,0,0.4);
}

/* ===== FAQ ===== */
.faq{margin-top:48px;}
.faq h3{text-align:center;margin-bottom:20px;color:#bff7ff;}
.faq-item{
  background:rgba(255,255,255,0.03);
  padding:16px;border-radius:10px;margin-top:12px;
  cursor:pointer;
}
.faq-answer{
  display:none;margin-top:8px;color:#cfeeff;
}

/* ===== FOOTER ===== */
.footer{text-align:center;margin-top:50px;padding:20px;color:#9fcfe6;opacity:.85;}

/* ===== AI Assistant ===== */
.ai-toggle{
  position:fixed;right:26px;bottom:26px;
  z-index:999999;display:flex;flex-direction:column;gap:12px;
}
.ai-button{
  width:68px;height:68px;border-radius:50%;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  font-size:22px;font-weight:900;
  background:linear-gradient(135deg,#7b3cff,#00eaff);
  color:#021020;box-shadow:0 18px 60px rgba(0,0,0,0.6);
}
.ai-panel{
  width:360px;max-width:92vw;height:500px;display:none;
  flex-direction:column;
  background:rgba(0,0,15,0.55);
  backdrop-filter:blur(18px);
  border-radius:14px;border:1px solid rgba(255,255,255,0.05);
  box-shadow:0 30px 80px rgba(0,0,0,0.6);
}
.ai-header{
  padding:14px;font-weight:700;color:#e6f6ff;font-size:16px;
}
.ai-messages{
  flex:1;overflow-y:auto;padding:12px;
  display:flex;flex-direction:column;gap:10px;
}
.msg{
  max-width:85%;padding:12px 14px;border-radius:12px;
  font-size:14px;line-height:1.4;
}
.msg.user{
  align-self:flex-end;
  background:linear-gradient(90deg,#052b3a,#073b5a);
  color:#c8f1ff;
}
.msg.ai{
  background:linear-gradient(90deg,#07203a,#10102a);
  color:#e8f7ff;align-self:flex-start;
}
.ai-input{
  display:flex;gap:10px;padding:12px;
  border-top:1px solid rgba(255,255,255,0.05);
}
.ai-input input{
  flex:1;padding:10px 40px 10px 10px;border-radius:8px;
  background:rgba(255,255,255,0.1);border:none;color:#fff;
}
.mic-btn{
  position:absolute;margin-left:-36px;margin-top:8px;
  cursor:pointer;font-size:20px;color:#00eaff;
}
.ai-input button{
  padding:10px 16px;background:linear-gradient(90deg,#00eaff,#7b3cff);
  border:none;border-radius:8px;font-weight:700;color:#021020;
}
</style>
</head>

<body>

<div class="bg-anim"></div>

<div class="container">

<!-- TOP NAV -->
<div class="top-nav">
    <a class="btn-login" href="login.php">Login</a>
    <a class="btn-signup" href="signup.php">Signup</a>
    <a class="btn-admin" href="admin_login.php">Admin Dashboard</a>
</div>

<!-- HERO -->
<section class="hero">
    <div class="logo-big">AI</div>
    <h1 class="hero-title">AI Powered Global Talent & Recommendation Engine</h1>
    <p class="hero-tagline">Smart career paths • Interview practice • Automated recommendations</p>
</section>

<!-- HERO SUB -->
<section class="hero-sub">
    <h2>Practice interviews. Build skills. Get hired.</h2>
    <p>AI-driven personal career coach with interviews, aptitude & personalized learning paths.</p>

    <button onclick="location.href='interview_select.php'" class="btn-cta">Start AI Interview</button>
    <button onclick="location.href='career_paths.php'" class="btn-cta" style="background:rgba(255,255,255,0.08);color:#cfeeff;">
        Explore Career Paths
    </button>
</section>

<!-- FEATURES -->
<div class="features">
    <div class="card"><h4>Live AI Interviews</h4><p>Real-time camera + speech mock interviews with AI scoring.</p></div>
    <div class="card"><h4>Skill Mapping</h4><p>Discover strengths & gaps instantly.</p></div>
    <div class="card"><h4>Company Aptitude</h4><p>Company-specific aptitude practice.</p></div>
    <div class="card"><h4>Resume Insights</h4><p>AI-powered feedback to improve your resume.</p></div>
    <div class="card"><h4>Progress Dashboard</h4><p>Track your performance.</p></div>
    <div class="card"><h4>Interview Notes</h4><p>Store AI feedback & suggestions.</p></div>
</div>

<!-- COMPANIES -->
<section class="companies">
    <h3>Companies</h3>
    <div class="logo-strip">
        <div class="marquee">
            <?php
            $companies=['TCS','Infosys','Wipro','Zoho','Cognizant','Deloitte','Accenture','TCS Ninja','TCS Digital'];
            $out=array_merge($companies,$companies);
            foreach($out as $c){ echo '<div class="company-pill">'.$c.'</div>'; }
            ?>
        </div>
    </div>
</section>

<!-- FAQ -->
<section class="faq">
    <h3>FAQ</h3>
    <div class="faq-item" onclick="toggleFAQ(this)">
        <strong>Is this platform enough for placement prep?</strong>
        <div class="faq-answer">Yes — interviews, aptitude, coding & AI analytics included.</div>
    </div>
    <div class="faq-item" onclick="toggleFAQ(this)">
        <strong>Are mock interviews AI evaluated?</strong>
        <div class="faq-answer">Yes — speech, clarity & logic are scored instantly.</div>
    </div>
    <div class="faq-item" onclick="toggleFAQ(this)">
        <strong>Do you offer company-specific practice?</strong>
        <div class="faq-answer">Yes — TCS, Wipro, Deloitte, Infosys & more.</div>
    </div>
</section>

<!-- FOOTER -->
<footer class="footer">
    © <?=date('Y')?> AI Powered Global Talent & Recommendation Engine — Built for hiring success.
</footer>

</div>

<!-- AI Assistant (Floating) -->
<div class="ai-toggle">
  <div class="ai-button" id="openAI">AI</div>

  <div id="aiPanel" class="ai-panel" style="display:none" role="dialog" aria-label="AI Assistant">
    <div class="ai-header">
      <div style="font-weight:700">AI Career Assistant</div>
      <div style="font-size:12px;color:#9fdff7">Voice enabled</div>
    </div>

    <div id="aiMessages" class="ai-messages"></div>

    <div class="ai-input">
      <input id="aiInput" placeholder="Ask me anything..." />
      <button id="aiMic" class="send-btn" style="background:#ffd700;color:#000">🎤</button>
      <button id="aiSend" class="send-btn">Send</button>
    </div>
  </div>
</div>


<script>
/* ------------------- ELEMENTS ------------------- */
const openAI = document.getElementById('openAI');
const aiPanel = document.getElementById('aiPanel');
const aiMessages = document.getElementById('aiMessages');
const aiInput = document.getElementById('aiInput');
const aiSend = document.getElementById('aiSend');
const aiMic = document.getElementById('aiMic');

let recognition;

/* ------------------- AUDIO UNLOCK ------------------- */
document.body.addEventListener("click", () => {
    try { speechSynthesis.speak(new SpeechSynthesisUtterance("")); } catch(e){}
}, { once: true });

/* ------------------- OPEN/CLOSE PANEL ------------------- */
openAI.onclick = () => {
    aiPanel.style.display = aiPanel.style.display === "flex" ? "none" : "flex";

    if (aiMessages.innerHTML.trim() === "") {
        addAIMessage("Hello! I'm your AI Career Assistant. Ask me anything.");
        speakText("Hello! I'm your AI Assistant. How can I help you today?");
    }
};

/* ------------------- MESSAGE HANDLERS ------------------- */
function addUserMessage(t){
    let d=document.createElement("div");
    d.className="msg user";
    d.innerText=t;
    aiMessages.appendChild(d);
    aiMessages.scrollTop=aiMessages.scrollHeight;
}
function addAIMessage(t){
    let d=document.createElement("div");
    d.className="msg ai";
    d.innerHTML=t.replace(/\n/g,"<br>");
    aiMessages.appendChild(d);
    aiMessages.scrollTop=aiMessages.scrollHeight;
}

/* ------------------- TEXT TO SPEECH ------------------- */
function speakText(text){
    try{
        speechSynthesis.cancel();
        let u=new SpeechSynthesisUtterance(text);
        let voices=speechSynthesis.getVoices();
        let v=voices.find(v=>v.lang.startsWith("en")) || voices[0];
        u.voice=v;
        u.rate=1;
        u.pitch=1;
        speechSynthesis.speak(u);
    }catch(e){}
}

/* ------------------- TYPING ------------------- */
function showTyping(){
    let d=document.createElement("div");
    d.className="msg ai";
    d.id="typing";
    d.innerText="Typing...";
    aiMessages.appendChild(d);
}
function removeTyping(){
    let t=document.getElementById("typing");
    if(t) t.remove();
}

/* ------------------- SEND TEXT TO AI API ------------------- */
async function sendToAI(text){
    addUserMessage(text);
    aiInput.value="";

    showTyping();

    try{
        let r = await fetch("ai_assistant_api.php", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({message:text})
        });

        let data = await r.json();
        removeTyping();

        let reply = data.reply || "No response.";
        addAIMessage(reply);
        speakText(reply);
    }
    catch(e){
        removeTyping();
        addAIMessage("Network error.");
    }
}



/* ------------------- SEND BUTTON ------------------- */
aiSend.onclick = () => {
    let txt = aiInput.value.trim();
    if(txt) sendToAI(txt);
};
aiInput.addEventListener("keydown",(e)=>{
    if(e.key==="Enter") aiSend.click();
});

/* ------------------- VOICE INPUT + AUTO SEND ------------------- */
if("webkitSpeechRecognition" in window){
    recognition = new webkitSpeechRecognition();
    recognition.lang="en-US";
    recognition.interimResults=false;

    aiMic.onclick = ()=>{
        aiMic.style.background = "#00eaff";
        aiInput.placeholder = "Listening...";
        recognition.start();
    };

    recognition.onresult = (event)=>{
        let text = event.results[0][0].transcript;
        aiInput.value = text;
        sendToAI(text);
    };

    recognition.onend = ()=>{
        aiMic.style.background = "#ffd700";
        aiInput.placeholder = "Ask me anything...";
    };
}

</script>

</body>
</html>
