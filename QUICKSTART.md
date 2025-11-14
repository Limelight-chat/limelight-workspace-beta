# Quick Start Guide

## Prerequisites

- Node.js 18+ and npm
- Python 3.13+
- Docker (for PostgreSQL)
- Groq API Key ([Get one here](https://console.groq.com/))

## 1. Start Backend

```bash
# Navigate to backend directory
cd limelight-beta-backend

# Install dependencies
uv sync

# Start PostgreSQL with Docker
docker-compose up -d

# Create .env file
echo "DATABASE_URL=postgresql://nlquery_user:nlquery_pass@localhost:5432/nlquery_db" > .env
echo "GROQ_API_KEY=your_groq_api_key_here" >> .env

# Run the server
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend should now be running at: http://localhost:8000  
API docs available at: http://localhost:8000/docs

## 2. Start Frontend

```bash
# Navigate to frontend directory (in a new terminal)
cd askyourdata-ai

# Install dependencies
npm install

# (Optional) Create .env file to customize API URL
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

Frontend should now be running at: http://localhost:8080

## 3. Test the Application

1. **Open your browser**: Navigate to http://localhost:8080

2. **Upload a data file**:
   - Drag and drop a CSV or Excel file into the upload area
   - Wait for the upload to complete
   - Your table should appear in the left sidebar

3. **Run a query**:
   - Type a natural language question like:
     - "Show me the first 10 rows"
     - "What's the average of the price column?"
     - "Count rows by category"
   - Click Submit or press Enter
   - View the generated SQL and results

4. **Export results**:
   - Click the "Export CSV" button to download results

5. **Manage tables**:
   - Click on a table to see its schema
   - Click the trash icon to delete a table

## Example Queries to Try

- "Show me the first 20 rows"
- "What is the total sum of sales?"
- "Count how many records there are"
- "Show unique values in the status column"
- "What is the average price grouped by category?"
- "Find all records where quantity is greater than 10"
- "Show the top 5 highest values in the revenue column"

## Troubleshooting

### Backend won't start
- **Check PostgreSQL**: `docker ps` should show nlquery_postgres running
- **Check database connection**: Verify DATABASE_URL in .env
- **Check Groq API key**: Make sure GROQ_API_KEY is set correctly

### Frontend can't connect to backend
- **Verify backend is running**: Visit http://localhost:8000 (should show API info)
- **Check CORS**: Backend has CORS enabled by default
- **Check browser console**: Look for any error messages

### Upload fails
- **File size**: Files must be under 50MB
- **File format**: Only CSV, XLS, XLSX files are supported
- **Check backend logs**: Look for error messages in the terminal

### Query fails
- **Check table exists**: Make sure you've uploaded data first
- **Check backend logs**: The generated SQL will be shown in terminal
- **Try simpler query**: Start with "Show me the first 10 rows"

## Project Structure

```
askyourdata-ai/          # Frontend (React + Vite)
├── src/
│   ├── components/      # UI components
│   │   ├── FileUpload.tsx
│   │   ├── TablesList.tsx
│   │   ├── QueryInterface.tsx
│   │   └── ResultsDisplay.tsx
│   ├── lib/
│   │   └── api.ts       # API client (Backend integration)
│   └── pages/
│       └── Index.tsx    # Main page

limelight-beta-backend/  # Backend (FastAPI)
├── app/
│   ├── api/
│   │   └── routes.py    # API endpoints
│   ├── services/        # Business logic
│   │   ├── database.py
│   │   ├── file_parser.py
│   │   ├── file_upload.py
│   │   ├── llm_service.py
│   │   └── query_service.py
│   └── models/
│       └── schemas.py   # Data models
└── docker-compose.yml   # PostgreSQL setup
```

## Next Steps

- Read [INTEGRATION.md](./INTEGRATION.md) for detailed API documentation
- Explore the backend API docs at http://localhost:8000/docs
- Try uploading different file formats (CSV, Excel with multiple sheets)
- Experiment with complex queries across multiple tables

## Need Help?

- Check the backend logs for detailed error messages
- Use the interactive API docs at http://localhost:8000/docs to test endpoints
- Verify your Groq API key is valid and has credits
