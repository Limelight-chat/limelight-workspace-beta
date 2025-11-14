import { Download, Sparkles, Clock, AlertCircle } from "lucide-react";
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
    const headers = Object.keys(result.rows[0] || {});
    const csvContent = [
      headers.join(","),
      ...result.rows.map((row) =>
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
    <div className="space-y-6 animate-fade-in">
      {/* Results Table - Emphasized */}
      <div className="rounded-2xl overflow-hidden bg-white/[0.07] border-2 border-white/20 shadow-2xl">
        {/* Table Header with Stats */}
        <div className="p-5 bg-gradient-to-r from-white/10 to-white/5 border-b border-white/20 backdrop-blur-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ff7d0b] animate-pulse" />
                <span className="text-base font-medium text-white">
                  {result.total_rows.toLocaleString()} results
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/50" />
                <span className="text-sm text-white/70">
                  {result.execution_time.toFixed(2)}s
                </span>
              </div>
              {result.truncated && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                  <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="text-xs text-yellow-500/90 font-medium">Truncated</span>
                </div>
              )}
            </div>
            <Button 
              onClick={exportToCSV} 
              size="sm" 
              className="gap-2 bg-gradient-to-r from-[#ff7d0b] to-[#ed3558] hover:from-[#ff8c1f] hover:to-[#f04367] text-white border-0 shadow-lg"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                {Object.keys(result.rows[0] || {}).map((header) => (
                  <TableHead key={header} className="font-semibold text-white bg-white/5 h-12">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.rows.map((row, idx) => (
                <TableRow key={idx} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                  {Object.values(row).map((value, cellIdx) => (
                    <TableCell key={cellIdx} className="text-white/80 py-4">
                      {value === null ? (
                        <span className="text-white/30 italic">null</span>
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
      </div>

      {/* AI Summary */}
      {result.summary && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#ff7d0b]/10 to-transparent border border-[#ff7d0b]/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff7d0b] to-[#ed3558] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white mb-2">AI Insights</h3>
              <p className="text-sm text-white/70 leading-relaxed">{result.summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
