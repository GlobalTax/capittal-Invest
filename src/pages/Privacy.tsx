import { Meta } from "@/components/seo/Meta";
import { Overline } from "@/components/ui/typography";
import { getCanonicalUrl } from "@/lib/url";

const Privacy = () => {
  return (
    <>
      <Meta
        title="Política de Privacidad"
        description="Política de privacidad y protección de datos de Capittal Invest"
        canonicalUrl={getCanonicalUrl("/privacy")}
      />

      <div className="min-h-screen">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl mx-auto">
            <Overline className="mb-4">Legal</Overline>
            <h1 className="mb-8">Política de Privacidad</h1>

            <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
              <p>
                Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              <h2 className="text-foreground">1. Responsable del Tratamiento</h2>
              <p>
                Capittal Invest, S.L. (en adelante, "Capittal Invest") es el responsable del tratamiento 
                de los datos personales recabados a través de este sitio web.
              </p>

              <h2 className="text-foreground">2. Datos Personales Recogidos</h2>
              <p>
                Podemos recopilar los siguientes tipos de datos personales:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Datos de identificación: nombre, apellidos, email, teléfono</li>
                <li>Datos profesionales: empresa, cargo</li>
                <li>Datos de navegación: dirección IP, cookies, datos de uso del sitio</li>
              </ul>

              <h2 className="text-foreground">3. Finalidad del Tratamiento</h2>
              <p>
                Los datos personales se utilizan para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestionar las solicitudes de contacto</li>
                <li>Enviar comunicaciones comerciales (con consentimiento previo)</li>
                <li>Mejorar nuestros servicios y experiencia de usuario</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>

              <h2 className="text-foreground">4. Base Legal</h2>
              <p>
                El tratamiento de datos se realiza sobre la base del consentimiento del interesado, 
                la ejecución de un contrato o el interés legítimo del responsable.
              </p>

              <h2 className="text-foreground">5. Derechos del Usuario</h2>
              <p>
                El usuario tiene derecho a acceder, rectificar, suprimir sus datos, así como otros 
                derechos reconocidos en la normativa de protección de datos. Para ejercer estos 
                derechos, puede contactarnos en privacy@capittalinvest.com.
              </p>

              <h2 className="text-foreground">6. Conservación de Datos</h2>
              <p>
                Los datos personales se conservarán durante el tiempo necesario para cumplir con 
                la finalidad para la que fueron recabados y para determinar las posibles 
                responsabilidades que pudieran derivarse.
              </p>

              <h2 className="text-foreground">7. Seguridad</h2>
              <p>
                Capittal Invest ha adoptado las medidas técnicas y organizativas necesarias para 
                garantizar la seguridad de los datos personales y evitar su alteración, pérdida, 
                tratamiento o acceso no autorizado.
              </p>

              <h2 className="text-foreground">8. Contacto</h2>
              <p>
                Para cualquier consulta relacionada con nuestra política de privacidad, puede 
                contactarnos en: privacy@capittalinvest.com
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Privacy;
