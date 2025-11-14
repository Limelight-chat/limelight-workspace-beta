import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUpload } from "@/components/FileUpload";
import { TablesList } from "@/components/TablesList";
import { QueryInterface } from "@/components/QueryInterface";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { api, TableInfo, QueryResult } from "@/lib/api";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

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
    mutationFn: ({ query, tableIds }: { query: string; tableIds?: string[] }) => 
      api.executeQuery(query, tableIds),
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
    // Pass tableIds directly to the API instead of modifying the query string
    await queryMutation.mutateAsync({ query, tableIds: tableIds.length > 0 ? tableIds : undefined });
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header - OpenAI Style */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff7d0b] to-[#ed3558]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Limelight Beta
              </h1>
            </div>
            <div className="text-sm text-white/40">
              Natural Language Data Analysis
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - OpenAI Style */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
              <h2 className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider">
                Data Sources
              </h2>
              <FileUpload
                onUpload={handleUpload}
                isUploading={uploadMutation.isPending}
              />
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
              <h2 className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider">
                Your Tables ({tables.length})
              </h2>
              <TablesList
                tables={tables}
                onDelete={(id) => deleteMutation.mutate(id)}
                onSelect={setSelectedTable}
                selectedTableId={selectedTable?.id}
              />
            </div>
          </div>

          {/* Main Content - OpenAI Style */}
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <QueryInterface
                onQuery={handleQuery}
                isLoading={queryMutation.isPending}
                disabled={tables.length === 0}
                tables={tables}
              />
            </div>

            {queryResult && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                <ResultsDisplay result={queryResult} />
              </div>
            )}

            {!queryResult && tables.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 mb-6">
                  <Sparkles className="w-8 h-8 text-white/30" />
                </div>
                <h3 className="text-xl font-semibold text-white/90 mb-2">
                  Get started with your data
                </h3>
                <p className="text-white/40 max-w-md mx-auto">
                  Upload a CSV or Excel file to begin analyzing your data with natural language queries
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
