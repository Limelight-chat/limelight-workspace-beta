import { Database, Trash2, ChevronDown, ChevronRight } from "lucide-react";
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
      <div className="rounded-2xl p-12 text-center bg-white/5 border border-white/10">
        <Database className="w-12 h-12 mx-auto mb-4 text-white/20" />
        <p className="text-white/60">No tables yet</p>
        <p className="text-sm text-white/40 mt-1">Upload a file to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tables.map((table) => {
        const isSelected = selectedTableId === table.id;
        
        return (
          <div
            key={table.id}
            className={`rounded-xl p-4 transition-all border ${
              isSelected
                ? "bg-white/10 border-white/20"
                : "bg-white/5 border-white/10 hover:bg-white/[0.07]"
            }`}
          >
            <div 
              className="flex items-start justify-between gap-3 cursor-pointer"
              onClick={() => onSelect(table)}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff7d0b] to-[#ed3558] flex items-center justify-center flex-shrink-0">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-white truncate">{table.name}</h3>
                  <p className="text-sm text-white/50">
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
                      className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1a1a1a] border-white/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Delete Table</AlertDialogTitle>
                      <AlertDialogDescription className="text-white/60">
                        Are you sure you want to delete "{table.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(table.id)}
                        className="bg-red-500 text-white hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                {isSelected ? (
                  <ChevronDown className="w-4 h-4 text-white/40" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white/40" />
                )}
              </div>
            </div>
            
            {isSelected && table.columns.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-xs font-medium text-white/60 mb-3 uppercase tracking-wide">Schema</h4>
                <div className="space-y-2">
                  {table.columns.map((col, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm px-2 py-1.5 rounded-lg bg-white/5">
                      <span className="text-white/90">{col.name}</span>
                      <span className="text-white/40 font-mono text-xs bg-white/5 px-2 py-0.5 rounded">
                        {col.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
