import { Link } from "react-router-dom";
import { Linkedin, Twitter } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-xl font-bold tracking-tight">Ethos Ventures</span>
            </Link>
            <p className="text-sm text-body max-w-md">
              A growth equity firm investing in exceptional companies across technology,
              consumer, education, and services sectors.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/strategy" className="text-sm text-body hover:text-foreground transition-smooth">
                  Strategy
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-sm text-body hover:text-foreground transition-smooth">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-sm text-body hover:text-foreground transition-smooth">
                  Team
                </Link>
              </li>
              <li>
                <Link to="/insights" className="text-sm text-body hover:text-foreground transition-smooth">
                  Insights
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body hover:text-foreground transition-smooth"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body hover:text-foreground transition-smooth"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-subtle">
            © {currentYear} Ethos Ventures. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
