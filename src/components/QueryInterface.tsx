import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface QueryInterfaceProps {
  onQuery: (query: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const EXAMPLE_QUERIES = [
  "Show me the first 10 rows",
  "What's the average value in the cost column?",
  "Find all records where status is 'active'",
  "Show me the total sum by category",
  "Which date has the most entries?",
];

export function QueryInterface({ onQuery, isLoading, disabled }: QueryInterfaceProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (query.trim() && !isLoading) {
      onQuery(query.trim());
    }
  };

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
