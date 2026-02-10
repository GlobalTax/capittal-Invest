import { useEffect } from "react";

interface MetaProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export const Meta = ({
  title,
  description,
  keywords,
  ogImage = "/og-image.png",
  canonicalUrl,
}: MetaProps) => {
  useEffect(() => {
    // Update title
    document.title = `${title} | Capittal Invest`;

    // Update meta tags
    const metaTags = [
      { name: "description", content: description },
      { property: "og:title", content: `${title} | Capittal Invest` },
      { property: "og:description", content: description },
      { property: "og:image", content: ogImage },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${title} | Capittal Invest` },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ];

    if (keywords) {
      metaTags.push({ name: "keywords", content: keywords });
    }

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let element = document.querySelector(selector);
      
      if (!element) {
        element = document.createElement("meta");
        if (name) element.setAttribute("name", name);
        if (property) element.setAttribute("property", property);
        document.head.appendChild(element);
      }
      
      element.setAttribute("content", content);
    });

    // Update canonical
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }
  }, [title, description, keywords, ogImage, canonicalUrl]);

  return null;
};
