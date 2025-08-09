import { useEffect } from "react";

interface SeoHeadProps {
  title: string;
  description: string;
  canonical?: string;
}

export function SeoHead({ title, description, canonical = "/" }: SeoHeadProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: "content" | "href", value: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
      if (!el) {
        if (selector.startsWith('meta')) {
          el = document.createElement('meta') as HTMLMetaElement;
          const nameMatch = /name="([^"]+)"/.exec(selector);
          const propMatch = /property="([^"]+)"/.exec(selector);
          if (nameMatch) el.setAttribute('name', nameMatch[1]);
          if (propMatch) el.setAttribute('property', propMatch[1]);
          document.head.appendChild(el);
        } else if (selector.startsWith('link')) {
          el = document.createElement('link') as HTMLLinkElement;
          const relMatch = /rel="([^"]+)"/.exec(selector);
          if (relMatch) el.setAttribute('rel', relMatch[1]);
          document.head.appendChild(el);
        }
      }
      if (el) (el as any).setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', canonical);
  }, [title, description, canonical]);

  return null;
}
