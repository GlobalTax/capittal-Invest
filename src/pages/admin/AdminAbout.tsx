import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Save, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AboutContent {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  value: string | null;
  label: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

const ICON_OPTIONS = ['Target', 'TrendingUp', 'Users', 'Wallet', 'Briefcase', 'GitMerge', 'Clock', 'Leaf'];

export function AdminAbout() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [heroForm, setHeroForm] = useState({ title: '', subtitle: '' });
  const [kpis, setKpis] = useState<AboutContent[]>([]);
  const [strategies, setStrategies] = useState<AboutContent[]>([]);
  const [valueCreation, setValueCreation] = useState<AboutContent[]>([]);
  const [esgForm, setEsgForm] = useState({ title: '', subtitle: '', content: '' });

  const { data: content, isLoading } = useQuery({
    queryKey: ['admin-about-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as AboutContent[];
    },
  });

  useEffect(() => {
    if (content) {
      const hero = content.find(c => c.section === 'hero');
      if (hero) {
        setHeroForm({ title: hero.title || '', subtitle: hero.subtitle || '' });
      }

      const esg = content.find(c => c.section === 'esg');
      if (esg) {
        setEsgForm({ 
          title: esg.title || '', 
          subtitle: esg.subtitle || '', 
          content: esg.content || '' 
        });
      }

      setKpis(content.filter(c => c.section === 'kpi'));
      setStrategies(content.filter(c => c.section === 'strategy'));
      setValueCreation(content.filter(c => c.section === 'value_creation'));
    }
  }, [content]);

  const saveHeroMutation = useMutation({
    mutationFn: async () => {
      const hero = content?.find(c => c.section === 'hero');
      if (!hero) throw new Error('Hero not found');
      
      const { error } = await supabase
        .from('about_content')
        .update({ title: heroForm.title, subtitle: heroForm.subtitle })
        .eq('id', hero.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-content'] });
      queryClient.invalidateQueries({ queryKey: ['about-content'] });
      toast({ title: 'Hero guardado correctamente' });
    },
    onError: () => {
      toast({ title: 'Error al guardar', variant: 'destructive' });
    },
  });

  const saveKpisMutation = useMutation({
    mutationFn: async () => {
      for (const kpi of kpis) {
        const { error } = await supabase
          .from('about_content')
          .update({ 
            value: kpi.value, 
            label: kpi.label, 
            icon: kpi.icon,
            display_order: kpi.display_order 
          })
          .eq('id', kpi.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-content'] });
      queryClient.invalidateQueries({ queryKey: ['about-content'] });
      toast({ title: 'KPIs guardados correctamente' });
    },
    onError: () => {
      toast({ title: 'Error al guardar KPIs', variant: 'destructive' });
    },
  });

  const saveStrategiesMutation = useMutation({
    mutationFn: async () => {
      for (const strategy of strategies) {
        const { error } = await supabase
          .from('about_content')
          .update({ 
            title: strategy.title, 
            subtitle: strategy.subtitle, 
            content: strategy.content,
            icon: strategy.icon,
            display_order: strategy.display_order 
          })
          .eq('id', strategy.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-content'] });
      queryClient.invalidateQueries({ queryKey: ['about-content'] });
      toast({ title: 'Estrategias guardadas correctamente' });
    },
    onError: () => {
      toast({ title: 'Error al guardar estrategias', variant: 'destructive' });
    },
  });

  const saveValueCreationMutation = useMutation({
    mutationFn: async () => {
      for (const metric of valueCreation) {
        const { error } = await supabase
          .from('about_content')
          .update({ 
            value: metric.value, 
            label: metric.label, 
            content: metric.content,
            icon: metric.icon,
            display_order: metric.display_order 
          })
          .eq('id', metric.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-content'] });
      queryClient.invalidateQueries({ queryKey: ['about-content'] });
      toast({ title: 'Value Creation guardado correctamente' });
    },
    onError: () => {
      toast({ title: 'Error al guardar', variant: 'destructive' });
    },
  });

  const saveEsgMutation = useMutation({
    mutationFn: async () => {
      const esg = content?.find(c => c.section === 'esg');
      if (!esg) throw new Error('ESG not found');
      
      const { error } = await supabase
        .from('about_content')
        .update({ 
          title: esgForm.title, 
          subtitle: esgForm.subtitle, 
          content: esgForm.content 
        })
        .eq('id', esg.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-content'] });
      queryClient.invalidateQueries({ queryKey: ['about-content'] });
      toast({ title: 'ESG guardado correctamente' });
    },
    onError: () => {
      toast({ title: 'Error al guardar ESG', variant: 'destructive' });
    },
  });

  const updateKpi = (index: number, field: keyof AboutContent, value: string) => {
    setKpis(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateStrategy = (index: number, field: keyof AboutContent, value: string) => {
    setStrategies(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateValueCreation = (index: number, field: keyof AboutContent, value: string) => {
    setValueCreation(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestionar Página Sobre Nosotros</h1>
        <p className="text-muted-foreground mt-1">
          Edita el contenido de la página "Sobre Nosotros"
        </p>
      </div>

      <Accordion type="multiple" defaultValue={['hero']} className="space-y-4">
        {/* Hero Section */}
        <AccordionItem value="hero" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="font-semibold">Hero Principal</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                Título y subtítulo principal
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="hero-title">Título</Label>
                <Input
                  id="hero-title"
                  value={heroForm.title}
                  onChange={(e) => setHeroForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título principal..."
                />
              </div>
              <div>
                <Label htmlFor="hero-subtitle">Subtítulo</Label>
                <Textarea
                  id="hero-subtitle"
                  value={heroForm.subtitle}
                  onChange={(e) => setHeroForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Subtítulo descriptivo..."
                  rows={3}
                />
              </div>
              <Button 
                onClick={() => saveHeroMutation.mutate()}
                disabled={saveHeroMutation.isPending}
              >
                {saveHeroMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Hero
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* KPIs Section */}
        <AccordionItem value="kpis" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="font-semibold">KPIs de Impacto</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {kpis.length} métricas
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              {kpis.map((kpi, index) => (
                <Card key={kpi.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Valor</Label>
                      <Input
                        value={kpi.value || ''}
                        onChange={(e) => updateKpi(index, 'value', e.target.value)}
                        placeholder="€150M+"
                      />
                    </div>
                    <div>
                      <Label>Etiqueta</Label>
                      <Input
                        value={kpi.label || ''}
                        onChange={(e) => updateKpi(index, 'label', e.target.value)}
                        placeholder="Capital bajo gestión"
                      />
                    </div>
                    <div>
                      <Label>Icono</Label>
                      <select
                        value={kpi.icon || ''}
                        onChange={(e) => updateKpi(index, 'icon', e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      >
                        {ICON_OPTIONS.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Orden</Label>
                      <Input
                        type="number"
                        value={kpi.display_order}
                        onChange={(e) => updateKpi(index, 'display_order', e.target.value)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
              <Button 
                onClick={() => saveKpisMutation.mutate()}
                disabled={saveKpisMutation.isPending}
              >
                {saveKpisMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar KPIs
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Strategy Section */}
        <AccordionItem value="strategy" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="font-semibold">Estrategia de Inversión</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {strategies.length} bloques
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              {strategies.map((strategy, index) => (
                <Card key={strategy.id} className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Título</Label>
                        <Input
                          value={strategy.title || ''}
                          onChange={(e) => updateStrategy(index, 'title', e.target.value)}
                          placeholder="Empresas en transición"
                        />
                      </div>
                      <div>
                        <Label>Icono</Label>
                        <select
                          value={strategy.icon || ''}
                          onChange={(e) => updateStrategy(index, 'icon', e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        >
                          {ICON_OPTIONS.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label>Subtítulo</Label>
                      <Textarea
                        value={strategy.subtitle || ''}
                        onChange={(e) => updateStrategy(index, 'subtitle', e.target.value)}
                        placeholder="Descripción breve..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Contenido adicional</Label>
                      <Textarea
                        value={strategy.content || ''}
                        onChange={(e) => updateStrategy(index, 'content', e.target.value)}
                        placeholder="Contenido detallado..."
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
              <Button 
                onClick={() => saveStrategiesMutation.mutate()}
                disabled={saveStrategiesMutation.isPending}
              >
                {saveStrategiesMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Estrategias
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Value Creation Section */}
        <AccordionItem value="value-creation" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="font-semibold">Value Creation / Impacto</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {valueCreation.length} métricas
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              {valueCreation.map((metric, index) => (
                <Card key={metric.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Valor</Label>
                      <Input
                        value={metric.value || ''}
                        onChange={(e) => updateValueCreation(index, 'value', e.target.value)}
                        placeholder=">90%"
                      />
                    </div>
                    <div>
                      <Label>Etiqueta</Label>
                      <Input
                        value={metric.label || ''}
                        onChange={(e) => updateValueCreation(index, 'label', e.target.value)}
                        placeholder="Crecimiento EBITDA"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Descripción</Label>
                      <Input
                        value={metric.content || ''}
                        onChange={(e) => updateValueCreation(index, 'content', e.target.value)}
                        placeholder="Crecimiento medio de EBITDA..."
                      />
                    </div>
                  </div>
                </Card>
              ))}
              <Button 
                onClick={() => saveValueCreationMutation.mutate()}
                disabled={saveValueCreationMutation.isPending}
              >
                {saveValueCreationMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Value Creation
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ESG Section */}
        <AccordionItem value="esg" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="font-semibold">ESG / Inversión Responsable</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="esg-title">Título</Label>
                <Input
                  id="esg-title"
                  value={esgForm.title}
                  onChange={(e) => setEsgForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Inversión Responsable"
                />
              </div>
              <div>
                <Label htmlFor="esg-subtitle">Subtítulo</Label>
                <Textarea
                  id="esg-subtitle"
                  value={esgForm.subtitle}
                  onChange={(e) => setEsgForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Breve descripción..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="esg-content">Contenido</Label>
                <Textarea
                  id="esg-content"
                  value={esgForm.content}
                  onChange={(e) => setEsgForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Descripción detallada de la política ESG..."
                  rows={4}
                />
              </div>
              <Button 
                onClick={() => saveEsgMutation.mutate()}
                disabled={saveEsgMutation.isPending}
              >
                {saveEsgMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar ESG
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
