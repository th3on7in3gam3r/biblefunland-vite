import { useEffect } from 'react';

function upsertMetaTag(attrName, attrValue, content) {
  let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function usePageMetadata({ title, description, image }) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | BibleFunLand`;
      upsertMetaTag('property', 'og:title', title);
      upsertMetaTag('name', 'twitter:title', title);
    }

    if (description) {
      upsertMetaTag('name', 'description', description);
      upsertMetaTag('property', 'og:description', description);
      upsertMetaTag('name', 'twitter:description', description);
    }

    const ogImage =
      image ||
      `https://api.dicebear.com/6.x/avataaars/svg?seed=${encodeURIComponent(
        title || 'BibleFunLand'
      )}&backgroundColor=blue`; // simple dynamic Bible-themed preview

    upsertMetaTag('property', 'og:image', ogImage);
    upsertMetaTag('name', 'twitter:image', ogImage);
    upsertMetaTag('property', 'og:type', 'website');
    upsertMetaTag('property', 'og:url', window.location.href);
    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
  }, [title, description, image]);
}
