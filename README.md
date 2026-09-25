# GetEmployed 🚀

### AI-Powered Job Discovery & Resume Matching Platform

<img width="1680" height="917" alt="image" src="https://github.com/user-attachments/assets/de54c820-02d5-403f-a519-69df224aa4d0" />



GetEmployed is an AI-powered job discovery platform that analyzes a user's resume, builds a dynamic candidate profile, discovers real job opportunities from supported job APIs, and ranks them based on semantic and structured relevance.

The goal is to move beyond simple keyword-based job searching by understanding **what the candidate has actually done** — including skills, projects, experience, education, certifications, and responsibilities — and comparing that information with real job requirements.

---

## ✨ Features

* 📄 Resume upload and intelligent parsing
* 🤖 AI-powered resume understanding
* 🧠 Dynamic candidate profile generation
* 🔎 Real job discovery through supported APIs
* 🏢 Job description analysis
* 🔗 Semantic embedding-based matching
* 📊 Hybrid job relevance scoring
* 💡 Explainable match results
* 🎯 Matched and missing requirements
* 🔖 Save jobs
* 📋 Application tracking
* ⚙️ Background job processing
* 🔌 Pluggable AI and job-source providers
* 🛡️ Secure API and file handling
* 📱 Responsive modern UI

---

## 🧠 How It Works

```text
                    USER
                      │
                      ▼
                Upload Resume
                      │
                      ▼
              React Frontend
                      │
                      ▼
               Node / Express
                      │
                      ▼
              Python / FastAPI
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
      Resume Analysis      Job Discovery
            │                   │
            ▼                   ▼
       AI Candidate         Real Job APIs
          Profile                │
            │                   ▼
            │              Job Analysis
            │                   │
            └─────────┬─────────┘
                      ▼
                 Embeddings
                      │
                      ▼
              Hybrid Matching
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
       Match Score       Explanation
            │                   │
            └─────────┬─────────┘
                      ▼
              Job Recommendations
                      │
                      ▼
                  Frontend
```

---

## 🔍 Resume Intelligence

GetEmployed does not depend on a predefined list of skills or career categories.

The AI pipeline dynamically extracts information available in the uploaded resume, including:

* Skills
* Technologies
* Frameworks
* Work experience
* Internships
* Projects
* Project technologies
* Responsibilities
* Education
* Courses
* Certifications
* Domains
* Job titles
* Achievements

Different resumes can therefore produce different candidate profiles without requiring hardcoded career mappings.

---

## 🎯 Job Matching

The matching engine uses a hybrid approach rather than relying on simple keyword overlap.

Candidate and job information can be represented using semantic embeddings and structured attributes.

Matching signals include:

* Semantic similarity
* Required capability alignment
* Preferred capability alignment
* Experience relevance
* Project relevance
* Responsibility alignment
* Education/certification relevance
* Seniority compatibility
* Location and work-mode compatibility

The system also provides an explanation of why a job is relevant and highlights missing or uncertain requirements where applicable.

---

## 🏗️ Architecture

### Frontend

* React
* Vite
* TypeScript
* Framer Motion
* Axios
* Responsive UI

### Backend

* Node.js
* Express
* REST APIs
* MongoDB
* Input validation
* Authentication/authorization where applicable
* API security and error handling

### AI/ML Service

* Python
* FastAPI
* NLP/document processing
* LLM integration
* Embeddings
* Semantic similarity
* Hybrid ranking
* AI response validation

### Data & Integrations

* MongoDB
* Configurable AI providers
* Configurable embedding providers
* Supported job APIs such as Adzuna/Jooble
* Background processing

---

## 🔌 Provider-Based Architecture

AI and job integrations are isolated behind provider interfaces.

Conceptually:

```text
AI Provider
├── Local Model
├── External LLM
└── Future Providers

Job Provider
├── Adzuna
├── Jooble
└── Future Providers
```

This allows providers to be changed without rewriting the matching engine or application logic.

---

## 🛡️ Security

The application is designed with production security in mind.

* API keys stored in environment variables
* No secrets in frontend code
* Resume validation
* File-size/type restrictions
* Protected API endpoints
* CORS configuration
* Rate limiting
* Safe error handling
* Sensitive information excluded from logs
* External API response validation

---

## ⚡ Local Development

### Prerequisites

Install:

* Node.js
* Python
* MongoDB or MongoDB Atlas
* Git
* Ollama (optional for local AI development)

Clone the repository:

```bash
git clone <repository-url>
cd GetEmployed
```

Install frontend/backend dependencies:

```bash
npm install
```

Install Python dependencies:

```bash
cd automation
pip install -r requirements.txt
```

Create environment files from the provided examples:

```text
.env.example → .env
```

Configure required services and API credentials.

---

## 🤖 Local AI with Ollama

GetEmployed can be developed with a locally running LLM through Ollama.

Conceptually:

```text
FastAPI
   ↓
Ollama
   ↓
Local LLM
   ↓
NVIDIA GPU
```

This allows AI development without requiring a paid external LLM API.

For systems with a supported NVIDIA GPU, Ollama can use GPU acceleration when available.

---

## 🔐 Environment Configuration

Example configuration:

```env
# Database
MONGODB_URI=

# Backend
PORT=
FRONTEND_URL=

# AI
AI_PROVIDER=
AI_BASE_URL=
AI_API_KEY=

# Embeddings
EMBEDDING_PROVIDER=
EMBEDDING_MODEL=

# Job Providers
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
JOOBLE_API_KEY=

# Python Service
AI_SERVICE_URL=
```

Never commit `.env` files.

---

## 🧪 Testing

The project includes testing for important components such as:

* Resume extraction
* Candidate profile generation
* AI response validation
* Job normalization
* Job deduplication
* Embedding generation
* Matching logic
* Ranking
* API validation
* Provider failures
* Error handling

---

## 📌 Design Principles

GetEmployed follows several core principles:

**No hardcoded career assumptions**

The system should work with different resumes and career backgrounds.

**No fake job data**

Production recommendations should originate from legitimate job sources.

**Explainable recommendations**

A match should provide evidence rather than only a number.

**Provider independence**

AI and job providers should be replaceable.

**Separation of concerns**

Application logic, AI/ML processing, external integrations and data persistence remain separated.

**Production over demo**

The goal is a maintainable application rather than a collection of mocked screens.

---

## 🗺️ Future Improvements

Potential future extensions include:

* More job providers
* Personalized job alerts
* Advanced recommendation models
* Application autofill assistance
* Resume optimization
* Interview preparation
* Skill-gap analysis
* Job-market analytics
* Feedback-driven recommendation improvement
* Candidate-specific ranking models

---

## 👩‍💻 Author

**Sushmita Singh**

B.Tech CSE — AI

GitHub: `https://github.com/sush123-mita`

---

## 📄 License

Add the project's chosen license here.
