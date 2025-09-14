# backend-service
Backend Service for CodenceAI


deployment 

1. docker buildx build --platform linux/amd64 -t gcr.io/codenceai/node-backend:latest .
2. docker push gcr.io/codenceai/node-backend:latest
3. gcloud run deploy node-backend \
  --image gcr.io/codenceai/node-backend:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="",GCP_PROJECT_ID="codenceai"
