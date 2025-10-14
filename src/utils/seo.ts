type Product = {
  id: number;
  name: string;
  slug: string;
  category_type: string;
  db_fit: string;
  first_class_neon: boolean;
  first_class_supabase: boolean;
  oss: boolean;
  avg_rating: number;
  vote_count: number;
  tags: string | null;
  overview_short: string | null;
  pros_short: string | null;
  cons_short: string | null;
  difficulty_hint?: number;
  complexity_hint?: number;
  url?: string | null;
  pricing_model?: string | null;
};

export function generateProductStructuredData(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.overview_short || `${product.name} - ${product.category_type}`,
    applicationCategory: product.category_type,
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: product.pricing_model === 'free' ? '0' : undefined,
      priceCurrency: 'USD',
    },
    aggregateRating: product.vote_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.avg_rating.toFixed(1),
      reviewCount: product.vote_count,
      bestRating: '5',
      worstRating: '1',
    } : undefined,
    featureList: product.tags?.split(';').map(tag => tag.trim()).join(', '),
    softwareHelp: {
      '@type': 'CreativeWork',
      text: product.pros_short || undefined,
    },
  };
}

export function generateWebsiteStructuredData(products: Product[]) {
  const topRatedProducts = products
    .filter(p => p.vote_count > 0)
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, 10);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VibeList',
    description: 'The comprehensive directory of AI-powered development tools and vibecoding platforms',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://vibelist.app',
    publisher: {
      '@type': 'Organization',
      name: 'metability.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lovable.dev/opengraph-image-p98pqg.png',
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: typeof window !== 'undefined' 
          ? `${window.location.origin}/?search={search_term_string}`
          : 'https://vibelist.app/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: topRatedProducts.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: product.name,
          description: product.overview_short,
          url: typeof window !== 'undefined'
            ? `${window.location.origin}/p/${product.slug}`
            : `https://vibelist.app/p/${product.slug}`,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.avg_rating.toFixed(1),
            reviewCount: product.vote_count,
          },
        },
      })),
    },
  };
}

export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
