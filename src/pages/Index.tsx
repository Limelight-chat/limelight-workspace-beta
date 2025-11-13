import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { FileUpload } from "@/components/FileUpload";
import { TablesList } from "@/components/TablesList";
import { QueryInterface } from "@/components/QueryInterface";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { api, TableInfo, QueryResult } from "@/lib/api";
import { toast } from "sonner";

const Index = () => {
  const [showHero, setShowHero] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
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

  const handleGetStarted = () => {
    setShowHero(false);
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleUpload = async (file: File) => {
    await uploadMutation.mutateAsync(file);
  };

  const handleQuery = async (query: string) => {
    if (tables.length === 0) {
      toast.error("Please upload a table first");
      return;
    }
    await queryMutation.mutateAsync(query);
  };

  return (
    <div className="min-h-screen bg-background">
      {showHero && <Hero onGetStarted={handleGetStarted} />}

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 animate-slide-in">
            <div ref={uploadRef}>
              <h2 className="text-2xl font-bold text-foreground mb-4">Upload Data</h2>
              <FileUpload
                onUpload={handleUpload}
                isUploading={uploadMutation.isPending}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Your Tables</h2>
              <TablesList
                tables={tables}
                onDelete={(id) => deleteMutation.mutate(id)}
                onSelect={setSelectedTable}
                selectedTableId={selectedTable?.id}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Query Your Data</h2>
              <QueryInterface
                onQuery={handleQuery}
                isLoading={queryMutation.isPending}
                disabled={tables.length === 0}
              />
            </div>

            {queryResult && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Results</h2>
                <ResultsDisplay result={queryResult} />
              </div>
            )}

            {!queryResult && tables.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Upload a file to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
