const API_BASE_URL = "http://localhost:8000";

export interface TableInfo {
  id: string;
  name: string;
  row_count: number;
  columns: Array<{ name: string; type: string }>;
  created_at: string;
}

export interface QueryResult {
  sql: string;
  results: Record<string, any>[];
  total_rows: number;
  execution_time: number;
  is_truncated: boolean;
  summary?: string;
}

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

    return response.json();
  },

  getTables: async (): Promise<TableInfo[]> => {
    const response = await fetch(`${API_BASE_URL}/api/tables`);
    if (!response.ok) throw new Error("Failed to fetch tables");
    return response.json();
  },

  getTableSchema: async (id: string): Promise<TableInfo> => {
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

  executeQuery: async (query: string): Promise<QueryResult> => {
    const response = await fetch(`${API_BASE_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Query failed" }));
      throw new Error(error.detail || "Query failed");
    }

    return response.json();
  },
};
