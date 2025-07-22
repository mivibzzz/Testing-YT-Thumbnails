// background.js

// Ensure that ExtPay.js is properly loaded
importScripts('ExtPay.js');  // Include the ExtPay.js file

let extpay;  // Declare the variable to hold the ExtPay instance

// Initialize ExtensionPay
chrome.runtime.onInstalled.addListener(async () => {
  try {
    // Initialize the ExtPay instance for your extension
    extpay = ExtPay('youtube-thumbnail-tester-by-mivi');  // Use your actual extension ID

    // Start ExtensionPay background process
    await extpay.startBackground();
    console.log('ExtensionPay background process started');
  } catch (error) {
    console.error('Failed to initialize ExtensionPay:', error);
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getState') {
    chrome.storage.local.get(['previewActive', 'lastUsedSettings'], (result) => {
      sendResponse(result);
    });
    return true;  // Will respond asynchronously
  }

  if (request.type === 'checkPaidStatus') {
    // Use extpay.getUser() to check if the user has paid
    extpay.getUser()
      .then((user) => {
        console.log('User data:', user);
        if (user && user.paid) {
          sendResponse({ status: 'paid', message: 'User has access to premium features' });
        } else {
          sendResponse({ status: 'free', message: 'Payment required to access premium features' });
        }
      })
      .catch((error) => {
        console.error('Error checking user payment status:', error);
        sendResponse({ status: 'error', message: 'Failed to check payment status' });
      });

    return true;  // Will respond asynchronously
  }

  // Handle payment request
  if (request.type === 'initiatePayment') {
    // Open the payment page for the user
    extpay.openPaymentPage()
      .then(() => {
        console.log("Payment page opened successfully");
        sendResponse({ status: 'payment_page_opened' });
      })
      .catch((error) => {
        console.error("Error opening payment page:", error);
        sendResponse({ status: 'error', message: 'Failed to open payment page' });
      });

    return true;  // Will respond asynchronously
  }
});
