import { useCallback, useState } from "react";
import { Upload, File, CheckCircle, XCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export function FileUpload({ onUpload, isUploading }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    try {
      await onUpload(file);
      setUploadProgress(100);
      clearInterval(interval);
    } catch (error) {
      clearInterval(interval);
      setUploadProgress(0);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <Card className="backdrop-blur-sm bg-glass-bg/50 border-glass-border">
      <div
        {...getRootProps()}
        className={`p-12 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4 text-center">
          {isUploading ? (
            <>
              <File className="w-16 h-16 text-primary animate-pulse" />
              <div className="w-full max-w-xs space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium text-foreground">
                  {isDragActive ? "Drop your file here" : "Drag & drop your file here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse (CSV, Excel)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
