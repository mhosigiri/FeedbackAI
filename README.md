# FeedbackAI

AI-powered customer feedback analysis platform for T-Mobile integrating Nvidia's nemoTron mistral model.

## Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Configuration

Create `.env` files in both backend and frontend directories with required API keys.

## Features

- Customer sentiment analysis
- AI workflow automation
- Employee and customer dashboards
- Real-time analytics
- Firebase integration

## Usage

- Employee login: Full access to analytics and workflow management
- Customer portal: View analytics and submit feedback
- AI Assistant: Chat-based support powered by OpenRouter

## Development

Create a new branch for changes and test before merging to main.

## Deployment