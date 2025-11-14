# Frontend-Backend Integration Guide

This document describes how the frontend (React + Vite) integrates with the backend (FastAPI) for the Natural Language Query Service.

## API Integration Overview

The frontend communicates with the backend through REST API endpoints defined in `src/lib/api.ts`.

### Backend API Endpoints

All endpoints are prefixed with `/api`:

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/upload` | Upload CSV/Excel file | FormData with file | UploadResult |
| GET | `/api/tables` | Get all uploaded tables | - | TableMetadata[] |
| GET | `/api/tables/{table_id}` | Get table schema | - | TableSchema |
| DELETE | `/api/tables/{table_id}` | Delete a table | - | {message: string} |
| POST | `/api/query` | Execute natural language query | NLQuery | QueryResult |

### Data Type Mappings

#### Upload Response
**Backend (UploadResult):**
```python
{
  "table_ids": List[str],
  "tables": List[TableMetadata],
  "rows_imported": int
}
```

**Frontend transforms to (TableInfo):**
```typescript
{
  id: string,
  name: string,  // from original_filename
  row_count: number,
  columns: Array<{name: string, type: string}>,
  created_at: string  // from uploaded_at
}
```

#### Query Request
**Frontend sends:**
```typescript
{
  query: string,
  table_ids?: string[]  // Optional: specific tables to query
}
```

**Backend expects (NLQuery):**
```python
{
  "query": str,
  "table_ids": List[str] | None = None
}
```

#### Query Response
**Backend returns (QueryResult):**
```python
{
  "sql": str,
  "rows": List[Dict[str, Any]],
  "total_rows": int,
  "truncated": bool,
  "summary": str | None,
  "execution_time": float
}
```

**Frontend uses directly** - No transformation needed!

### Key Features Implemented

1. **File Upload with Schema Detection**
   - Frontend: `FileUpload.tsx` component with drag & drop
   - Backend: Parses CSV/Excel, infers column types, creates PostgreSQL tables
   - After upload, frontend automatically fetches table schema

2. **Multi-Table Selection**
   - Frontend: `QueryInterface.tsx` allows selecting specific tables
   - Backend: Queries only selected tables or all if none specified
   - LLM receives schema context for selected tables only

3. **Natural Language Queries**
   - Frontend: Sends plain text query + optional table IDs
   - Backend: Uses Groq LLM to generate SQL, validates safety, executes
   - Returns results with generated SQL for transparency

4. **Smart Result Handling**
   - Backend truncates results > 100 rows and generates AI summary
   - Frontend displays truncated indicator and shows summary
   - Export to CSV functionality on frontend

5. **Error Handling**
   - All API calls wrapped in try-catch
   - Toast notifications for success/error states
   - Detailed error messages from backend

## Setup Instructions

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd limelight-beta-backend
   uv sync
   ```

2. **Start PostgreSQL:**
   ```bash
   docker-compose up -d
   ```

3. **Create `.env` file:**
   ```bash
   DATABASE_URL=postgresql://nlquery_user:nlquery_pass@localhost:5432/nlquery_db
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the server:**
   ```bash
   uv run uvicorn app.main:app --reload
   ```

   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd askyourdata-ai
   npm install
   ```

2. **Create `.env` file (optional):**
   ```bash
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Run the dev server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:8080`

## Testing the Integration

1. **Upload a file:**
   - Visit `http://localhost:8080`
   - Drag and drop a CSV or Excel file
   - Verify table appears in the sidebar

2. **Query the data:**
   - Type a natural language query (e.g., "Show me the first 10 rows")
   - Optionally select specific tables from dropdown
   - Click Submit
   - Verify SQL query and results are displayed

3. **Export results:**
   - After a successful query, click "Export CSV"
   - Verify CSV file downloads with correct data

4. **Delete a table:**
   - Click the trash icon on any table
   - Confirm deletion
   - Verify table is removed

## API Client Implementation

The `src/lib/api.ts` file contains all API integration logic:

- **Type Safety**: Full TypeScript types matching backend Pydantic models
- **Data Transformation**: Converts backend snake_case to frontend camelCase
- **Schema Fetching**: Automatically enriches table metadata with column info
- **Error Handling**: Consistent error format with helpful messages
- **Environment Config**: Supports custom API URL via environment variable

## Common Issues & Solutions

### CORS Errors
**Problem:** Browser blocks requests due to CORS policy  
**Solution:** Backend already has CORS middleware configured to allow all origins

### Connection Refused
**Problem:** Cannot connect to backend  
**Solution:** Ensure backend is running on port 8000 and database is up

### Upload Fails
**Problem:** File upload returns 500 error  
**Solution:** Check backend logs, ensure PostgreSQL is running and migrations completed

### Query Returns No Results
**Problem:** Valid query returns empty results  
**Solution:** Check if data was actually inserted during upload, verify SQL in response

## Future Enhancements

- [ ] Add authentication/authorization
- [ ] Support for more file formats (Parquet, JSON)
- [ ] Real-time query execution status
- [ ] Query history and saved queries
- [ ] Data visualization charts
- [ ] Collaborative features (share queries/tables)
