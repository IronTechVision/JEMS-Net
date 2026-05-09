from flask import Flask, jsonify, render_template, request
import psutil, socket, random, requests

app = Flask(__name__)

# ================= BACKEND =================

@app.route('/network')
def network():
    net = psutil.net_io_counters()
    return jsonify({
        "sent": net.bytes_sent,
        "recv": net.bytes_recv
    })

@app.route('/connections')
def connections():
    return jsonify({
        "connections": len(psutil.net_connections())
    })

@app.route('/connections-detail')
def connections_detail():
    conns = psutil.net_connections()
    data = []
    for c in conns[:50]:
        item = {
            "type": c.type if c.type else "TCP",
            "local_addr": c.laddr.ip if c.laddr else "-",
            "local_port": c.laddr.port if c.laddr else "-",
            "remote_addr": c.raddr.ip if c.raddr else "-",
            "status": c.status if c.status else "UNKNOWN"
        }
        data.append(item)
    return jsonify({"connections": data})

@app.route('/analysis')
def analysis():
    conns = len(psutil.net_connections())
    if conns > 250:
        msg = "⚠️ High number of connections → Possible congestion"
    else:
        msg = "✅ Network stable and normal"
    return jsonify({"analysis": msg})

@app.route('/ports')
def ports():
    conns = psutil.net_connections()
    ports = list(set([c.laddr.port for c in conns if c.laddr]))
    return jsonify({"ports": ports[:5]})

@app.route('/voice', methods=['POST'])
def voice():
    data = request.json
    user_input = data["text"]

    prompt = f"""
    You are JEMS AI, a futuristic network assistant.
    Answer clearly and briefly:

    {user_input}
    """

    res = requests.post("http://localhost:11434/api/generate", json={
        "model": "phi3",
        "prompt": prompt,
        "stream": False
    })

    return jsonify({
        "response": res.json()["response"]
    })


# ================= UI =================

@app.route('/')
def home():
    return render_template("dashboard.html", active="dashboard")

@app.route('/dashboard')
def dashboard():
    return render_template("dashboard.html", active="dashboard")

@app.route('/monitor')
def monitor():
    return render_template("monitor.html", active="monitor")

@app.route('/analytics')
def analytics():
    return render_template("analytics.html", active="analytics")

@app.route('/alerts')
def alerts():
    return render_template("alerts.html", active="alerts")

@app.route('/reports')
def reports():
    return render_template("reports.html", active="reports")

@app.route('/settings')
def settings():
    return render_template("settings.html", active="settings")

if __name__ == "__main__":
    app.run(debug=True)
