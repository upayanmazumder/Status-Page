from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Status Page API"})

@app.route('/status')
def status():
    return jsonify({"status": "OK"})

if __name__ == '__main__':
    app.run(debug=True)