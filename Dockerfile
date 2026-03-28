FROM python:3.11-slim

WORKDIR /code

COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app /code/app
COPY backend/congestion /code/congestion
COPY ml /code/ml

EXPOSE 7860

CMD ["python3", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]