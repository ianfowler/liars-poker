FROM python:3.11-slim

WORKDIR /api

COPY requirements.txt /api/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY . /api

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
