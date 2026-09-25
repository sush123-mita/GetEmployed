# GetEmployed API

Node/Express is the only service the React app calls. It stores structured resume analysis, normalized jobs, saved jobs, and application tracking in MongoDB. Resume bytes are held in memory only and are forwarded to the configured FastAPI service.

## Run

1. Copy `.env.example` to `.env` and set a 32+ character `SESSION_SECRET`.
2. Start MongoDB.
3. Run `npm install`, then `npm run dev` from `backend/`.
4. Run the frontend with `npm run dev` from `frontend/`.

The Vite proxy sends `/api` to `http://localhost:3001`.

## API contract

All routes below are under `/api`. An anonymous signed `ge_session` cookie scopes data until authentication is added.

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/health/live` | none | Cheap process liveness response; does not require dependencies |
| `GET` | `/health` or `/health/ready` | none | `{ service, status, database, automation }`; returns `503` until dependencies are ready |
| `POST` | `/resume/analyze` | multipart field `resume`; PDF/DOCX, max 5 MB | frontend `AnalysisResult`: profile fields, `jobs`, `totalFound`, optional `ats` |
| `GET` | `/jobs/saved` | none | `Job[]` |
| `POST` | `/jobs/saved` | JSON `Job` with HTTP(S) `url`, title, company, source | `{ success, id, job }` |
| `DELETE` | `/jobs/saved/:id` | URL-encoded job URL or Mongo id | `{ success }` |
| `GET` | `/applications` | none | `Application[]`, with `id` equal to the job URL for frontend compatibility |
| `PATCH` | `/applications/:id/status` | `{ status, notes? }` | updated `Application` |
| `GET` | `/applications/history` | none | `ApplicationHistoryEvent[]` |
| `GET` | `/jobs/:id` | URL-encoded job URL or Mongo id | `Job` |

Validation errors are `400 VALIDATION_ERROR`; unavailable AI is `503 AI_UNAVAILABLE`; AI timeout is `504 AI_TIMEOUT`; malformed AI output is `502 INVALID_AI_RESPONSE`.

The API also emits a `requestId` in error responses and logs it with the structured request record. Configure `TRUST_PROXY=true` only when the service is behind a trusted reverse proxy.

## FastAPI contract for the next phase

`POST ${PYTHON_SERVICE_URL}${PYTHON_ANALYZE_PATH}` accepts multipart field `resume` and returns JSON:

```json
{
  "detectedSkills": ["Node.js", "MongoDB"],
  "role": "Backend Engineer",
  "experienceLevel": "mid",
  "totalFound": 1,
  "ats": { "score": 82, "grade": "B", "readability": "High", "breakdown": {}, "suggestions": [], "strengths": [] },
  "profile": { "summary": "...", "experience": [], "education": [], "projects": [], "certifications": [], "domains": [], "strengths": [] },
  "jobs": [{
    "title": "Backend Engineer", "company": "Example", "location": "Remote", "url": "https://jobs.example/123", "source": "Adzuna",
    "matchScore": 84, "matchedSkills": ["Node.js"], "missingSkills": [], "workMode": "remote", "employmentType": "full-time",
    "description": "...", "requirements": [], "responsibilities": [], "matchExplanation": "...", "matchReasons": [],
    "postedDate": "2026-09-25T00:00:00.000Z", "salary": "$100,000"
  }]
}
```

The service must return real provider jobs and real application URLs. It must not return credentials, raw resume text, or provider secrets. `GET /health` should return a successful JSON response for the API health check.