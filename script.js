// CLOCK
setInterval(()=>{
    document.getElementById("time").innerText =
    new Date().toLocaleTimeString();
},1000);

// ================= CANVAS BACKGROUND =================

const canvas = document.getElementById("networkBG");
if(canvas){
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 1 + 0.5
        });
    }

    function draw() {
        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.strokeStyle = "#00f7ff22";

        // grid lines
        for (let i=0;i<canvas.width;i+=60){
            ctx.beginPath();
            ctx.moveTo(i,0);
            ctx.lineTo(i,canvas.height);
            ctx.stroke();
        }

        for (let i=0;i<canvas.height;i+=60){
            ctx.beginPath();
            ctx.moveTo(0,i);
            ctx.lineTo(canvas.width,i);
            ctx.stroke();
        }

        // moving particles
        particles.forEach(p=>{
            p.y += p.speed;
            if(p.y > canvas.height) p.y = 0;

            ctx.fillStyle = "#00f7ff";
            ctx.fillRect(p.x,p.y,2,2);
        });

        requestAnimationFrame(draw);
    }

    draw();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ================= VOICE ASSISTANT =================

const btn = document.getElementById("voiceBtn");

if(btn){
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    btn.onclick = () => {
        recognition.start();
    };

    recognition.onresult = async (event) => {
        let speech = event.results[0][0].transcript;
        console.log("You said:", speech);

        let aiPanel = document.getElementById("ai");
        if(aiPanel) aiPanel.innerText = "Listening...";

        let res = await fetch('/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: speech })
        });

        let data = await res.json();
        let reply = data.response;

        if(aiPanel) aiPanel.innerText = reply;
        speak(reply);
    };

    function speak(text) {
        let speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.rate = 1;
        speech.pitch = 1.2;
        window.speechSynthesis.speak(speech);
    }
}

// ================= SIDEBAR TOGGLE =================

const toggleBtn = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");

if(toggleBtn && sidebar){
    toggleBtn.onclick = () => {
        sidebar.classList.toggle("collapsed");
    };
}

// ================= ACTIVE LINK SWITCH =================

document.querySelectorAll(".sidebar a").forEach(link => {
    link.onclick = function() {
        document.querySelectorAll(".sidebar a").forEach(l => l.classList.remove("active"));
        this.classList.add("active");
    };
});

// ================= DASHBOARD CHART (only on dashboard) =================

if(document.getElementById('chart')){
    const ctx = document.getElementById('chart');

    let chart = new Chart(ctx, {
        type:'line',
        data:{
            labels:["1","2","3","4","5","6"],
            datasets:[
                {
                    label:"Inbound",
                    data:[20,40,35,60,55,70],
                    borderColor:"#00f7ff",
                    backgroundColor:"rgba(0,247,255,0.1)",
                    tension:0.4
                },
                {
                    label:"Outbound",
                    data:[10,30,25,50,45,60],
                    borderColor:"#ff00ff",
                    backgroundColor:"rgba(255,0,255,0.1)",
                    tension:0.4
                }
            ]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                legend:{
                    labels:{color:"#00f7ff"}
                }
            },
            scales:{
                x:{
                    ticks:{color:"#00f7ff88"},
                    grid:{color:"#00f7ff22"}
                },
                y:{
                    ticks:{color:"#00f7ff88"},
                    grid:{color:"#00f7ff22"}
                }
            }
        }
    });

    // LIVE DATA
    async function loadData(){
        let n = await fetch('/network').then(r=>r.json());
        let c = await fetch('/connections').then(r=>r.json());
        let a = await fetch('/analysis').then(r=>r.json());

        let netPanel = document.getElementById("net");
        let connPanel = document.getElementById("conn");
        let aiPanel = document.getElementById("ai");

        if(netPanel) netPanel.innerHTML = "Network Data<br><small>" + n.recv + " recv / " + n.sent + " sent</small>";
        if(connPanel) connPanel.innerHTML = "Connections<br><small>" + c.connections + " active</small>";
        if(aiPanel) aiPanel.innerHTML = "AI Insight<br><small>" + a.analysis + "</small>";

        chart.data.datasets[0].data.push(n.recv % 100);
        chart.data.datasets[1].data.push(n.sent % 100);
        chart.data.labels.push(chart.data.labels.length + 1);

        if(chart.data.labels.length > 10){
            chart.data.datasets[0].data.shift();
            chart.data.datasets[1].data.shift();
            chart.data.labels.shift();
        }
        chart.update();
    }

    loadData();
    setInterval(loadData, 2000);
}

