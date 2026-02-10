import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { VideoUpload } from '@/components/admin/VideoUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, RotateCcw, Image, Video } from 'lucide-react';

interface HomeContent {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  video_url: string | null;
  value: string | null;
  label: string | null;
  display_order: number;
  is_active: boolean;
}

interface HeroFormData {
  title: string;
  subtitle: string;
  image_url: string;
  video_url: string;
  poster_image_url: string;
}

interface KpiFormData {
  id: string;
  section: string;
  value: string;
  label: string;
}

export function AdminHome() {
  const queryClient = useQueryClient();
  const [heroForm, setHeroForm] = useState<HeroFormData>({
    title: '',
    subtitle: '',
    image_url: '',
    video_url: '',
    poster_image_url: '',
  });
  const [kpis, setKpis] = useState<KpiFormData[]>([]);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroVideoFile, setHeroVideoFile] = useState<File | null>(null);
  const [heroPosterFile, setHeroPosterFile] = useState<File | null>(null);
  const [heroMediaType, setHeroMediaType] = useState<'image' | 'video'>('image');

  // Fetch home content
  const { data: homeContent, isLoading } = useQuery({
    queryKey: ['admin-home-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_content')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as HomeContent[];
    },
  });

  // Initialize form data when content loads
  useEffect(() => {
    if (homeContent) {
      const hero = homeContent.find(c => c.section === 'hero');
      if (hero) {
        setHeroForm({
          title: hero.title || '',
          subtitle: hero.subtitle || '',
          image_url: hero.image_url || '',
          video_url: hero.video_url || '',
          poster_image_url: hero.poster_image_url || '',
        });
        // Set initial tab based on existing content
        if (hero.video_url) {
          setHeroMediaType('video');
        }
      }

      const kpiItems = homeContent
        .filter(c => c.section.startsWith('kpi_'))
        .sort((a, b) => a.display_order - b.display_order)
        .map(k => ({
          id: k.id,
          section: k.section,
          value: k.value || '',
          label: k.label || '',
        }));
      setKpis(kpiItems);
    }
  }, [homeContent]);

  // Upload image to storage
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `hero-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('home-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('home-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Upload video to storage
  const uploadVideo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `hero-video-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('admin-videos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('admin-videos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Save hero mutation
  const saveHeroMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = heroForm.image_url;
      let videoUrl = heroForm.video_url;
      let posterUrl = heroForm.poster_image_url;

      // Upload new image if selected
      if (heroImageFile) {
        imageUrl = await uploadImage(heroImageFile);
      }

      // Upload new video if selected
      if (heroVideoFile) {
        videoUrl = await uploadVideo(heroVideoFile);
      }

      // Upload new poster if selected
      if (heroPosterFile) {
        posterUrl = await uploadImage(heroPosterFile);
      }

      // Clear the other media type if switching
      if (heroMediaType === 'video') {
        imageUrl = heroForm.image_url; // Keep image as fallback
      } else {
        videoUrl = ''; // Clear video when using image
        posterUrl = ''; // Clear poster when using image
      }

      const { error } = await supabase
        .from('home_content')
        .update({
          title: heroForm.title,
          subtitle: heroForm.subtitle,
          image_url: imageUrl,
          video_url: heroMediaType === 'video' ? videoUrl : null,
          poster_image_url: heroMediaType === 'video' ? posterUrl : null,
          updated_at: new Date().toISOString(),
        })
        .eq('section', 'hero');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-home-content'] });
      queryClient.invalidateQueries({ queryKey: ['home-content'] });
      setHeroImageFile(null);
      setHeroVideoFile(null);
      setHeroPosterFile(null);
      toast.success('Hero actualizado correctamente');
    },
    onError: (error) => {
      toast.error(`Error al guardar: ${error.message}`);
    },
  });

  // Save KPIs mutation
  const saveKpisMutation = useMutation({
    mutationFn: async () => {
      for (const kpi of kpis) {
        const { error } = await supabase
          .from('home_content')
          .update({
            value: kpi.value,
            label: kpi.label,
            updated_at: new Date().toISOString(),
          })
          .eq('id', kpi.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-home-content'] });
      queryClient.invalidateQueries({ queryKey: ['home-content'] });
      toast.success('KPIs actualizados correctamente');
    },
    onError: (error) => {
      toast.error(`Error al guardar: ${error.message}`);
    },
  });

  const handleImageChange = (url: string | null, file: File | null) => {
    if (file) {
      setHeroImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setHeroForm(prev => ({ ...prev, image_url: previewUrl }));
    } else if (url) {
      setHeroForm(prev => ({ ...prev, image_url: url }));
    } else {
      setHeroImageFile(null);
      setHeroForm(prev => ({ ...prev, image_url: '' }));
    }
  };

  const handleVideoChange = (url: string | null, file: File | null) => {
    if (file) {
      setHeroVideoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setHeroForm(prev => ({ ...prev, video_url: previewUrl }));
    } else if (url) {
      setHeroForm(prev => ({ ...prev, video_url: url }));
    } else {
      setHeroVideoFile(null);
      setHeroForm(prev => ({ ...prev, video_url: '' }));
    }
  };

  const resetHeroForm = () => {
    const hero = homeContent?.find(c => c.section === 'hero');
    if (hero) {
      setHeroForm({
        title: hero.title || '',
        subtitle: hero.subtitle || '',
        image_url: hero.image_url || '',
        video_url: hero.video_url || '',
        poster_image_url: hero.poster_image_url || '',
      });
      setHeroImageFile(null);
      setHeroVideoFile(null);
      setHeroPosterFile(null);
      setHeroMediaType(hero.video_url ? 'video' : 'image');
    }
  };

  const resetKpis = () => {
    if (homeContent) {
      const kpiItems = homeContent
        .filter(c => c.section.startsWith('kpi_'))
        .sort((a, b) => a.display_order - b.display_order)
        .map(k => ({
          id: k.id,
          section: k.section,
          value: k.value || '',
          label: k.label || '',
        }));
      setKpis(kpiItems);
    }
  };

  const updateKpi = (index: number, field: 'value' | 'label', newValue: string) => {
    setKpis(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: newValue };
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Página de Inicio</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona el contenido del Hero y los KPIs de la página principal.
        </p>
      </div>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Principal</CardTitle>
          <CardDescription>
            Edita el título, fondo (imagen o video) y texto del botón de vídeo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Título Principal</Label>
                <Input
                  id="hero-title"
                  value={heroForm.title}
                  onChange={(e) => setHeroForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Partners by nature"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Texto del Botón de Vídeo</Label>
                <Input
                  id="hero-subtitle"
                  value={heroForm.subtitle}
                  onChange={(e) => setHeroForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Ver el vídeo completo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fondo del Hero</Label>
              <Tabs value={heroMediaType} onValueChange={(v) => setHeroMediaType(v as 'image' | 'video')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Imagen
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="image" className="mt-4">
                  <ImageUpload
                    value={heroForm.image_url}
                    onChange={handleImageChange}
                  />
                </TabsContent>
                <TabsContent value="video" className="mt-4 space-y-4">
                  <VideoUpload
                    value={heroForm.video_url}
                    onChange={handleVideoChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    El video se reproducirá automáticamente en bucle, sin sonido.
                  </p>
                  
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium mb-2 block">Imagen Poster (fallback mientras carga)</Label>
                    <ImageUpload
                      value={heroForm.poster_image_url}
                      onChange={(url, file) => {
                        if (file) {
                          setHeroPosterFile(file);
                          const previewUrl = URL.createObjectURL(file);
                          setHeroForm(prev => ({ ...prev, poster_image_url: previewUrl }));
                        } else if (url) {
                          setHeroForm(prev => ({ ...prev, poster_image_url: url }));
                        } else {
                          setHeroPosterFile(null);
                          setHeroForm(prev => ({ ...prev, poster_image_url: '' }));
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Esta imagen se muestra mientras el video carga. Si no se especifica, se usa la imagen del hero.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => saveHeroMutation.mutate()}
              disabled={saveHeroMutation.isPending}
            >
              {saveHeroMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar Hero
            </Button>
            <Button variant="outline" onClick={resetHeroForm}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restablecer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores KPI</CardTitle>
          <CardDescription>
            Edita los valores y etiquetas de los indicadores de la sección "La Firma".
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {kpis.map((kpi, index) => (
              <div key={kpi.id} className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium text-sm text-muted-foreground">
                  KPI {index + 1}
                </h4>
                <div className="space-y-2">
                  <Label htmlFor={`kpi-value-${index}`}>Valor</Label>
                  <Input
                    id={`kpi-value-${index}`}
                    value={kpi.value}
                    onChange={(e) => updateKpi(index, 'value', e.target.value)}
                    placeholder="Ej: €2.5bn"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`kpi-label-${index}`}>Etiqueta</Label>
                  <Input
                    id={`kpi-label-${index}`}
                    value={kpi.label}
                    onChange={(e) => updateKpi(index, 'label', e.target.value)}
                    placeholder="Ej: Activos bajo Gestión"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => saveKpisMutation.mutate()}
              disabled={saveKpisMutation.isPending}
            >
              {saveKpisMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar KPIs
            </Button>
            <Button variant="outline" onClick={resetKpis}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restablecer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
