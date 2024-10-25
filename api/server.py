from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Status Page API"})

@app.route('/status')
def status():
    return jsonify({"status": "OK"})

@app.route('/sites')
def sites():
    websites = [
        {"shortName": "example", "domain": "example.com"},
        {"shortName": "example2", "domain": "example2.com"}
    ]
    return jsonify(websites)

@app.route('/site/<sitename>/')
def site_status(sitename):
    # Static response for demonstration
    status_data = [
        f"on from 2023-01-01 00:00:00 to 2023-01-02 00:00:00",
        f"off from 2023-01-02 00:00:00 to 2023-01-03 00:00:00"
    ]
    return jsonify(status_data)

if __name__ == '__main__':
    app.run(debug=True, port=3000)
