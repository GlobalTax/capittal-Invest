

## Plan: Mejorar Seccion ESG con Elementos Visuales

### Objetivo

Transformar la seccion ESG actual (basica con un solo icono y texto) en una experiencia visual rica que incluya iconos de los Objetivos de Desarrollo Sostenible (ODS), una linea de tiempo de compromisos ESG, y metricas de impacto animadas.

---

## Diseno Propuesto

### Estructura Visual Nueva

```text
+--------------------------------------------------+
|              INVERSION RESPONSABLE               |
|    Subtitulo y descripcion principal ESG         |
+--------------------------------------------------+
|                                                  |
|     [ODS 8]  [ODS 9]  [ODS 12]  [ODS 13]        |
|     Trabajo  Industria Consumo   Accion          |
|     Decente  Innovacion Responsable Climatica    |
|                                                  |
+--------------------------------------------------+
|              LINEA DE TIEMPO ESG                 |
|                                                  |
|  2020 -------- 2022 -------- 2024 -------- 2025 |
|    |            |             |              |   |
| Politica    Certificacion  Carbon        Nuevo   |
| ESG         B Corp         Neutral       Fondo   |
|                                                  |
+--------------------------------------------------+
|          METRICAS DE IMPACTO ESG                 |
|                                                  |
|   -30%         85%          100%         12      |
|  Emisiones   Participadas  Gobernanza  Empleos   |
|   CO2       con Plan ESG   Mejorada    Creados   |
|                                                  |
+--------------------------------------------------+
```

---

## Componentes a Crear

### 1. SDG Icons Grid (Iconos ODS)

Grid de iconos representando los ODS prioritarios usando iconos de Lucide:

| ODS | Icono Lucide | Color |
|-----|--------------|-------|
| ODS 8: Trabajo Decente | Briefcase | Rojo granate |
| ODS 9: Industria e Innovacion | Factory | Naranja |
| ODS 12: Consumo Responsable | Recycle | Mostaza |
| ODS 13: Accion Climatica | CloudSun | Verde |

Cada icono tendra:
- Animacion de entrada escalonada (stagger)
- Hover con escala y sombra
- Tooltip con nombre completo del ODS

### 2. Timeline de Compromisos ESG

Linea de tiempo horizontal con hitos:
- Nodos circulares conectados por linea
- Animacion secuencial de izquierda a derecha
- Cada nodo muestra anio y descripcion del compromiso

Hitos propuestos (hardcoded inicialmente, configurable via BD despues):
- 2020: Politica ESG Integrada
- 2022: Certificacion ESG
- 2024: Neutralidad de Carbono
- 2025: Fondo de Impacto

### 3. Metricas de Impacto ESG

Grid de 4 metricas con contadores animados:
- Reduccion emisiones CO2
- Participadas con plan ESG
- Mejoras en gobernanza
- Empleos creados

---

## Cambios a Implementar

### Archivo: src/pages/About.tsx

**Nuevos imports de iconos:**
```typescript
import { 
  // ... iconos existentes
  Briefcase, Factory, Recycle, CloudSun, 
  CheckCircle, Calendar, Sprout, BarChart3,
  TreeDeciduous, Handshake, Building2
} from 'lucide-react';
```

**Nuevo componente SDGCard:**
```typescript
// Tarjeta individual para cada ODS
const SDGCard = ({ 
  icon: Icon, 
  title, 
  description, 
  color,
  delay 
}: SDGCardProps) => (
  <AnimatedSection animation="scale-fade" delay={delay}>
    <div className="group text-center p-6 rounded-xl 
                    border border-border/50 hover:border-current 
                    transition-all hover:shadow-lg cursor-pointer"
         style={{ borderColor: color }}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-full 
                      flex items-center justify-center"
           style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
      <h4 className="font-medium text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </AnimatedSection>
);
```

**Nuevo componente ESGTimeline:**
```typescript
// Linea de tiempo de compromisos
const ESGTimeline = () => {
  const milestones = [
    { year: '2020', title: 'Politica ESG', desc: 'Integracion criterios' },
    { year: '2022', title: 'Certificacion', desc: 'Estandares internacionales' },
    { year: '2024', title: 'Carbon Neutral', desc: 'Huella cero' },
    { year: '2025', title: 'Fondo Impacto', desc: 'Inversion sostenible' },
  ];

  return (
    <div className="relative py-8">
      {/* Linea conectora */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 
                      bg-gradient-to-r from-green-300 to-green-600" />
      
      <div className="relative flex justify-between">
        {milestones.map((m, i) => (
          <AnimatedSection key={m.year} animation="scale-fade" delay={i * 150}>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 
                              ring-4 ring-green-100 mb-3" />
              <span className="text-lg font-semibold">{m.year}</span>
              <span className="text-sm font-medium">{m.title}</span>
              <span className="text-xs text-muted-foreground">{m.desc}</span>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
};
```

**Nuevo componente ESGMetric:**
```typescript
// Metrica individual ESG
const ESGMetric = ({ value, label, icon: Icon, delay }: ESGMetricProps) => (
  <AnimatedSection animation="fade-up" delay={delay}>
    <div className="text-center">
      <Icon className="w-8 h-8 mx-auto mb-3 text-green-600" />
      <AnimatedValue 
        value={value} 
        className="block text-3xl font-semibold text-foreground mb-1" 
      />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  </AnimatedSection>
);
```

**Seccion ESG actualizada:**
```typescript
{/* ESG Section - Mejorada */}
<section className="py-24 bg-gradient-to-b from-green-50 to-background 
                    dark:from-green-950/20 dark:to-background">
  <div className="container mx-auto px-4">
    {/* Header */}
    <AnimatedSection animation="fade-up" className="text-center mb-16">
      <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-2xl 
                      flex items-center justify-center">
        <Leaf className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-3xl md:text-4xl font-normal mb-4">{esg.title}</h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        {esg.subtitle}
      </p>
    </AnimatedSection>

    {/* SDG Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20">
      {sdgItems.map((sdg, i) => (
        <SDGCard key={sdg.title} {...sdg} delay={i * 100} />
      ))}
    </div>

    {/* Timeline */}
    <AnimatedSection animation="fade-up" className="mb-20">
      <h3 className="text-center text-xl font-normal mb-8">
        Nuestro Camino ESG
      </h3>
      <ESGTimeline />
    </AnimatedSection>

    {/* Impact Metrics */}
    <div className="bg-white/50 dark:bg-card/50 rounded-2xl p-8 max-w-4xl mx-auto">
      <h3 className="text-center text-xl font-normal mb-8">
        Impacto Medible
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {esgMetrics.map((metric, i) => (
          <ESGMetric key={metric.label} {...metric} delay={i * 100} />
        ))}
      </div>
    </div>
  </div>
</section>
```

---

## Datos Estaticos Iniciales

### SDG Items
```typescript
const sdgItems = [
  { 
    icon: Briefcase, 
    title: 'ODS 8', 
    description: 'Trabajo Decente', 
    color: '#a21942' 
  },
  { 
    icon: Factory, 
    title: 'ODS 9', 
    description: 'Industria e Innovacion', 
    color: '#fd6925' 
  },
  { 
    icon: Recycle, 
    title: 'ODS 12', 
    description: 'Consumo Responsable', 
    color: '#bf8b2e' 
  },
  { 
    icon: TreeDeciduous, 
    title: 'ODS 13', 
    description: 'Accion Climatica', 
    color: '#3f7e44' 
  },
];
```

### ESG Metrics
```typescript
const esgMetrics = [
  { value: '-30%', label: 'Reduccion CO2', icon: CloudSun },
  { value: '85%', label: 'Participadas con Plan ESG', icon: CheckCircle },
  { value: '100%', label: 'Gobernanza Mejorada', icon: Building2 },
  { value: '+500', label: 'Empleos Creados', icon: Users },
];
```

---

## Archivos Afectados

| Archivo | Cambio |
|---------|--------|
| `src/pages/About.tsx` | Añadir componentes SDGCard, ESGTimeline, ESGMetric y rediseñar seccion ESG completa |

---

## Resultado Visual Esperado

1. **Seccion Hero ESG**: Fondo degradado verde suave con icono grande centrado
2. **Grid ODS**: 4 tarjetas con iconos en colores oficiales ONU, animacion scale-fade escalonada
3. **Timeline**: Linea horizontal con 4 nodos que aparecen secuencialmente
4. **Metricas**: 4 contadores animados con iconos representativos

Todas las animaciones se activan al hacer scroll y solo ocurren una vez para mantener profesionalismo.

