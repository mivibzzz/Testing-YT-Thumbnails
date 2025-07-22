// content.js
let originalThumbnail = null;
let originalTitle = null;
let originalChannel = null;
let activeElement = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'previewThumbnail') {
    const randomVideo = getRandomVideoThumbnail();
    if (randomVideo) {
      if (!originalThumbnail) {
        // Store original values
        originalThumbnail = randomVideo.thumbnail.src;
        originalTitle = randomVideo.title.textContent;
        originalChannel = randomVideo.channel.textContent;
        activeElement = randomVideo.thumbnail;
        
        // Add highlight class
        randomVideo.thumbnail.classList.add('yt-thumb-preview-active');
      }
      
      // Apply new values
      if (request.data.thumbnail) {
        randomVideo.thumbnail.src = request.data.thumbnail;
      }
      if (request.data.title) {
        randomVideo.title.textContent = request.data.title;
      }
      if (request.data.channel) {
        randomVideo.channel.textContent = request.data.channel;
      }
    }
  } else if (request.action === 'resetThumbnail') {
    resetToOriginal();
  }
});

function getRandomVideoThumbnail() {
  // Handle different YouTube page layouts
  const thumbnails = document.querySelectorAll('ytd-thumbnail img');
  const titles = document.querySelectorAll('#video-title');
  const channels = document.querySelectorAll('#channel-name');
  
  if (thumbnails.length > 0) {
    const randomIndex = Math.floor(Math.random() * thumbnails.length);
    return {
      thumbnail: thumbnails[randomIndex],
      title: titles[randomIndex],
      channel: channels[randomIndex]
    };
  }
  return null;
}

function resetToOriginal() {
  if (originalThumbnail && activeElement) {
    const currentVideo = getRandomVideoThumbnail();
    currentVideo.thumbnail.src = originalThumbnail;
    currentVideo.title.textContent = originalTitle;
    currentVideo.channel.textContent = originalChannel;
    
    // Remove highlight class
    activeElement.classList.remove('yt-thumb-preview-active');
    
    // Reset stored values
    originalThumbnail = null;
    originalTitle = null;
    originalChannel = null;
    activeElement = null;
  }
}