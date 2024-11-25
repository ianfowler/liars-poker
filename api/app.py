import os

from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Liars poker site", 200

if __name__ == "__main__":
    port = os.getenv("API_PORT")
    if port is None or not port.isnumeric():
        raise ValueError("API_PORT is not specified")
    app.run(
        host="0.0.0.0", 
        port=int(port), 
        debug=os.getenv("FLASK_ENV") == "development"
    )

