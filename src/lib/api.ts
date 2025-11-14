const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Backend response types
export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
}

export interface TableMetadata {
  id: string;
  table_name: string;
  original_filename: string;
  uploaded_at: string;
  row_count: number;
}

export interface UploadResult {
  table_ids: string[];
  tables: TableMetadata[];
  rows_imported: number;
}

export interface TableSchema {
  id: string;
  table_name: string;
  columns: ColumnDefinition[];
}

// Frontend display types (transformed from backend)
export interface TableInfo {
  id: string;
  name: string;
  row_count: number;
  columns: Array<{ name: string; type: string }>;
  created_at: string;
}

export interface QueryResult {
  sql: string;
  rows: Record<string, any>[];
  total_rows: number;
  execution_time: number;
  truncated: boolean;
  summary?: string;
}

// Helper function to transform backend TableMetadata to frontend TableInfo
const transformTableMetadata = (table: TableMetadata, columns?: ColumnDefinition[]): TableInfo => ({
  id: table.id,
  name: table.original_filename,
  row_count: table.row_count,
  columns: columns?.map(col => ({ name: col.name, type: col.type })) || [],
  created_at: table.uploaded_at,
});

export const api = {
  uploadFile: async (file: File): Promise<TableInfo> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(error.detail || "Upload failed");
    }

    const result: UploadResult = await response.json();
    
    // Return the first table from the upload result
    // Fetch its schema to get columns
    if (result.tables.length > 0) {
      const firstTable = result.tables[0];
      try {
        const schema = await api.getTableSchema(firstTable.id);
        return transformTableMetadata(firstTable, schema.columns);
      } catch {
        // If schema fetch fails, return without columns
        return transformTableMetadata(firstTable);
      }
    }
    
    throw new Error("No tables were created from the upload");
  },

  getTables: async (): Promise<TableInfo[]> => {
    const response = await fetch(`${API_BASE_URL}/api/tables`);
    if (!response.ok) throw new Error("Failed to fetch tables");
    
    const tables: TableMetadata[] = await response.json();
    
    // Fetch schemas for all tables to get column information
    const tablesWithColumns = await Promise.all(
      tables.map(async (table) => {
        try {
          const schema = await api.getTableSchema(table.id);
          return transformTableMetadata(table, schema.columns);
        } catch {
          return transformTableMetadata(table);
        }
      })
    );
    
    return tablesWithColumns;
  },

  getTableSchema: async (id: string): Promise<TableSchema> => {
    const response = await fetch(`${API_BASE_URL}/api/tables/${id}`);
    if (!response.ok) throw new Error("Failed to fetch table schema");
    return response.json();
  },

  deleteTable: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/tables/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete table");
  },

  executeQuery: async (query: string, tableIds?: string[]): Promise<QueryResult> => {
    const response = await fetch(`${API_BASE_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query,
        table_ids: tableIds || null
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Query failed" }));
      throw new Error(error.detail || "Query failed");
    }

    return response.json();
  },
};

