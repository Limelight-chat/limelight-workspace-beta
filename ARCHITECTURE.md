# API Integration Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                        │
│                         http://localhost:8080                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │  FileUpload  │    │  TablesList  │    │QueryInterface│              │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘              │
│         │                   │                    │                       │
│         └───────────────────┴────────────────────┘                       │
│                             │                                            │
│                    ┌────────▼────────┐                                   │
│                    │   Index.tsx     │                                   │
│                    │  (Main Page)    │                                   │
│                    └────────┬────────┘                                   │
│                             │                                            │
│                    ┌────────▼────────┐                                   │
│                    │   api.ts        │                                   │
│                    │  (API Client)   │                                   │
│                    └────────┬────────┘                                   │
│                             │                                            │
└─────────────────────────────┼─────────────────────────────────────────┘
                              │
                    HTTP REST API
                    (JSON/FormData)
                              │
┌─────────────────────────────▼─────────────────────────────────────────┐
│                       BACKEND (FastAPI)                                 │
│                     http://localhost:8000                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │                    routes.py (API Layer)                    │         │
│  │  POST   /api/upload          GET    /api/tables            │         │
│  │  GET    /api/tables/{id}     DELETE /api/tables/{id}       │         │
│  │  POST   /api/query                                          │         │
│  └────────────────────────┬───────────────────────────────────┘         │
│                           │                                              │
│  ┌────────────────────────▼───────────────────────────────────┐         │
│  │                   Service Layer                             │         │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │         │
│  │  │file_upload   │  │query_service │  │schema_registry│    │         │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │         │
│  │         │                 │                  │             │         │
│  │  ┌──────▼───────┐  ┌─────▼──────┐   ┌──────▼───────┐    │         │
│  │  │file_parser   │  │llm_service │   │  database    │    │         │
│  │  └──────────────┘  └────────────┘   └──────┬───────┘    │         │
│  └──────────────────────────────────────────────┼──────────┘          │
│                                                  │                       │
└──────────────────────────────────────────────────┼───────────────────┘
                                                   │
                                         ┌─────────▼─────────┐
                                         │   PostgreSQL      │
                                         │   (Docker)        │
                                         │   Port 5432       │
                                         └───────────────────┘
```

## Data Flow Diagrams

### 1. File Upload Flow

```
User Action: Drag & Drop CSV/Excel File
     │
     ▼
┌─────────────────┐
│ FileUpload.tsx  │  Accepts file, shows progress
└────────┬────────┘
         │ onUpload(file)
         ▼
┌─────────────────┐
│   Index.tsx     │  uploadMutation.mutateAsync(file)
└────────┬────────┘
         │ 
         ▼
┌─────────────────┐
│    api.ts       │  api.uploadFile(file)
│                 │  → Creates FormData
│                 │  → POST /api/upload
└────────┬────────┘
         │ FormData
         ▼
┌─────────────────┐
│   routes.py     │  upload_file(file: UploadFile)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│file_upload.py   │  → file_parser.parse(file)
│                 │  → Infer column types
│                 │  → db.create_table()
│                 │  → db.insert_rows()
│                 │  → schema_registry.register_table()
└────────┬────────┘
         │ UploadResult
         ▼
┌─────────────────┐
│    api.ts       │  Transform to TableInfo
│                 │  → Fetch schema
│                 │  → Return enriched data
└────────┬────────┘
         │ TableInfo
         ▼
┌─────────────────┐
│  TablesList.tsx │  Display table card
└─────────────────┘
```

### 2. Natural Language Query Flow

```
User Action: Type "Show me first 10 rows" + Select Tables
     │
     ▼
┌──────────────────┐
│QueryInterface.tsx│  Capture query + selected table IDs
└────────┬─────────┘
         │ onQuery(query, tableIds)
         ▼
┌──────────────────┐
│   Index.tsx      │  queryMutation.mutateAsync({query, tableIds})
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    api.ts        │  api.executeQuery(query, tableIds)
│                  │  → POST /api/query
│                  │  → Body: {query, table_ids}
└────────┬─────────┘
         │ {query: string, table_ids?: string[]}
         ▼
┌──────────────────┐
│   routes.py      │  execute_query(query: NLQuery)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│query_service.py  │  → Get schemas for table_ids
│                  │  → llm_service.generate_sql()
│                  │  → Validate SQL (SELECT only)
│                  │  → db.execute_query()
│                  │  → Truncate if >100 rows
│                  │  → llm_service.summarize_results()
└────────┬─────────┘
         │ QueryResult
         ▼
┌──────────────────┐
│    api.ts        │  Return QueryResult (no transform)
└────────┬─────────┘
         │ QueryResult
         ▼
┌──────────────────┐
│ResultsDisplay.tsx│  Display:
│                  │  → SQL query
│                  │  → Results table
│                  │  → AI summary
│                  │  → Export button
└──────────────────┘
```

## API Request/Response Examples

### Upload File

**Request:**
```http
POST /api/upload HTTP/1.1
Content-Type: multipart/form-data

file=@data.csv
```

**Response:**
```json
{
  "table_ids": ["550e8400-e29b-41d4-a716-446655440000"],
  "tables": [{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "table_name": "data_sales_1731600000",
    "original_filename": "sales.csv",
    "uploaded_at": "2025-11-14T10:30:00",
    "row_count": 1500
  }],
  "rows_imported": 1500
}
```

### Get All Tables

**Request:**
```http
GET /api/tables HTTP/1.1
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "table_name": "data_sales_1731600000",
    "original_filename": "sales.csv",
    "uploaded_at": "2025-11-14T10:30:00",
    "row_count": 1500
  }
]
```

### Get Table Schema

**Request:**
```http
GET /api/tables/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "table_name": "data_sales_1731600000",
  "columns": [
    {"name": "id", "type": "INTEGER", "nullable": false},
    {"name": "product", "type": "TEXT", "nullable": true},
    {"name": "price", "type": "NUMERIC", "nullable": true},
    {"name": "date", "type": "DATE", "nullable": true}
  ]
}
```

### Execute Query

**Request:**
```http
POST /api/query HTTP/1.1
Content-Type: application/json

{
  "query": "Show me the first 10 rows",
  "table_ids": ["550e8400-e29b-41d4-a716-446655440000"]
}
```

**Response:**
```json
{
  "sql": "SELECT * FROM data_sales_1731600000 LIMIT 10",
  "rows": [
    {"id": 1, "product": "Widget A", "price": 29.99, "date": "2025-01-15"},
    {"id": 2, "product": "Widget B", "price": 39.99, "date": "2025-01-16"}
  ],
  "total_rows": 2,
  "truncated": false,
  "summary": null,
  "execution_time": 0.045
}
```

### Delete Table

**Request:**
```http
DELETE /api/tables/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
```

**Response:**
```json
{
  "message": "Table deleted successfully"
}
```

## Component Responsibilities

### Frontend Components

| Component | Responsibility | Talks To |
|-----------|---------------|----------|
| `FileUpload.tsx` | File drag & drop UI | Index.tsx → api.ts |
| `TablesList.tsx` | Display tables, delete action | Index.tsx → api.ts |
| `QueryInterface.tsx` | Query input, table selection | Index.tsx |
| `ResultsDisplay.tsx` | Show results, export CSV | Index.tsx (display only) |
| `api.ts` | All HTTP communication | Backend API |
| `Index.tsx` | State management, orchestration | All components + api.ts |

### Backend Services

| Service | Responsibility | Dependencies |
|---------|---------------|--------------|
| `routes.py` | HTTP endpoints, validation | All services |
| `file_upload.py` | Upload orchestration | file_parser, database, schema_registry |
| `file_parser.py` | Parse CSV/Excel, infer types | pandas |
| `query_service.py` | Query orchestration | llm_service, database, schema_registry |
| `llm_service.py` | SQL generation, summarization | Groq API |
| `database.py` | PostgreSQL operations | asyncpg |
| `schema_registry.py` | Metadata management | database |

## Security & Validation

### Frontend
- ✅ File type validation (CSV, XLS, XLSX only)
- ✅ Error handling with user feedback
- ✅ Loading states during async operations

### Backend
- ✅ SQL injection prevention (parameterized queries)
- ✅ SQL validation (SELECT only, no DROP/DELETE/etc)
- ✅ File size limits (50MB max)
- ✅ Type validation (Pydantic models)
- ✅ Error handling with detailed messages
