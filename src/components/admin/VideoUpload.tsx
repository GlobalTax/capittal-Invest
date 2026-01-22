import { useCallback, useState } from 'react';
import { Upload, X, Video, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface VideoUploadProps {
  value: string | null;
  onChange: (url: string | null, file: File | null) => void;
  onUploadProgress?: (progress: number) => void;
  className?: string;
}

export const VideoUpload = ({ value, onChange, onUploadProgress, className }: VideoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(value);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setError('Por favor selecciona un archivo de video (MP4, WebM, MOV)');
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('El archivo debe ser menor a 50MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploadProgress(100);
    onChange(null, file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setUploadProgress(0);
    onChange(null, null);
  }, [onChange, preview]);

  return (
    <div className={cn('space-y-4', className)}>
      {preview ? (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            <video
              src={preview}
              className="max-w-full max-h-full object-contain"
              controls
              muted
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
            'flex flex-col items-center justify-center min-h-[200px]'
          )}
        >
          <label htmlFor="video-upload" className="cursor-pointer w-full">
            <div className="flex flex-col items-center gap-2">
              {uploadProgress > 0 && uploadProgress < 100 ? (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground animate-pulse" />
                  <Progress value={uploadProgress} className="w-full max-w-xs" />
                  <p className="text-sm text-muted-foreground">Subiendo... {Math.round(uploadProgress)}%</p>
                </>
              ) : (
                <>
                  <Video className="h-10 w-10 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Arrastra el video aquí o haz clic para subir</p>
                    <p className="text-xs text-muted-foreground">
                      MP4, WebM o MOV (máx 50MB)
                    </p>
                  </div>
                </>
              )}
            </div>
            <input
              id="video-upload"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleFileInput}
            />
          </label>
        </div>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
