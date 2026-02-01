import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Plus, Trash2 } from 'lucide-react';
import { CompanyFormData } from '@/types/portfolio';

const companySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'El slug debe ser en minúsculas con guiones'),
  description: z.string().optional(),
  logo_url: z.string().nullable().optional(),
  website_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  sector: z.string().min(1, 'El sector es obligatorio'),
  stage: z.string().min(1, 'La etapa es obligatoria'),
  country: z.string().min(1, 'El país es obligatorio'),
  founded_year: z.number().int().min(1900).max(new Date().getFullYear()).nullable().optional(),
  investment_date: z.string().nullable().optional(),
  investment_thesis: z.string().min(20, 'La tesis de inversión debe tener al menos 20 caracteres'),
  metrics: z.object({
    revenue: z.string().optional(),
    employees: z.string().optional(),
    valuation: z.string().optional(),
  }).optional(),
  timeline: z.array(z.object({
    date: z.string().min(1, 'La fecha es obligatoria'),
    event: z.string().min(1, 'El evento es obligatorio'),
  })).optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().default(0),
});

interface CompanyFormProps {
  initialData?: Partial<CompanyFormData>;
  onSubmit: (data: CompanyFormData, logoFile: File | null) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CompanyForm = ({ initialData, onSubmit, onCancel, isLoading }: CompanyFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      logo_url: initialData?.logo_url || null,
      website_url: initialData?.website_url || '',
      sector: initialData?.sector || '',
      stage: initialData?.stage || '',
      country: initialData?.country || '',
      founded_year: initialData?.founded_year || null,
      investment_date: initialData?.investment_date || null,
      investment_thesis: initialData?.investment_thesis || '',
      metrics: initialData?.metrics || { revenue: '', employees: '', valuation: '' },
      timeline: initialData?.timeline || [],
      is_active: initialData?.is_active ?? true,
      is_featured: initialData?.is_featured ?? false,
      display_order: initialData?.display_order || 0,
    },
  });

  const timeline = watch('timeline') || [];
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    if (!initialData?.slug) {
      setValue('slug', generateSlug(name));
    }
  };

  const addTimelineEvent = () => {
    setValue('timeline', [...timeline, { date: '', event: '' }]);
  };

  const removeTimelineEvent = (index: number) => {
    setValue('timeline', timeline.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: CompanyFormData) => {
    await onSubmit(data, logoFile);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Información Básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Información Básica</h3>
        
        <div>
          <Label htmlFor="name">Nombre de la Empresa *</Label>
          <Input
            id="name"
            {...register('name')}
            onChange={handleNameChange}
            placeholder="Acme S.L."
          />
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="slug">Slug de URL *</Label>
          <Input
            id="slug"
            {...register('slug')}
            placeholder="acme-sl"
          />
          {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Breve descripción de la empresa..."
            rows={3}
          />
        </div>

        <div>
          <Label>Logo de la Empresa</Label>
          <ImageUpload
            value={watch('logo_url')}
            onChange={(url, file) => {
              setValue('logo_url', url);
              setLogoFile(file);
            }}
          />
        </div>
      </div>

      {/* Detalles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Detalles de la Empresa</h3>
        
        <div>
          <Label htmlFor="website_url">Sitio Web</Label>
          <Input
            id="website_url"
            {...register('website_url')}
            placeholder="https://ejemplo.com"
            type="url"
          />
          {errors.website_url && <p className="text-sm text-destructive mt-1">{errors.website_url.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sector">Sector *</Label>
            <Select onValueChange={(value) => setValue('sector', value)} defaultValue={watch('sector')}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Servicios">Servicios</SelectItem>
                <SelectItem value="Food & Consumer">Food & Consumer</SelectItem>
                <SelectItem value="Industriales y Distribución">Industriales y Distribución</SelectItem>
              </SelectContent>
            </Select>
            {errors.sector && <p className="text-sm text-destructive mt-1">{errors.sector.message}</p>}
          </div>

          <div>
            <Label htmlFor="stage">Etapa *</Label>
            <Select onValueChange={(value) => setValue('stage', value)} defaultValue={watch('stage')}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Seed">Seed</SelectItem>
                <SelectItem value="Series A">Serie A</SelectItem>
                <SelectItem value="Series B">Serie B</SelectItem>
                <SelectItem value="Series C+">Serie C+</SelectItem>
                <SelectItem value="Growth">Crecimiento</SelectItem>
                <SelectItem value="Exited">Desinvertida</SelectItem>
              </SelectContent>
            </Select>
            {errors.stage && <p className="text-sm text-destructive mt-1">{errors.stage.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">País *</Label>
            <Input
              id="country"
              {...register('country')}
              placeholder="España"
            />
            {errors.country && <p className="text-sm text-destructive mt-1">{errors.country.message}</p>}
          </div>

          <div>
            <Label htmlFor="founded_year">Año de Fundación</Label>
            <Input
              id="founded_year"
              type="number"
              {...register('founded_year', { valueAsNumber: true })}
              placeholder="2020"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="investment_date">Fecha de Inversión</Label>
          <Input
            id="investment_date"
            type="date"
            {...register('investment_date')}
          />
        </div>
      </div>

      {/* Tesis de Inversión */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tesis de Inversión *</h3>
        <Textarea
          {...register('investment_thesis')}
          placeholder="¿Por qué invertimos en esta empresa?..."
          rows={5}
        />
        {errors.investment_thesis && <p className="text-sm text-destructive mt-1">{errors.investment_thesis.message}</p>}
      </div>

      {/* Métricas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Métricas Clave</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="metrics.revenue">Facturación</Label>
            <Input
              id="metrics.revenue"
              {...register('metrics.revenue')}
              placeholder="10M€ ARR"
            />
          </div>
          <div>
            <Label htmlFor="metrics.employees">Empleados</Label>
            <Input
              id="metrics.employees"
              {...register('metrics.employees')}
              placeholder="50+"
            />
          </div>
          <div>
            <Label htmlFor="metrics.valuation">Valoración</Label>
            <Input
              id="metrics.valuation"
              {...register('metrics.valuation')}
              placeholder="100M€"
            />
          </div>
        </div>
      </div>

      {/* Cronología */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Cronología</h3>
          <Button type="button" variant="outline" size="sm" onClick={addTimelineEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Evento
          </Button>
        </div>
        <div className="space-y-3">
          {timeline.map((_, index) => (
            <div key={index} className="flex gap-3 items-start">
              <Input
                {...register(`timeline.${index}.date`)}
                placeholder="2023-01"
                className="w-32"
              />
              <Input
                {...register(`timeline.${index}.event`)}
                placeholder="Descripción del evento"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTimelineEvent(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Estado */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Estado</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Activa</Label>
            <Switch
              id="is_active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_featured">Destacada</Label>
            <Switch
              id="is_featured"
              checked={watch('is_featured')}
              onCheckedChange={(checked) => setValue('is_featured', checked)}
            />
          </div>
          <div>
            <Label htmlFor="display_order">Orden de Visualización</Label>
            <Input
              id="display_order"
              type="number"
              {...register('display_order', { valueAsNumber: true })}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar Empresa' : 'Crear Empresa'}
        </Button>
      </div>
    </form>
  );
};
