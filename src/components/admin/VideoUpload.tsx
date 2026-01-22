import { useCallback, useState } from 'react';
import { Upload, X, Video, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface VideoUploadProps {
  value: string | null;
  onChange: (url: string | null, file: File | null) => void;
  onUploadProgress?: (progress: number) => void;
  className?: string;
}

const VIDEO_GUIDELINES = {
  maxSize: 50, // MB
  recommendedFormats: ['MP4 (H.264)', 'WebM'],
  recommendedResolution: '1920x1080 (Full HD)',
  recommendedBitrate: '8-12 Mbps',
  recommendedDuration: '< 30 segundos',
  tips: [
    'Usa HandBrake (gratis) para comprimir videos antes de subir',
    'Formato MP4 con codec H.264 es el más compatible',
    'Reduce la resolución a 1080p si el original es 4K',
    'Bitrate de 8-12 Mbps ofrece buena calidad con tamaño razonable',
    'Videos cortos (< 30s) mejoran la experiencia del usuario',
  ],
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileSizeStatus = (bytes: number): 'good' | 'warning' | 'error' => {
  const mb = bytes / (1024 * 1024);
  if (mb <= 10) return 'good';
  if (mb <= 30) return 'warning';
  return 'error';
};

export const VideoUpload = ({ value, onChange, onUploadProgress, className }: VideoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(value);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setError('Por favor selecciona un archivo de video (MP4, WebM, MOV)');
      return;
    }

    // Validate file size (50MB)
    if (file.size > VIDEO_GUIDELINES.maxSize * 1024 * 1024) {
      setError(`El archivo debe ser menor a ${VIDEO_GUIDELINES.maxSize}MB. Consulta las guías de optimización.`);
      return;
    }

    // Store file info for display
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type,
    });

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
    setFileInfo(null);
    onChange(null, null);
  }, [onChange, preview]);

  const sizeStatus = fileInfo ? getFileSizeStatus(fileInfo.size) : null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Guidelines Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="guidelines" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-primary" />
              <span className="font-medium">Guías de optimización de video</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              {/* Recommended specs */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Formatos recomendados</p>
                  <p className="font-medium">{VIDEO_GUIDELINES.recommendedFormats.join(', ')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Resolución</p>
                  <p className="font-medium">{VIDEO_GUIDELINES.recommendedResolution}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Bitrate</p>
                  <p className="font-medium">{VIDEO_GUIDELINES.recommendedBitrate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Duración ideal</p>
                  <p className="font-medium">{VIDEO_GUIDELINES.recommendedDuration}</p>
                </div>
              </div>

              {/* Tips */}
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">Consejos para optimizar:</p>
                <ul className="space-y-1.5">
                  {VIDEO_GUIDELINES.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* External tool link */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm">
                  <strong>Herramienta gratuita:</strong>{' '}
                  <a 
                    href="https://handbrake.fr/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    HandBrake
                  </a>
                  {' '}es ideal para convertir y comprimir videos antes de subirlos.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {preview ? (
        <div className="relative space-y-3">
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            <video
              src={preview}
              className="max-w-full max-h-full object-contain"
              controls
              muted
            />
          </div>
          
          {/* File info display */}
          {fileInfo && (
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg text-sm",
              sizeStatus === 'good' && "bg-green-500/10 border border-green-500/20",
              sizeStatus === 'warning' && "bg-yellow-500/10 border border-yellow-500/20",
              sizeStatus === 'error' && "bg-red-500/10 border border-red-500/20",
            )}>
              {sizeStatus === 'good' && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
              {sizeStatus === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />}
              {sizeStatus === 'error' && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{fileInfo.name}</p>
                <p className="text-muted-foreground">
                  {formatFileSize(fileInfo.size)} • {fileInfo.type.split('/')[1].toUpperCase()}
                  {sizeStatus === 'warning' && ' • Considera comprimir para mejor rendimiento'}
                  {sizeStatus === 'error' && ' • Recomendamos comprimir este archivo'}
                </p>
              </div>
            </div>
          )}

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
                      MP4 (H.264) o WebM recomendados • Máx {VIDEO_GUIDELINES.maxSize}MB
                    </p>
                    <p className="text-xs text-primary">
                      Consulta las guías de optimización arriba ↑
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
