let thumbnailData = '';

document.addEventListener('DOMContentLoaded', function() {
  // First, check if the user has paid
  chrome.runtime.sendMessage({ type: 'checkPaidStatus' }, function(response) {
    // Ensure the response is not undefined before accessing properties
    if (response) {
      if (response.status === 'paid') {
        // If the user has paid, enable the extension features
        enableExtensionFeatures();
      } else {
        // If the user hasn't paid, show the paywall and keep "Apply Preview" disabled
        showPaywall();
        disableApplyPreviewButton();
      }
    } else {
      console.error("Received undefined response from background.");
      // Optionally, handle this case if needed (e.g., show an error message to the user)
    }
  });

  // Handle drag and drop (disabled until payment is confirmed)
  const dropZone = document.getElementById('dropZone');
  const thumbnailInput = document.getElementById('thumbnailInput');
  const thumbnailPreview = document.getElementById('thumbnailPreview');
  const uploadPrompt = document.getElementById('uploadPrompt');

  // Handle drag and drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ff0000';
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#e5e5e5';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#e5e5e5';
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  // Handle click upload
  dropZone.addEventListener('click', () => {
    thumbnailInput.click();
  });

  thumbnailInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
  });

  function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = function() {
        thumbnailData = reader.result;
        thumbnailPreview.src = thumbnailData;
        thumbnailPreview.classList.remove('hidden');
        uploadPrompt.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle button clicks
  document.getElementById('applyButton').addEventListener('click', function() {
    const title = document.getElementById('titleInput').value;
    const channel = document.getElementById('channelInput').value;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'previewThumbnail',
        data: {
          thumbnail: thumbnailData,
          title: title,
          channel: channel
        }
      });
    });
  });

  document.getElementById('resetButton').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'resetThumbnail'
      });
    });
    // Reset the UI
    thumbnailPreview.classList.add('hidden');
    uploadPrompt.classList.remove('hidden');
    thumbnailData = '';
    document.getElementById('titleInput').value = '';
    document.getElementById('channelInput').value = '';
  });
});

// Function to enable features after payment
function enableExtensionFeatures() {
  const dropZone = document.getElementById('dropZone');
  const applyButton = document.getElementById('applyButton');
  const resetButton = document.getElementById('resetButton');

  // Enable the functionality of the extension
  dropZone.classList.remove('disabled');
  applyButton.disabled = false;
  applyButton.classList.remove('disabled');
  resetButton.disabled = false;
}

// Function to show the paywall
function showPaywall() {
  const paywallMessage = document.createElement('div');
  paywallMessage.innerHTML = `
    <div class="paywall-container">
      <h2>Access Restricted</h2>
      <p>You must pay to access this feature.</p>
      <button id="payNowButton">Pay Now</button>
    </div>
  `;
  document.body.appendChild(paywallMessage);

  // Handle the "Pay Now" button
  document.getElementById('payNowButton').addEventListener('click', function() {
    initiatePaymentFlow();
  });
}

// Function to disable the "Apply Preview" button before payment
function disableApplyPreviewButton() {
  const applyButton = document.getElementById('applyButton');
  applyButton.disabled = true;
  applyButton.classList.add('disabled');
}

// Function to initiate the payment flow
function initiatePaymentFlow() {
  chrome.runtime.sendMessage({ type: 'initiatePayment' }, function(response) {
    // Ensure the response is not undefined before accessing properties
    if (response) {
      if (response.status === 'payment_page_opened') {
        // After opening the payment page, the button is disabled until payment is confirmed
        disableApplyPreviewButton();
        alert('Payment page opened! Complete the payment to unlock premium features.');
      } else {
        alert('There was an error opening the payment page. Please try again.');
      }
    } else {
      alert('Unexpected error while initiating payment. Please try again.');
    }
  });
}
