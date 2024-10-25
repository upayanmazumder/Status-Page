from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "Welcome to the Status Page!"

if __name__ == '__main__':
    app.run(debug=True, port=3000)