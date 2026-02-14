import { useEffect } from "react";

interface MetaProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

const DEFAULT_OG_IMAGE = "/hero-investment.jpg";

export const Meta = ({
  title,
  description,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  canonicalUrl,
}: MetaProps) => {
  useEffect(() => {
    // Update title
    document.title = `${title} | Capittal Invest`;

    // Meta tags to set/update
    const metaTags: Array<{ name?: string; property?: string; content: string }> = [
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

    // Track elements created by this effect for cleanup
    const createdElements: HTMLElement[] = [];

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let element = document.querySelector(selector);

      if (!element) {
        element = document.createElement("meta");
        if (name) element.setAttribute("name", name);
        if (property) element.setAttribute("property", property);
        document.head.appendChild(element);
        createdElements.push(element as HTMLElement);
      }

      element.setAttribute("content", content);
    });

    // Update canonical
    let canonicalCreated = false;
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
        canonicalCreated = true;
      }
      canonical.href = canonicalUrl;
    }

    // Cleanup: remove elements created by this effect
    return () => {
      createdElements.forEach((el) => el.remove());
      if (canonicalCreated) {
        document.querySelector('link[rel="canonical"]')?.remove();
      }
    };
  }, [title, description, keywords, ogImage, canonicalUrl]);

  return null;
};
