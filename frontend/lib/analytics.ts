export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag && GA_TRACKING_ID) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

export const event = ({ action, category, label, value, ...rest }: {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...rest,
    });
  }
};

import { Product } from '@/types';

// E-commerce specific events
export const trackAddToCart = (product: Partial<Product>, quantity: number = 1) => {
  event({
    action: 'add_to_cart',
    category: 'ecommerce',
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.specialPrice || product.originalPrice,
      quantity: quantity
    }],
    value: (product.specialPrice || product.originalPrice || 0) * quantity,
    currency: 'INR'
  });
};

export const trackRemoveFromCart = (product: Partial<Product>, quantity: number = 1) => {
  event({
    action: 'remove_from_cart',
    category: 'ecommerce',
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.specialPrice || product.originalPrice,
      quantity: quantity
    }],
    value: (product.specialPrice || product.originalPrice) * quantity,
    currency: 'INR'
  });
};

export const trackBeginCheckout = (cartItems: any[], totalValue: number) => {
  event({
    action: 'begin_checkout',
    category: 'ecommerce',
    items: cartItems.map(item => ({
      item_id: item.product.id,
      item_name: item.product.name,
      price: item.product.specialPrice || item.product.originalPrice,
      quantity: item.quantity
    })),
    value: totalValue,
    currency: 'INR'
  });
};

export const trackPurchase = (order: any) => {
  event({
    action: 'purchase',
    category: 'ecommerce',
    transaction_id: order.orderNumber,
    value: order.total,
    currency: 'INR',
    tax: order.tax,
    shipping: order.shippingCharges,
    items: order.orderitem.map((item: any) => ({
      item_id: item.productId,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity
    }))
  });
};

export const trackViewItem = (product: Partial<Product>) => {
  event({
    action: 'view_item',
    category: 'ecommerce',
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.specialPrice || product.originalPrice,
    }],
    value: product.specialPrice || product.originalPrice,
    currency: 'INR'
  });
};

export const trackSearch = (searchTerm: string) => {
  event({
    action: 'search',
    category: 'engagement',
    search_term: searchTerm
  });
};
