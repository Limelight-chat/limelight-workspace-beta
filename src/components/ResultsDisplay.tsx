import { Download, Code2, Info, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueryResult } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResultsDisplayProps {
  result: QueryResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const exportToCSV = () => {
    const headers = Object.keys(result.results[0] || {});
    const csvContent = [
      headers.join(","),
      ...result.results.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* SQL Query */}
      <Card className="backdrop-blur-sm bg-glass-bg/50 border-glass-border overflow-hidden">
        <div className="p-4 bg-muted border-b border-border">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            <h3 className="font-medium text-foreground">Generated SQL</h3>
          </div>
        </div>
        <div className="p-4 bg-code-bg">
          <pre className="text-sm text-white/90 overflow-x-auto">
            <code>{result.sql}</code>
          </pre>
        </div>
      </Card>

      {/* Metadata */}
      <Card className="p-4 backdrop-blur-sm bg-glass-bg/50 border-glass-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {result.total_rows.toLocaleString()} rows
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Executed in {result.execution_time.toFixed(2)}s
            </div>
            {result.is_truncated && (
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Results truncated</span>
              </div>
            )}
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Results Table */}
      <Card className="backdrop-blur-sm bg-glass-bg/50 border-glass-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(result.results[0] || {}).map((header) => (
                  <TableHead key={header} className="font-semibold">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.results.map((row, idx) => (
                <TableRow key={idx}>
                  {Object.values(row).map((value, cellIdx) => (
                    <TableCell key={cellIdx}>
                      {value === null ? (
                        <span className="text-muted-foreground italic">null</span>
                      ) : (
                        String(value)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* AI Summary */}
      {result.summary && (
        <Card className="p-6 backdrop-blur-sm bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground mb-2">AI Summary</h3>
              <p className="text-sm text-foreground/90 leading-relaxed">{result.summary}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10L12 3Z" fill="currentColor"/>
    </svg>
  );
}
