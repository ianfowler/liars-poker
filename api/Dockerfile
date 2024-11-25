FROM python:3.11-slim

WORKDIR /api

COPY requirements.txt /api/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY . /api

EXPOSE 5000

CMD if [ "$FLASK_ENV" = "production" ]; then gunicorn -w 4 -b 0.0.0.0:5000 app:app; else flask run --host=0.0.0.0 --port=5000; fi
