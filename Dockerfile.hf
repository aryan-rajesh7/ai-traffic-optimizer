FROM python:3.11-slim

WORKDIR /code

COPY requirements.hf.txt .
RUN pip install --no-cache-dir -r requirements.hf.txt

COPY backend/app /code/app
COPY ml /code/ml

EXPOSE 10000

CMD ["python3", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
