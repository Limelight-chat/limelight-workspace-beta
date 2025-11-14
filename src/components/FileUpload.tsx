import { useCallback, useState } from "react";
import { Upload, Sparkles } from "lucide-react";
import { useDropzone } from "react-dropzone";
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
    <div
      {...getRootProps()}
      className={`relative overflow-hidden rounded-2xl p-12 transition-all cursor-pointer ${
        isDragActive 
          ? "bg-white/10 border-2 border-[#ff7d0b]" 
          : "bg-white/5 border-2 border-white/10 hover:bg-white/[0.07] hover:border-white/20"
      } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />
      
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff7d0b]/0 to-[#ff7d0b]/0 hover:from-[#ff7d0b]/5 hover:to-transparent transition-all pointer-events-none" />
      
      <div className="relative flex flex-col items-center space-y-6 text-center">
        {isUploading ? (
          <>
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff7d0b] to-[#ed3558] flex items-center justify-center animate-pulse">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="w-full max-w-xs space-y-3">
              <Progress value={uploadProgress} className="h-1.5 bg-white/10" />
              <p className="text-sm text-white/60">Processing your data...</p>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Upload className="w-10 h-10 text-white/40" />
              </div>
              {isDragActive && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff7d0b] to-[#ed3558] flex items-center justify-center">
                  <Upload className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">
                {isDragActive ? "Drop your file here" : "Upload your data"}
              </p>
              <p className="text-sm text-white/40">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-white/30">
                Supports CSV, XLSX, XLS
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
