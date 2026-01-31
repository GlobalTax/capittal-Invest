import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Play } from 'lucide-react';
import { toast } from 'sonner';
import { VideoSlideshow } from '@/components/home/VideoSlideshow';

interface VideoSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
  ken_burns_direction: 'left' | 'right' | 'up' | 'center';
  created_at: string;
  updated_at: string;
}

interface SlideFormData {
  title: string;
  subtitle: string;
  image_url: string;
  is_active: boolean;
  ken_burns_direction: 'left' | 'right' | 'up' | 'center';
}

export function AdminVideoSlides() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<VideoSlide | null>(null);
  const [formData, setFormData] = useState<SlideFormData>({
    title: '',
    subtitle: '',
    image_url: '',
    is_active: true,
    ken_burns_direction: 'right',
  });

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ['admin-video-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_slides')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as VideoSlide[];
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('video-slides')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('video-slides')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async (data: SlideFormData) => {
      const maxOrder = Math.max(0, ...slides.map(s => s.display_order));
      const { error } = await supabase
        .from('video_slides')
        .insert({
          title: data.title,
          subtitle: data.subtitle || null,
          image_url: data.image_url,
          is_active: data.is_active,
          ken_burns_direction: data.ken_burns_direction,
          display_order: maxOrder + 1,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-video-slides'] });
      toast.success('Slide creado correctamente');
      resetForm();
    },
    onError: () => toast.error('Error al crear el slide'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SlideFormData> }) => {
      const { error } = await supabase
        .from('video_slides')
        .update({
          title: data.title,
          subtitle: data.subtitle || null,
          image_url: data.image_url,
          is_active: data.is_active,
          ken_burns_direction: data.ken_burns_direction,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-video-slides'] });
      toast.success('Slide actualizado correctamente');
      resetForm();
    },
    onError: () => toast.error('Error al actualizar el slide'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('video_slides')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-video-slides'] });
      toast.success('Slide eliminado correctamente');
    },
    onError: () => toast.error('Error al eliminar el slide'),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('video_slides')
        .update({ display_order: newOrder })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-video-slides'] });
    },
  });

  const moveSlide = (slide: VideoSlide, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === slide.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    
    const targetSlide = slides[targetIndex];
    
    // Swap orders
    reorderMutation.mutate({ id: slide.id, newOrder: targetSlide.display_order });
    reorderMutation.mutate({ id: targetSlide.id, newOrder: slide.display_order });
  };

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', image_url: '', is_active: true, ken_burns_direction: 'right' });
    setEditingSlide(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (slide: VideoSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      image_url: slide.image_url,
      is_active: slide.is_active,
      ken_burns_direction: slide.ken_burns_direction || 'right',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url) {
      toast.error('Título e imagen son obligatorios');
      return;
    }
    
    if (editingSlide) {
      updateMutation.mutate({ id: editingSlide.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImageChange = async (value: string | File | null) => {
    if (!value) {
      setFormData(prev => ({ ...prev, image_url: '' }));
      return;
    }
    
    if (value instanceof File) {
      try {
        const url = await uploadImage(value);
        setFormData(prev => ({ ...prev, image_url: url }));
        toast.success('Imagen subida correctamente');
      } catch {
        toast.error('Error al subir la imagen');
      }
    } else {
      setFormData(prev => ({ ...prev, image_url: value }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Video Slideshow</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las imágenes y textos del vídeo de la página principal
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 overflow-hidden">
              <VideoSlideshow autoPlay={true} onComplete={() => {}} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Añadir Slide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingSlide ? 'Editar Slide' : 'Nuevo Slide'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Décadas construyendo un legado..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Inversión con propósito"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Imagen *</Label>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={handleImageChange}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Activo</Label>
                </div>

                <div className="space-y-2">
                  <Label>Efecto Ken Burns</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['left', 'right', 'up', 'center'] as const).map((direction) => (
                      <Button
                        key={direction}
                        type="button"
                        variant={formData.ken_burns_direction === direction ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, ken_burns_direction: direction }))}
                        className="capitalize"
                      >
                        {direction === 'left' ? '← Izq' : 
                         direction === 'right' ? 'Der →' : 
                         direction === 'up' ? '↑ Arriba' : '⊕ Centro'}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dirección del movimiento de zoom cinematográfico
                  </p>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingSlide ? 'Guardar cambios' : 'Crear slide'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
      ) : slides.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay slides configurados. Añade el primero.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Orden</TableHead>
              <TableHead className="w-24">Imagen</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Subtítulo</TableHead>
              <TableHead className="w-20">Activo</TableHead>
              <TableHead className="w-32">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slides.map((slide, index) => (
              <TableRow key={slide.id} className={!slide.is_active ? 'opacity-50' : ''}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveSlide(slide, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <span className="text-center text-sm">{slide.display_order}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveSlide(slide, 'down')}
                      disabled={index === slides.length - 1}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-20 h-12 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="font-medium">{slide.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {slide.subtitle || '—'}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={slide.is_active}
                    onCheckedChange={(checked) => 
                      updateMutation.mutate({ id: slide.id, data: { ...slide, is_active: checked } })
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(slide)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm('¿Eliminar este slide?')) {
                          deleteMutation.mutate(slide.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
