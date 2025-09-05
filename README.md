# Excel Skills Assessment Platform

## Project Overview
This project was developed as part of the Coding Ninjas curriculum to create an AI-powered Excel skills assessment platform. The application uses advanced LLM (Language Learning Model) technology to evaluate user responses and provide detailed feedback on Excel-related questions.

## Features

### 1. Interactive Assessment System
- Dynamic question generation from knowledge base
- Real-time answer evaluation
- Immediate feedback and scoring
- Progress tracking throughout the interview
- Mobile-responsive interface

### 2. AI-Powered Evaluation
- RAG (Retrieval Augmented Generation) for context-aware scoring
- Advanced LLM integration using Groq
- Google AI embeddings for knowledge retrieval
- FAISS vector store for efficient similarity search
- Anti-gaming mechanisms for fair assessment

### 3. Technical Stack

#### Frontend
- React + Vite for fast development and optimized builds
- Tailwind CSS for modern, responsive design
- Axios for API communication
- Real-time loading states and error handling

#### Backend
- FastAPI for high-performance Python backend
- LangChain for LLM orchestration
- GoogleGenerativeAIEmbeddings for semantic search
- FAISS for vector similarity search
- Session management for interview progress tracking

## Setup Instructions

### Prerequisites
- Python 3.13+
- Node.js and npm
- API keys for:
  - Groq LLM
  - Google AI

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your API keys:
```env
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_google_api_key
```

4. Run the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update the API endpoint in `Interview.jsx` if needed:
```javascript
axios.defaults.baseURL = 'http://your-backend-ip:8000';
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
coding-ninjas-ai/
├── backend/
│   ├── main.py           # FastAPI application and endpoints
│   ├── chains.py         # LLM chains and evaluation logic
│   ├── questions.json    # Question database
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Interview.jsx  # Main interview component
│   │   │   └── Report.jsx     # Results display
│   │   └── App.tsx           # Main application component
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Features in Detail

### Interview Process
1. User starts a new interview session
2. Questions are presented one at a time
3. Real-time evaluation of answers using AI
4. Progress tracking and previous answer review
5. Final report generation

### Answer Evaluation
- Technical accuracy assessment
- Syntax verification
- Practical application scoring
- Anti-gaming mechanisms
- Context-aware feedback generation

### Report Generation
- Overall score calculation
- Question-by-question breakdown
- Detailed feedback for each answer
- Related Excel concepts suggestion

## Performance Optimizations
- Token usage optimization in LLM calls
- Reduced chunk size for efficient processing
- Minimized API calls through session management
- Optimized vector store retrieval

## Mobile Responsiveness
- Adaptive layout for all screen sizes
- Touch-friendly interface
- Optimized loading states
- Cross-device compatibility

## Security Features
- Session-based authentication
- API rate limiting
- Input validation
- Error handling

## Future Enhancements
1. Additional question types
2. Custom assessment paths
3. Detailed analytics dashboard
4. Excel file upload capabilities
5. Interactive Excel simulations

## Credits
Developed as part of the Coding Ninjas curriculum, implementing advanced AI and web development concepts.

## License
This project is created for educational purposes as part of the Coding Ninjas program.
