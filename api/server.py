from flask import Flask, jsonify
import json
import os
import sqlite3
import requests
import threading
import time
from datetime import datetime, timedelta

app = Flask(__name__)

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))
# Construct the relative path to the JSON file
json_path = os.path.join(script_dir, 'websites.json')

# Load the JSON file once at the start
with open(json_path, 'r') as file:
    websites = json.load(file)

# Initialize SQLite database
db_path = os.path.join(script_dir, 'status.db')
conn = sqlite3.connect(db_path, check_same_thread=False)
cursor = conn.cursor()

# Create table if not exists
cursor.execute('''
CREATE TABLE IF NOT EXISTS status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site TEXT,
    status TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')
conn.commit()

def ping_sites():
    while True:
        for site in websites:
            if 'domain' not in site:
                print(f"Error: 'domain' key not found in site: {site}")
                continue

            try:
                response = requests.get(f"http://{site['domain']}", timeout=5)
                status = 'on' if response.status_code == 200 else 'off'
            except requests.RequestException:
                status = 'off'
            
            cursor.execute('INSERT INTO status (site, status) VALUES (?, ?)', (site['shortName'], status))
            conn.commit()
        
        time.sleep(60)

def format_status_data(rows):
    formatted_data = []
    current_status = None
    start_time = None

    for row in rows:
        if current_status is None:
            current_status = row[1]
            start_time = row[2]
        elif row[1] != current_status:
            formatted_data.append(f"{current_status} from {start_time} to {row[2]}")
            current_status = row[1]
            start_time = row[2]

    if current_status is not None:
        formatted_data.append(f"{current_status} from {start_time} to {rows[-1][2]}")

    return formatted_data

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Status Page API"})

@app.route('/status')
def status():
    return jsonify({"status": "OK"})

@app.route('/sites')
def sites():
    return jsonify(websites)

@app.route('/site/<sitename>/')
def site_status(sitename):
    ninety_days_ago = datetime.now() - timedelta(days=90)
    cursor.execute('SELECT site, status, timestamp FROM status WHERE site = ? AND timestamp >= ? ORDER BY timestamp', (sitename, ninety_days_ago))
    rows = cursor.fetchall()
    formatted_data = format_status_data(rows)
    return jsonify(formatted_data)

@app.teardown_appcontext
def close_connection(exception):
    conn.close()

if __name__ == '__main__':
    threading.Thread(target=ping_sites, daemon=True).start()
    app.run(debug=True, port=3000)