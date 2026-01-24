import { Meta } from "@/components/seo/Meta";
import { Overline } from "@/components/ui/typography";

const Legal = () => {
  return (
    <>
      <Meta
        title="Aviso Legal"
        description="Aviso legal y condiciones de uso del sitio web de Capittal Invest"
        canonicalUrl={`${window.location.origin}/legal`}
      />

      <div className="min-h-screen">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl mx-auto">
            <Overline className="mb-4">Legal</Overline>
            <h1 className="mb-8">Aviso Legal</h1>

            <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
              <p>
                Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              <h2 className="text-foreground">1. Datos Identificativos</h2>
              <p>
                En cumplimiento del deber de información recogido en el artículo 10 de la 
                Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información 
                y del Comercio Electrónico, se exponen los datos identificativos del titular 
                de este sitio web:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Denominación social: Capittal Invest, S.L.</li>
                <li>Domicilio social: Madrid, España</li>
                <li>CIF: B-XXXXXXXX</li>
                <li>Email: info@capittalinvest.com</li>
              </ul>

              <h2 className="text-foreground">2. Objeto</h2>
              <p>
                Este sitio web tiene por objeto proporcionar información sobre los servicios 
                de inversión y gestión de capital privado ofrecidos por Capittal Invest.
              </p>

              <h2 className="text-foreground">3. Condiciones de Uso</h2>
              <p>
                El acceso a este sitio web atribuye la condición de usuario e implica la 
                aceptación plena de las presentes condiciones. El usuario se compromete a 
                hacer un uso adecuado del sitio web y de sus contenidos.
              </p>

              <h2 className="text-foreground">4. Propiedad Intelectual</h2>
              <p>
                Todos los contenidos de este sitio web, incluyendo textos, fotografías, 
                gráficos, imágenes, iconos, tecnología, software, así como su diseño gráfico 
                y códigos fuente, son propiedad intelectual de Capittal Invest o de terceros 
                que han autorizado su uso.
              </p>
              <p>
                Queda prohibida la reproducción, transformación, distribución, comunicación 
                pública, puesta a disposición del público y, en general, cualquier otra forma 
                de explotación, total o parcial, de los contenidos sin autorización expresa.
              </p>

              <h2 className="text-foreground">5. Exclusión de Responsabilidad</h2>
              <p>
                Capittal Invest no garantiza la continuidad, disponibilidad y utilidad del 
                sitio web. Se excluye cualquier responsabilidad por daños y perjuicios de 
                cualquier naturaleza que pudieran derivarse del uso del sitio web.
              </p>

              <h2 className="text-foreground">6. Información No Vinculante</h2>
              <p>
                La información contenida en este sitio web tiene carácter meramente informativo 
                y no constituye asesoramiento de inversión, legal o fiscal. Antes de tomar 
                cualquier decisión de inversión, le recomendamos consultar con un profesional.
              </p>

              <h2 className="text-foreground">7. Legislación Aplicable</h2>
              <p>
                Las presentes condiciones se regirán por la legislación española. Para la 
                resolución de cualquier controversia que pudiera derivarse del acceso al 
                sitio web, el usuario y Capittal Invest acuerdan someterse a los Juzgados 
                y Tribunales de Madrid.
              </p>

              <h2 className="text-foreground">8. Contacto</h2>
              <p>
                Para cualquier consulta sobre este aviso legal, puede contactarnos en: 
                legal@capittalinvest.com
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Legal;
