import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUpload } from "@/components/FileUpload";
import { TablesList } from "@/components/TablesList";
import { QueryInterface } from "@/components/QueryInterface";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { api, TableInfo, QueryResult } from "@/lib/api";
import { toast } from "sonner";
import { Database } from "lucide-react";

const Index = () => {
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const queryClient = useQueryClient();

  const { data: tables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: api.getTables,
  });

  const uploadMutation = useMutation({
    mutationFn: api.uploadFile,
    onSuccess: (data) => {
      toast.success(`Successfully uploaded ${data.name}`, {
        description: `${data.row_count.toLocaleString()} rows imported`,
      });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
    onError: (error: Error) => {
      toast.error("Upload failed", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteTable,
    onSuccess: () => {
      toast.success("Table deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      if (selectedTable && tables.find((t) => t.id === selectedTable.id)) {
        setSelectedTable(null);
      }
    },
    onError: (error: Error) => {
      toast.error("Delete failed", { description: error.message });
    },
  });

  const queryMutation = useMutation({
    mutationFn: api.executeQuery,
    onSuccess: (data) => {
      setQueryResult(data);
      toast.success("Query executed successfully");
    },
    onError: (error: Error) => {
      toast.error("Query failed", { description: error.message });
    },
  });

  const handleUpload = async (file: File) => {
    await uploadMutation.mutateAsync(file);
  };

  const handleQuery = async (query: string, tableIds: string[]) => {
    if (tables.length === 0) {
      toast.error("Please upload a table first");
      return;
    }
    const queryWithContext = tableIds.length > 0 
      ? `[Using tables: ${tableIds.map(id => tables.find(t => t.id === id)?.name).join(", ")}] ${query}`
      : query;
    await queryMutation.mutateAsync(queryWithContext);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
              <Database className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Natural Language Query Service</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Upload Data</h2>
              <FileUpload
                onUpload={handleUpload}
                isUploading={uploadMutation.isPending}
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Your Tables</h2>
              <TablesList
                tables={tables}
                onDelete={(id) => deleteMutation.mutate(id)}
                onSelect={setSelectedTable}
                selectedTableId={selectedTable?.id}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <QueryInterface
                onQuery={handleQuery}
                isLoading={queryMutation.isPending}
                disabled={tables.length === 0}
                tables={tables}
              />
            </div>

            {queryResult && (
              <div>
                <ResultsDisplay result={queryResult} />
              </div>
            )}

            {!queryResult && tables.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Upload a file to get started with natural language queries</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
