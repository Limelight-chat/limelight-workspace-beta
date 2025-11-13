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
    <Card className="backdrop-blur-sm bg-glass-bg/50 border-glass-border">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Ask a Question</h2>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Type your question in plain English..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            className="min-h-[120px] resize-none"
          />
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Press Enter to submit, Shift+Enter for new line
            </p>
            <Button 
              onClick={handleSubmit}
              disabled={!query.trim() || disabled || isLoading}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {isLoading ? "Processing..." : "Submit"}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-3">Example queries:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setQuery(example)}
                disabled={disabled || isLoading}
                className="text-xs"
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
