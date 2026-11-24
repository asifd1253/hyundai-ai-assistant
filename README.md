# Hyundai Automotive AI Assistant

**Technical Assessment Submission — Cyepro Solutions**

An AI-powered Hyundai Automotive Assistant built using Retrieval-Augmented Generation (RAG). The application allows authenticated users to upload Hyundai vehicle brochures, ask questions about vehicle specifications, compare models and variants, and receive recommendations grounded in the uploaded documents.

---

## 1. Project Overview

The Hyundai Automotive AI Assistant is designed to function as an automotive consultant. It retrieves information from uploaded Hyundai PDF brochures and uses an AI model to generate structured, context-aware responses.

Instead of relying entirely on the language model's general knowledge, the application uses a RAG pipeline to retrieve relevant information from the uploaded documents before generating an answer.

### Key objectives

- Provide secure email-and-password authentication.
- Allow users to upload and manage Hyundai PDF brochures.
- Automatically extract, split, and index brochure content.
- Support natural-language conversations about Hyundai vehicles.
- Compare vehicle models and variants using brochure information.
- Recommend suitable vehicles based on customer requirements.
- Provide source references for answers.
- Avoid inventing specifications when information is unavailable in the uploaded documents.

---

## 2. Application Links

| Resource | Link |
|---|---|
| Live application | https://hyundai-ai-assistant-frontend.onrender.com/login |
| Backend API | https://hyundai-ai-assistant-ymy3.onrender.com |
| Backend health check | https://hyundai-ai-assistant-ymy3.onrender.com/api/health |
| GitHub repository | https://github.com/asifd1253/hyundai-ai-assistant |
| Demonstration video | [Add demonstration video link before submission] |

**Note:** The backend URL is an API service, not the frontend application. The frontend URL is the entry point for reviewers.

---

## 3. Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- Axios
- React Router
- React Markdown
- Remark GFM

### Backend
- Node.js
- Express.js
- JavaScript
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- Multer
- PDF.js
- Google Gemini API

### AI and RAG
- Google Gemini for AI-generated responses.
- Gemini Embedding API for generating document and query embeddings.
- MongoDB Atlas Vector Search for semantic retrieval.
- PDF text extraction and text chunking for document processing.

### Development and Deployment
- Visual Studio Code
- Git and GitHub
- MongoDB Atlas
- Render

---

## 4. Application Architecture

The application follows a frontend-backend architecture.

```text
                 USER
                   |
                   v
          React Frontend (Vite)
                   |
             Axios / REST API
                   |
                   v
          Node.js + Express API
                   |
        +----------+-----------+
        |          |           |
        v          v           v
   Authentication  Brochures   AI Chat
        |          |           |
        v          v           v
      JWT       PDF Upload   Retrieval Service
        |          |           |
        |          v           v
        |     PDF Extraction  Query Embedding
        |          |           |
        |          v           v
        |     Text Chunking  Atlas Vector Search
        |          |           |
        |          v           v
        |     Gemini Embedding Relevant Chunks
        |          |           |
        |          v           v
        +------ MongoDB     Gemini AI
                               |
                               v
                       Generated Answer
                               |
                               v
                       Sources and Response
                               |
                               v
                         React Chat UI
```

### Main components

1. **Frontend:** Provides authentication pages, dashboard, brochure management, and conversational chat interface.
2. **Backend:** Handles authentication, API requests, document processing, retrieval, and AI response generation.
3. **MongoDB Atlas:** Stores user information, brochure metadata, extracted document content, and vector embeddings.
4. **Gemini API:** Generates embeddings and produces answers based on retrieved document context.
5. **MongoDB Atlas Vector Search:** Finds semantically relevant document chunks for user questions.

---

## 5. Implemented Features

### 5.1 Authentication

The application provides email-and-password authentication.

Implemented functionality:
- User registration.
- User login.
- Password hashing using bcrypt.
- JWT-based authentication.
- HTTP-only authentication cookies.
- Protected application routes.
- Authenticated user profile retrieval.
- Logout functionality.

Unauthenticated users cannot access protected application functionality.

### 5.2 Document Management

Authenticated users can manage Hyundai PDF brochures.

Implemented functionality:
- Upload PDF brochures.
- Validate uploaded file type and size.
- Store brochure metadata.
- Display uploaded brochure information.
- Track document processing status.
- Delete uploaded brochures.
- Automatically extract and process PDF content.

The brochure interface displays:
- Document name.
- Vehicle model.
- Upload date.
- Processing status.

### 5.3 Automatic Document Processing

After a brochure is uploaded, the backend automatically processes it.

Processing workflow:

1. Receive the PDF using Multer.
2. Extract text from the PDF using PDF.js.
3. Divide extracted text into smaller chunks.
4. Generate vector embeddings for the chunks using Gemini Embeddings.
5. Store the chunks and embeddings in MongoDB.
6. Make the indexed content available for semantic retrieval.

The text chunking process uses overlapping chunks to retain relevant context between consecutive sections.

### 5.4 AI Chat

The application provides an interactive conversational interface where authenticated users can ask questions about uploaded Hyundai brochures.

Examples:
- What are the features of Hyundai Alcazar?
- Compare Hyundai Alcazar and Creta.
- What are the differences between Alcazar variants?
- Should I choose Hyundai i20 or Aura?
- Compare the engine specifications of two vehicles.
- Which vehicle would be suitable for a family?

The chat interface supports structured responses and source references.

### 5.5 AI Agent Capabilities

The assistant is designed to support:

- Vehicle feature explanations.
- Model-to-model comparisons.
- Variant comparisons.
- Engine and performance comparisons.
- Safety feature comparisons.
- Comfort and technology comparisons.
- Customer-specific vehicle recommendations.

The assistant retrieves relevant information from uploaded brochures before generating its response.

When the uploaded documentation does not contain sufficient information, the assistant is instructed to communicate that limitation rather than invent specifications.

---

## 6. How the RAG Pipeline Works

Retrieval-Augmented Generation is the core functionality of this application.

The pipeline consists of two major stages.

### Stage 1: Document Indexing

This stage takes place when a user uploads a brochure.

1. The PDF is uploaded to the backend.
2. PDF.js extracts text page by page.
3. The extracted text is divided into smaller chunks.
4. Gemini Embeddings converts each chunk into a numerical vector representation.
5. The vectors and associated metadata are stored in MongoDB.
6. MongoDB Atlas Vector Search makes the content available for similarity-based retrieval.

Each stored chunk is associated with its brochure, page number, chunk index, and uploading user.

### Stage 2: Question Answering

This stage takes place when a user asks a question.

1. The backend receives the user's question.
2. The question is converted into an embedding using Gemini Embeddings.
3. MongoDB Atlas Vector Search retrieves relevant document chunks.
4. The retrieved chunks are supplied as context to the Gemini generation model.
5. Gemini generates an answer based on the retrieved context.
6. The backend returns the answer and source metadata.
7. The frontend displays the response and source references.

### Why RAG?

RAG helps the application answer questions using the uploaded Hyundai documentation instead of depending only on the language model's pretrained knowledge.

It also allows the application to:
- Retrieve information from multiple uploaded brochures.
- Support semantic rather than exact-keyword matching.
- Provide page-level source references.
- Reduce unsupported or fabricated specifications.

---

## 7. Database Design

The application uses MongoDB Atlas with Mongoose.

The main data models include:

### User
Stores user account information, including:
- Name.
- Email address.
- Hashed password.
- Account timestamps.

### Brochure
Stores uploaded document metadata, including:
- Original document name.
- Stored filename.
- File path.
- MIME type.
- File size.
- Uploading user.
- Vehicle model.
- Variants, where available.
- Processing status.
- Extracted page information.
- Created and updated timestamps.

### BrochureChunk
Stores the extracted and indexed document content, including:
- Brochure reference.
- Uploading user reference.
- Page number.
- Chunk index.
- Extracted text.
- Embedding vector.

A vector search index is configured for semantic retrieval using the stored embedding vectors.

---

## 8. Project Folder Structure

The project is organized into separate frontend and backend directories.

```text
hyundai-ai-assistant/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │
│   ├── middleware/
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Brochure.js
│   │   └── BrochureChunk.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── brochureRoutes.js
│   │   └── chatRoutes.js
│   │
│   ├── services/
│   │   ├── retrievalService.js
│   │   └── answerService.js
│   │
│   ├── utils/
│   │   ├── pdfExtractor.js
│   │   ├── textChunker.js
│   │   └── geminiEmbedding.js
│   │
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── index.html
│
├── .gitignore
└── README.md
```

*The structure above describes the main application organization. Additional files and subdirectories may exist in the repository.*

---

## 9. Local Setup and Installation

### Prerequisites

Install the following before running the project:

- Node.js and npm.
- Git.
- MongoDB Atlas account.
- Google AI Studio API key with access to the required Gemini models.

### Step 1: Clone the repository

```bash
git clone https://github.com/asifd1253/hyundai-ai-assistant.git

cd hyundai-ai-assistant
```

### Step 2: Configure the backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory.

Configure the following variables using your own credentials:

```env
PORT=5000
NODE_ENV=development

CLIENT_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

GEMINI_GENERATION_MODEL=your_configured_gemini_generation_model
```

**Important:**
- Replace the placeholder values with valid credentials.
- The MongoDB variable name must match the name used in `backend/config/db.js`.
- Use a strong, private JWT secret.
- Never commit `.env` files or expose API keys in the frontend.

Start the backend:

```bash
npm start
```

The backend should run on:

```text
http://localhost:5000
```

### Step 3: Configure the frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend should run on:

```text
http://localhost:5173
```

### Step 4: Open the application

Visit:

```text
http://localhost:5173
```

Register a new account or log in with an existing account.

---

## 10. Environment Configuration

The application uses environment variables to keep configuration and sensitive credentials outside the source code.

| Variable | Purpose |
|---|---|
| PORT | Backend server port |
| NODE_ENV | Application environment |
| CLIENT_URL | Frontend origin allowed by backend CORS |
| MONGO_URI | MongoDB connection string, if used by the backend |
| JWT_SECRET | Secret used to sign and verify JWTs |
| GEMINI_API_KEY | Google Gemini API key |
| GEMINI_GENERATION_MODEL | Configured Gemini generation model |
| VITE_API_URL | Backend API base URL used by the frontend |

For local development, use the local frontend and backend URLs.

For production, configure the deployed frontend URL in the backend's `CLIENT_URL` variable and configure the deployed backend API URL in the frontend's `VITE_API_URL` variable.

Production secrets must be configured in the hosting provider's environment settings, not committed to GitHub.

---

## 11. API Overview

The backend exposes REST API routes under `/api`.

| Route | Purpose |
|---|---|
| `/api/auth` | Registration, login, and logout |
| `/api/users` | User profile and user-related operations |
| `/api/brochures` | Brochure upload, listing, and deletion |
| `/api/chat` | AI question answering |
| `/api/health` | Backend health check |

The API uses authentication middleware to restrict protected operations to authenticated users.

Health check endpoint:

```http
GET /api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Hyundai AI Assistant API is running"
}
```

---

## 12. Deployment

The application is deployed using Render.

### Frontend deployment

The React/Vite frontend is deployed as a Render Static Site.

Production configuration:

```env
VITE_API_URL=https://hyundai-ai-assistant-ymy3.onrender.com/api
```

### Backend deployment

The Node.js/Express backend is deployed as a Render Web Service.

Production configuration includes:
- `NODE_ENV=production`
- `CLIENT_URL=https://hyundai-ai-assistant-frontend.onrender.com`
- `MONGO_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_GENERATION_MODEL`

The backend listens on the port provided by the hosting platform.

### Production considerations

- CORS is configured to allow the deployed frontend origin.
- Credentialed requests are enabled for cookie-based authentication.
- JWT cookies use production-appropriate security settings.
- API credentials are stored as environment variables.
- MongoDB Atlas provides the database and vector search functionality.

**Storage note:** The current brochure upload implementation uses backend file storage. For reliable long-term production storage, uploaded PDFs should be stored on a persistent disk or external object storage service. Temporary hosting filesystems may not survive service restarts or redeployments.

---

## 13. Security Considerations

The application incorporates the following security measures:

- Password hashing using bcrypt.
- JWT-based authentication.
- HTTP-only authentication cookies.
- Protected backend routes.
- Authenticated access to brochure operations.
- User-level filtering of document retrieval.
- CORS configuration.
- Helmet security middleware.
- API rate limiting.
- Environment-based secret management.

---

## 14. Testing and Verification

The following areas should be checked before final submission:

- User registration and login.
- Protected route access.
- Brochure PDF upload.
- PDF text extraction.
- Document chunk generation and embedding storage.
- Vector search retrieval.
- Questions about individual vehicle models.
- Comparisons between different vehicles.
- Comparisons between vehicle variants.
- Source references in generated answers.
- Unsupported questions and missing-information responses.
- Brochure deletion.
- Authentication and API behavior on the deployed application.

---

## 15. Limitations and Future Improvements

Potential future improvements include:

- Persistent cloud storage for uploaded PDF brochures.
- Stronger citation validation against retrieved source chunks.
- Improved conversational context for follow-up questions.
- More advanced filtering by vehicle model and variant.
- Improved document processing for scanned PDFs.
- Additional automated testing and monitoring.

---

## 16. Conclusion

The Hyundai Automotive AI Assistant demonstrates the integration of full-stack web development, secure authentication, document processing, semantic search, vector databases, and generative AI.

The application uses a Retrieval-Augmented Generation architecture to retrieve relevant information from uploaded Hyundai brochures and generate structured answers, comparisons, and recommendations.

The project was developed to satisfy the Cyepro Solutions technical assessment requirements, with a focus on document-grounded responses, usability, and a complete frontend-backend implementation.

---

## 17. Submission Deliverables

| Deliverable | Status / Link |
|---|---|
| Responsive web application | https://hyundai-ai-assistant-frontend.onrender.com/login |
| Backend API | https://hyundai-ai-assistant-ymy3.onrender.com |
| GitHub repository | https://github.com/asifd1253/hyundai-ai-assistant |
| Setup documentation | This README |
| Demonstration video | Add video link before submission |

**Final submission checklist:**
- [ ] Verify the GitHub repository is publicly accessible.
- [ ] Verify the deployed frontend loads successfully.
- [ ] Verify registration and login work on the deployed application.
- [ ] Verify brochure upload and processing work in production.
- [ ] Verify AI answers and source references work in production.
- [ ] Add the demonstration video link.
- [ ] Ensure no secrets or `.env` files are committed.
