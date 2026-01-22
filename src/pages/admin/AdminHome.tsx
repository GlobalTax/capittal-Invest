import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Loader2, Save, RotateCcw } from 'lucide-react';

interface HomeContent {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  value: string | null;
  label: string | null;
  display_order: number;
  is_active: boolean;
}

interface HeroFormData {
  title: string;
  subtitle: string;
  image_url: string;
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
  });
  const [kpis, setKpis] = useState<KpiFormData[]>([]);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

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
        });
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

  // Save hero mutation
  const saveHeroMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = heroForm.image_url;

      // Upload new image if selected
      if (heroImageFile) {
        imageUrl = await uploadImage(heroImageFile);
      }

      const { error } = await supabase
        .from('home_content')
        .update({
          title: heroForm.title,
          subtitle: heroForm.subtitle,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('section', 'hero');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-home-content'] });
      queryClient.invalidateQueries({ queryKey: ['home-content'] });
      setHeroImageFile(null);
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

  const handleImageChange = (value: string | File | null) => {
    if (value instanceof File) {
      setHeroImageFile(value);
      // Create preview URL
      const previewUrl = URL.createObjectURL(value);
      setHeroForm(prev => ({ ...prev, image_url: previewUrl }));
    } else if (typeof value === 'string') {
      setHeroForm(prev => ({ ...prev, image_url: value }));
    } else {
      setHeroImageFile(null);
      setHeroForm(prev => ({ ...prev, image_url: '' }));
    }
  };

  const resetHeroForm = () => {
    const hero = homeContent?.find(c => c.section === 'hero');
    if (hero) {
      setHeroForm({
        title: hero.title || '',
        subtitle: hero.subtitle || '',
        image_url: hero.image_url || '',
      });
      setHeroImageFile(null);
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
            Edita el título, imagen de fondo y texto del botón de vídeo.
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
              <Label>Imagen de Fondo</Label>
              <ImageUpload
                value={heroForm.image_url}
                onChange={handleImageChange}
                className="h-48"
              />
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
