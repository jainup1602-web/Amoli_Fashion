/**
 * Notification Utility Functions
 * Helper functions to create notifications for different events
 */

interface CreateNotificationParams {
  userId: string;
  type: 'order' | 'product' | 'offer' | 'system' | 'wishlist' | 'review';
  title: string;
  message: string;
  link?: string;
  icon?: string;
  metadata?: any;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

// Predefined notification templates

export async function notifyOrderPlaced(userId: string, orderId: string, amount: number) {
  return createNotification({
    userId,
    type: 'order',
    title: 'Order Placed Successfully! 🎉',
    message: `Your order #${orderId.slice(-8)} for ₹${amount.toFixed(2)} has been placed successfully.`,
    link: `/account/orders/${orderId}`,
    metadata: { orderId, amount },
  });
}

export async function notifyOrderShipped(userId: string, orderId: string, trackingNumber?: string) {
  return createNotification({
    userId,
    type: 'order',
    title: 'Order Shipped! 📦',
    message: trackingNumber 
      ? `Your order has been shipped. Tracking number: ${trackingNumber}`
      : 'Your order has been shipped and is on its way!',
    link: `/account/orders/${orderId}`,
    metadata: { orderId, trackingNumber },
  });
}

export async function notifyOrderDelivered(userId: string, orderId: string) {
  return createNotification({
    userId,
    type: 'order',
    title: 'Order Delivered! ✅',
    message: 'Your order has been delivered successfully. Enjoy your purchase!',
    link: `/account/orders/${orderId}`,
    metadata: { orderId },
  });
}

export async function notifyOrderCancelled(userId: string, orderId: string, reason?: string) {
  return createNotification({
    userId,
    type: 'order',
    title: 'Order Cancelled',
    message: reason || 'Your order has been cancelled.',
    link: `/account/orders/${orderId}`,
    metadata: { orderId, reason },
  });
}

export async function notifyPriceDropWishlist(userId: string, productId: string, productName: string, oldPrice: number, newPrice: number) {
  const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  return createNotification({
    userId,
    type: 'wishlist',
    title: `Price Drop Alert! 💰`,
    message: `${productName} is now ${discount}% off! Was ₹${oldPrice}, now ₹${newPrice}`,
    link: `/products/${productId}`,
    metadata: { productId, oldPrice, newPrice, discount },
  });
}

export async function notifyBackInStock(userId: string, productId: string, productName: string) {
  return createNotification({
    userId,
    type: 'product',
    title: 'Back in Stock! 🎊',
    message: `${productName} is back in stock. Order now before it's gone!`,
    link: `/products/${productId}`,
    metadata: { productId },
  });
}

export async function notifyNewOffer(userId: string, couponCode: string, discount: number, expiryDate?: string) {
  return createNotification({
    userId,
    type: 'offer',
    title: 'Special Offer Just for You! 🎁',
    message: `Use code ${couponCode} to get ${discount}% off on your next purchase${expiryDate ? `. Valid till ${expiryDate}` : ''}`,
    link: '/products',
    metadata: { couponCode, discount, expiryDate },
  });
}

export async function notifyWelcome(userId: string, userName: string) {
  return createNotification({
    userId,
    type: 'system',
    title: `Welcome to PRAO, ${userName}! 👋`,
    message: 'Thank you for joining us. Explore our exclusive jewelry collection and enjoy shopping!',
    link: '/products',
  });
}

export async function notifyReviewApproved(userId: string, productId: string, productName: string) {
  return createNotification({
    userId,
    type: 'review',
    title: 'Review Published! ⭐',
    message: `Your review for ${productName} has been published. Thank you for your feedback!`,
    link: `/products/${productId}`,
    metadata: { productId },
  });
}

export async function notifyLowStock(userId: string, productId: string, productName: string, stock: number) {
  return createNotification({
    userId,
    type: 'product',
    title: 'Hurry! Low Stock Alert ⚠️',
    message: `Only ${stock} left in stock for ${productName}. Order now!`,
    link: `/products/${productId}`,
    metadata: { productId, stock },
  });
}

export async function notifyPaymentSuccess(userId: string, orderId: string, amount: number) {
  return createNotification({
    userId,
    type: 'order',
    title: 'Payment Successful! ✅',
    message: `Your payment of ₹${amount.toFixed(2)} has been received. Order #${orderId.slice(-8)}`,
    link: `/account/orders/${orderId}`,
    metadata: { orderId, amount },
  });
}

export async function notifyRefundProcessed(userId: string, orderId: string, amount: number) {
  return createNotification({
    userId,
    type: 'order',
    title: 'Refund Processed 💰',
    message: `Refund of ₹${amount.toFixed(2)} for order #${orderId.slice(-8)} has been processed. It will reflect in 5-7 business days.`,
    link: `/account/orders/${orderId}`,
    metadata: { orderId, amount },
  });
}
