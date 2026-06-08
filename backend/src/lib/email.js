/**
 * Email Notification Service using Resend
 */
const { Resend } = require('resend');
const { logger } = require('./logger');

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key');
const FROM_EMAIL = 'Amoli <orders@amolifashion.com>'; // Update with verified domain

/**
 * Send an email using Resend
 */
async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) {
    logger.info(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return true; // Mock success if not configured
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${data.id}`);
    return true;
  } catch (error) {
    logger.error('Failed to send email', error, { to, subject });
    return false;
  }
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmation(order) {
  if (!order.customerEmail && !order.user?.email) return false;
  const email = order.customerEmail || order.user?.email;

  const subject = `Order Confirmation - ${order.orderNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #B76E79;">Thank you for your order!</h1>
      <p>Hi ${order.customerName},</p>
      <p>We've received your order <strong>${order.orderNumber}</strong> and it's now being processed.</p>
      
      <h3>Order Summary</h3>
      <p>Total: ₹${order.total}</p>
      <p>Payment Status: ${order.paymentStatus}</p>
      
      <p>You can track your order status in your Amoli account.</p>
      <p>Best regards,<br>The Amoli Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

/**
 * Send order shipped email
 */
async function sendOrderShipped(order) {
  if (!order.customerEmail && !order.user?.email) return false;
  const email = order.customerEmail || order.user?.email;

  const subject = `Your Order ${order.orderNumber} has shipped!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #B76E79;">Good news! Your order is on the way.</h1>
      <p>Hi ${order.customerName},</p>
      <p>Your order <strong>${order.orderNumber}</strong> has been shipped via ${order.shippingProvider || 'our courier'}.</p>
      
      ${order.trackingNumber ? `
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p>Track your shipment here: <strong>${order.trackingNumber}</strong> (${order.shippingProvider || 'Courier'})</p>
      </div>
      ` : ''}
      
      <p>Thank you for shopping with Amoli.</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

/**
 * Send return request approved email
 */
async function sendReturnApproved(returnReq, order) {
  if (!order.customerEmail && !order.user?.email) return false;
  const email = order.customerEmail || order.user?.email;

  const subject = `Return Request Approved - ${order.orderNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #B76E79;">Return Request Approved</h1>
      <p>Hi ${order.customerName},</p>
      <p>Your return request for items from order <strong>${order.orderNumber}</strong> has been approved.</p>
      <p>Refund Amount: ₹${returnReq.refundAmount}</p>
      <p>We will initiate the refund to your original payment method shortly.</p>
      
      <p>Best regards,<br>The Amoli Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

/**
 * Send order delivered email
 */
async function sendOrderDelivered(order) {
  if (!order.customerEmail && !order.user?.email) return false;
  const email = order.customerEmail || order.user?.email;

  const subject = `Your Order ${order.orderNumber} has been delivered!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #B76E79;">Your order is here!</h1>
      <p>Hi ${order.customerName},</p>
      <p>We're excited to let you know that your order <strong>${order.orderNumber}</strong> has been successfully delivered.</p>
      <p>We hope you love your new jewellery. If you have any questions or need to return an item, please visit your account page or contact our support team.</p>
      <p>Thank you for shopping with Amoli.</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

/**
 * Send refund processed email
 */
async function sendRefundProcessed(order, amount) {
  if (!order.customerEmail && !order.user?.email) return false;
  const email = order.customerEmail || order.user?.email;

  const subject = `Refund Processed - ${order.orderNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #B76E79;">Refund Processed Successfully</h1>
      <p>Hi ${order.customerName},</p>
      <p>We've processed a refund of <strong>₹${amount}</strong> for your order <strong>${order.orderNumber}</strong>.</p>
      <p>The amount should reflect in your original payment method within 5-7 business days depending on your bank.</p>
      <p>Best regards,<br>The Amoli Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderShipped,
  sendReturnApproved,
  sendOrderDelivered,
  sendRefundProcessed
};
