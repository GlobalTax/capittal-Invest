import { Link } from "react-router-dom";
import { Linkedin } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    firma: [
      { name: "La Firma", href: "/team" },
      { name: "Equipo", href: "/team" },
      { name: "Sostenibilidad", href: "/sectors" },
    ],
    estrategias: [
      { name: "Buy-outs", href: "/strategy" },
      { name: "Impacto", href: "/strategy" },
      { name: "Capital a largo plazo", href: "/strategy" },
    ],
    portfolio: [
      { name: "Compañías participadas", href: "/portfolio" },
      { name: "Noticias", href: "/news" },
      { name: "Contacto", href: "/contact" },
    ],
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-serif font-medium">
                Capittal Invest
              </span>
            </Link>
            <p className="text-background/70 max-w-sm leading-relaxed mb-8">
              Una firma de capital privado especializada en invertir y desarrollar 
              compañías familiares y el middle-market en el sur de Europa.
            </p>
            <div className="flex gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-background/30 flex items-center justify-center text-background/70 hover:text-background hover:border-background transition-smooth"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* La Firma */}
          <div>
            <h3 className="text-sm font-medium uppercase tracking-widest mb-6">
              La Firma
            </h3>
            <ul className="space-y-4">
              {footerLinks.firma.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-background/70 hover:text-background transition-smooth"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Estrategias */}
          <div>
            <h3 className="text-sm font-medium uppercase tracking-widest mb-6">
              Estrategias
            </h3>
            <ul className="space-y-4">
              {footerLinks.estrategias.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-background/70 hover:text-background transition-smooth"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portfolio */}
          <div>
            <h3 className="text-sm font-medium uppercase tracking-widest mb-6">
              Portfolio
            </h3>
            <ul className="space-y-4">
              {footerLinks.portfolio.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-background/70 hover:text-background transition-smooth"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-16 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © {currentYear} Capittal Invest. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-background/50 hover:text-background transition-smooth">
              Política de privacidad
            </Link>
            <Link to="/legal" className="text-sm text-background/50 hover:text-background transition-smooth">
              Aviso legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
