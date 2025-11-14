import { useState } from "react";
import { Send, Sparkles, Database, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TableInfo } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QueryInterfaceProps {
  onQuery: (query: string, tableIds: string[]) => void;
  isLoading: boolean;
  disabled?: boolean;
  tables: TableInfo[];
}

const EXAMPLE_QUERIES = [
  "Show me the first 10 rows",
  "What's the average value in the cost column?",
  "Find all records where status is 'active'",
  "Show me the total sum by category",
];

export function QueryInterface({ onQuery, isLoading, disabled, tables }: QueryInterfaceProps) {
  const [query, setQuery] = useState("");
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);

  const handleSubmit = () => {
    if (query.trim() && !isLoading) {
      onQuery(query.trim(), selectedTableIds);
    }
  };

  const toggleTable = (tableId: string) => {
    setSelectedTableIds(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const toggleAllTables = () => {
    setSelectedTableIds(prev => 
      prev.length === tables.length ? [] : tables.map(t => t.id)
    );
  };

  const selectedCount = selectedTableIds.length;
  const displayText = selectedCount === 0 
    ? "All tables" 
    : selectedCount === 1 
    ? tables.find(t => t.id === selectedTableIds[0])?.name || "1 table"
    : `${selectedCount} tables`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.metaKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Table Selection */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="justify-between min-w-[200px] bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
              disabled={disabled || isLoading || tables.length === 0}
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="text-sm">{displayText}</span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[250px] bg-[#1a1a1a] border-white/10">
            <DropdownMenuLabel className="text-white/60">Select Tables</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuCheckboxItem
              checked={selectedCount === 0 || selectedCount === tables.length}
              onCheckedChange={toggleAllTables}
              className="font-medium text-white hover:bg-white/10"
            >
              All tables
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator className="bg-white/10" />
            {tables.map(table => (
              <DropdownMenuCheckboxItem
                key={table.id}
                checked={selectedTableIds.includes(table.id)}
                onCheckedChange={() => toggleTable(table.id)}
                className="text-white hover:bg-white/10"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{table.name}</span>
                  <span className="text-xs text-white/40 ml-2">
                    {table.row_count.toLocaleString()}
                  </span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Query Input - OpenAI Style */}
      <div className="relative">
        <Textarea
          placeholder="Ask anything about your data..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          className="min-h-[120px] resize-none text-base bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 transition-colors pr-12"
        />
        <Button
          onClick={handleSubmit}
          disabled={!query.trim() || disabled || isLoading}
          size="icon"
          className="absolute bottom-3 right-3 rounded-lg bg-gradient-to-r from-[#ff7d0b] to-[#ed3558] hover:from-[#ff8c1f] hover:to-[#f04367] text-white border-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Examples */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Sparkles className="w-3 h-3" />
          <span>Try these examples</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {EXAMPLE_QUERIES.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(example)}
              disabled={disabled || isLoading}
              className="text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white/70 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
