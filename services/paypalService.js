// services/paypalService.js
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const config = require('../config/config');

// Environment setup
function environment() {
  const clientId = config.paypalClientId;
  const clientSecret = config.paypalClientSecret;
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

// Create PayPal order
exports.createPaypalOrder = async (amount) => {
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [{
      amount: {
        currency_code: "USD", // Change if needed
        value: amount.toString(),
      },
    }],
  });

  const response = await client().execute(request);
  return response.result;
};

// Capture PayPal payment
exports.capturePaypalPayment = async (orderId) => {
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  const response = await client().execute(request);
  return response.result;
};
