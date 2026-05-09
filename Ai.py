import requests

def analyze_network(sent, recv, connections):
    if connections > 150:
        return "⚠️ High number of connections → Possible congestion"
    elif recv > 5000000:
        return "📥 Heavy download traffic detected"
    elif sent > 5000000:
        return "📤 Heavy upload activity"
    else:
        return "✅ Network is stable"

def analyze_network_ai(data):
    prompt = f"Analyze this network data: {data}"

    try:
        res = requests.post("http://localhost:11434/api/generate", json={
            "model": "phi3",
            "prompt": prompt
        })
        return res.json()["response"]
    except:
        return "Ollama not available. Make sure Ollama is running with phi3 model."

