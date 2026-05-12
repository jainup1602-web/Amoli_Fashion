async function testWebhook() {
  const payload = {
    order_id: 'order_test_123',
    status: 'shipped',
    tracking_number: 'TRACK123456'
  };

  try {
    const response = await fetch('http://localhost:5000/api/webhooks/shiprocket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('Webhook Response:', result);

    if (result.success) {
      console.log('Webhook test successful!');
    } else {
      console.error('Webhook test failed:', result.error);
    }
  } catch (error) {
    console.error('Error testing webhook:', error.message);
  }
}

testWebhook();
