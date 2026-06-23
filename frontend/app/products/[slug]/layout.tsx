import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amolifashion.com';

  try {
    const product = await prisma.product.findFirst({
      where: { slug: params.slug, isActive: true },
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true } },
        review: { select: { rating: true } },
      },
    });

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The product you are looking for is not available.',
      };
    }

    const images = (() => {
      try {
        return typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      } catch {
        return [];
      }
    })();

    const avgRating =
      product.review?.length > 0
        ? (product.review.reduce((sum: number, r: any) => sum + r.rating, 0) / product.review.length).toFixed(1)
        : null;

    const price = product.specialPrice || product.originalPrice;
    const categoryName = product.category?.name || 'Jewellery';
    const subcategoryName = product.subcategory?.name || '';

    // Build rich, keyword-optimized title
    const title = `${product.name} – Buy ${categoryName}${subcategoryName ? ` ${subcategoryName}` : ''} Online | Amoli Fashion Jewellery`;

    // Build rich description
    const descParts = [
      `Buy ${product.name} online at ₹${price}.`,
      product.material ? `Made with premium ${product.material}.` : '',
      'Nickel-free, skin-friendly & anti-tarnish.',
      avgRating ? `Rated ${avgRating}/5 by ${product.review.length} customers.` : '',
      'Free shipping across India.',
      'Shop demi-fine fashion jewellery from Jaipur, Rajasthan at Amoli.',
    ];
    const description = descParts.filter(Boolean).join(' ');

    // Keywords
    const keywords = [
      product.name,
      `buy ${product.name} online`,
      `${categoryName} online India`,
      `${categoryName} online`,
      product.material ? `${product.material} ${categoryName.toLowerCase()}` : '',
      product.occasion ? `${product.occasion} jewellery` : '',
      'fashion jewellery online',
      'Amoli jewellery',
      'jewellery Jaipur',
      'jewellery online India',
      `${categoryName.toLowerCase()} for women`,
      subcategoryName ? `${subcategoryName} online` : '',
    ].filter(Boolean);

    // Product JSON-LD structured data
    const productJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.shortDescription || product.description?.substring(0, 200),
      image: images,
      sku: product.sku || product.id,
      brand: {
        '@type': 'Brand',
        name: 'Amoli Fashion Jewellery',
      },
      category: categoryName,
      material: product.material || undefined,
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}/products/${product.slug}`,
        priceCurrency: 'INR',
        price: price,
        ...(product.specialPrice && {
          priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }),
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Amoli Fashion Jewellery',
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'IN',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY' },
          },
        },
      },
      ...(avgRating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: avgRating,
          reviewCount: product.review.length,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    };

    // BreadcrumbList JSON-LD
    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Collections',
          item: `${baseUrl}/products`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: categoryName,
          item: `${baseUrl}/products?category=${product.category?.slug || ''}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: product.name,
          item: `${baseUrl}/products/${product.slug}`,
        },
      ],
    };

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: `${baseUrl}/products/${product.slug}`,
      },
      openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: `${baseUrl}/products/${product.slug}`,
        siteName: 'Amoli Fashion Jewellery',
        title: `${product.name} – ${categoryName} | Amoli Fashion Jewellery`,
        description,
        images: images.slice(0, 4).map((img: string, i: number) => ({
          url: img,
          width: 800,
          height: 800,
          alt: `${product.name} – Image ${i + 1}`,
        })),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | Amoli Fashion Jewellery`,
        description: descParts.slice(0, 3).filter(Boolean).join(' '),
        images: images.length > 0 ? [images[0]] : [],
      },
      other: {
        'product:price:amount': price.toString(),
        'product:price:currency': 'INR',
        'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
        'product:brand': 'Amoli Fashion Jewellery',
        'product:category': categoryName,
        // JSON-LD passed as stringified to be rendered in the page
        'structured-data-product': JSON.stringify(productJsonLd),
        'structured-data-breadcrumb': JSON.stringify(breadcrumbJsonLd),
      },
    };
  } catch (error) {
    console.error('Product metadata error:', error);
    return {
      title: 'Fashion Jewellery | Amoli',
      description: 'Premium handcrafted fashion jewellery from Jaipur, Rajasthan.',
    };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
