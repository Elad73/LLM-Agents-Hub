# LLM-Agents-Hub

A microservices-based application for managing and utilizing LLM (Large Language Model) agents for multiple tasks. Built with React.js, Node.js, and Python, this project provides a flexible and scalable architecture for AI-powered task automation.

## 🌟 Features

- Microservices architecture within a monorepo structure
- Web scraping capabilities
- Document processing (.docx support)
- Text summarization
- Real-time processing status updates
- Configurable LLM agent interactions

## 🏗️ Architecture

The project follows a microservices architecture within a monorepo:

- **Frontend**: React.js application (TypeScript)
- **Backend**: Python FastAPI service
- **Communication**: RESTful APIs

Part 2 - Tech Stack and Prerequisites:

## 🛠️ Tech Stack

### Frontend
- React.js 19.0.0
- Material-UI (MUI) v5
- TypeScript 4.9.5
- React Router v6
- Mammoth.js for DOCX processing

### Backend
- Python 3.11
- FastAPI
- OpenAI SDK
- BeautifulSoup4 for web scraping
- Uvicorn server

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 20.x
- Python 3.11
- npm or yarn package manager

Part 3 - Getting Started:

## 🚀 Getting Started

1. **Clone the repository**

git clone https://github.com/yourusername/llm-agents-hub.git
cd llm-agents-hub

2. **Environment Setup**

Frontend (.env):
```env
REACT_APP_API_URL=http://localhost:8000
```

Backend (.env):
```env
PYTHONPATH=/app
LOG_LEVEL=debug
```

3. **Start the application**

docker-compose up --build

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

Part 4 - Project Structure and Configuration:
## 📁 Project Structure

LLMS/
├── backend/
│ ├── app/
│ ├── logs/
│ ├── Dockerfile
│ ├── requirements.txt
│ └── start.sh
├── frontend/
│ ├── src/
│ ├── public/
│ ├── Dockerfile
│ └── package.json
└── docker-compose.yml

## 🔧 Configuration

### Resource Limits

#### Backend Service
- Memory: 2GB (limit), 512MB (reservation)
- CPU: 1.0 (limit), 0.5 (reservation)

#### Frontend Service
- Memory: 1GB (limit), 512MB (reservation)

### Health Checks
Both services implement health checks:
- Backend: 30s interval, 10s timeout, 3 retries
- Frontend: 30s interval, 10s timeout, 3 retries

Part 5 - Development and Testing:
## 🛠️ Development

### Frontend Development

cd frontend
npm install --legacy-peer-deps
npm start

### Backend Development
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload


## 🧪 Testing
Frontend tests
cd frontend
npm test
Backend tests (if implemented)
cd backend
python -m pytest

```

Part 6 - API Documentation, Security, and Contributing:
📚 API Documentation
API documentation is available at http://localhost:8000/docs when the backend service is running.
🔐 Security
CORS configuration implemented
Rate limiting on API endpoints
Resource constraints configured in Docker
🤝 Contributing
Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📝 License
This project is licensed under the MIT License - see the LICENSE.md file for details
👥 Authors
Your Name - Initial work
🙏 Acknowledgments
OpenAI for LLM capabilities
FastAPI framework
React.js community