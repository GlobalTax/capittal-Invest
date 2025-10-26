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
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional(),
  logo_url: z.string().nullable().optional(),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  sector: z.string().min(1, 'Sector is required'),
  stage: z.string().min(1, 'Stage is required'),
  country: z.string().min(1, 'Country is required'),
  founded_year: z.number().int().min(1900).max(new Date().getFullYear()).nullable().optional(),
  investment_date: z.string().nullable().optional(),
  investment_thesis: z.string().min(20, 'Investment thesis must be at least 20 characters'),
  metrics: z.object({
    revenue: z.string().optional(),
    employees: z.string().optional(),
    valuation: z.string().optional(),
  }).optional(),
  timeline: z.array(z.object({
    date: z.string().min(1, 'Date is required'),
    event: z.string().min(1, 'Event is required'),
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
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div>
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            {...register('name')}
            onChange={handleNameChange}
            placeholder="Acme Inc."
          />
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="slug">URL Slug *</Label>
          <Input
            id="slug"
            {...register('slug')}
            placeholder="acme-inc"
          />
          {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Brief description of the company..."
            rows={3}
          />
        </div>

        <div>
          <Label>Company Logo</Label>
          <ImageUpload
            value={watch('logo_url')}
            onChange={(url, file) => {
              setValue('logo_url', url);
              setLogoFile(file);
            }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Company Details</h3>
        
        <div>
          <Label htmlFor="website_url">Website URL</Label>
          <Input
            id="website_url"
            {...register('website_url')}
            placeholder="https://example.com"
            type="url"
          />
          {errors.website_url && <p className="text-sm text-destructive mt-1">{errors.website_url.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sector">Sector *</Label>
            <Select onValueChange={(value) => setValue('sector', value)} defaultValue={watch('sector')}>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Consumer">Consumer</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
              </SelectContent>
            </Select>
            {errors.sector && <p className="text-sm text-destructive mt-1">{errors.sector.message}</p>}
          </div>

          <div>
            <Label htmlFor="stage">Stage *</Label>
            <Select onValueChange={(value) => setValue('stage', value)} defaultValue={watch('stage')}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Seed">Seed</SelectItem>
                <SelectItem value="Series A">Series A</SelectItem>
                <SelectItem value="Series B">Series B</SelectItem>
                <SelectItem value="Series C+">Series C+</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
                <SelectItem value="Exited">Exited</SelectItem>
              </SelectContent>
            </Select>
            {errors.stage && <p className="text-sm text-destructive mt-1">{errors.stage.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              {...register('country')}
              placeholder="United States"
            />
            {errors.country && <p className="text-sm text-destructive mt-1">{errors.country.message}</p>}
          </div>

          <div>
            <Label htmlFor="founded_year">Founded Year</Label>
            <Input
              id="founded_year"
              type="number"
              {...register('founded_year', { valueAsNumber: true })}
              placeholder="2020"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="investment_date">Investment Date</Label>
          <Input
            id="investment_date"
            type="date"
            {...register('investment_date')}
          />
        </div>
      </div>

      {/* Investment Thesis */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Investment Thesis *</h3>
        <Textarea
          {...register('investment_thesis')}
          placeholder="Why did we invest in this company?..."
          rows={5}
        />
        {errors.investment_thesis && <p className="text-sm text-destructive mt-1">{errors.investment_thesis.message}</p>}
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Key Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="metrics.revenue">Revenue</Label>
            <Input
              id="metrics.revenue"
              {...register('metrics.revenue')}
              placeholder="$10M ARR"
            />
          </div>
          <div>
            <Label htmlFor="metrics.employees">Employees</Label>
            <Input
              id="metrics.employees"
              {...register('metrics.employees')}
              placeholder="50+"
            />
          </div>
          <div>
            <Label htmlFor="metrics.valuation">Valuation</Label>
            <Input
              id="metrics.valuation"
              {...register('metrics.valuation')}
              placeholder="$100M"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Timeline</h3>
          <Button type="button" variant="outline" size="sm" onClick={addTimelineEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
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
                placeholder="Event description"
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

      {/* Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active</Label>
            <Switch
              id="is_active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_featured">Featured</Label>
            <Switch
              id="is_featured"
              checked={watch('is_featured')}
              onCheckedChange={(checked) => setValue('is_featured', checked)}
            />
          </div>
          <div>
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              {...register('display_order', { valueAsNumber: true })}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Company' : 'Create Company'}
        </Button>
      </div>
    </form>
  );
};
