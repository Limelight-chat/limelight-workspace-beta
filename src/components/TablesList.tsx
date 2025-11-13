import { Table2, Trash2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableInfo } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TablesListProps {
  tables: TableInfo[];
  onDelete: (id: string) => void;
  onSelect: (table: TableInfo) => void;
  selectedTableId?: string;
}

export function TablesList({ tables, onDelete, onSelect, selectedTableId }: TablesListProps) {
  if (tables.length === 0) {
    return (
      <Card className="p-8 text-center backdrop-blur-sm bg-glass-bg/50 border-glass-border">
        <Table2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No tables uploaded yet</p>
        <p className="text-sm text-muted-foreground mt-1">Upload a file to get started</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {tables.map((table) => (
        <Card
          key={table.id}
          className={`p-4 cursor-pointer transition-all backdrop-blur-sm bg-glass-bg/50 hover:bg-glass-bg/80 ${
            selectedTableId === table.id ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => onSelect(table)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Table2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-foreground truncate">{table.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {table.row_count.toLocaleString()} rows · {table.columns.length} columns
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <AlertDialog>
                <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Table</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{table.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(table.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          
          {selectedTableId === table.id && table.columns.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-2">Schema</h4>
              <div className="space-y-1">
                {table.columns.map((col, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{col.name}</span>
                    <span className="text-muted-foreground font-mono text-xs">{col.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
