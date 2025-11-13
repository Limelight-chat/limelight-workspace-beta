import { useState } from "react";
import { Send, Database, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
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
  "Which date has the most entries?",
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="border-border shadow-sm">
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="justify-between min-w-[200px]"
                  disabled={disabled || isLoading || tables.length === 0}
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span className="text-sm">{displayText}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[250px]">
                <DropdownMenuLabel>Select Tables</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={selectedCount === 0 || selectedCount === tables.length}
                  onCheckedChange={toggleAllTables}
                  className="font-medium"
                >
                  All tables
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {tables.map(table => (
                  <DropdownMenuCheckboxItem
                    key={table.id}
                    checked={selectedTableIds.includes(table.id)}
                    onCheckedChange={() => toggleTable(table.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{table.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {table.row_count.toLocaleString()}
                      </span>
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Textarea
            placeholder="Ask a question about your data in plain English..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            className="min-h-[140px] resize-none text-base"
          />
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Enter to submit • Shift + Enter for new line
            </p>
            <Button 
              onClick={handleSubmit}
              disabled={!query.trim() || disabled || isLoading}
              size="sm"
              className="gap-2"
            >
              {isLoading ? "Processing..." : "Submit"}
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2.5">Examples</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="sm"
                onClick={() => setQuery(example)}
                disabled={disabled || isLoading}
                className="text-xs h-7 px-3"
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
