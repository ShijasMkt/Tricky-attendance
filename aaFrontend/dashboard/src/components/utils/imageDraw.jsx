  
  /**
   * Function to draw cropped image on canvas
   * @param {HTMLImageElement} image
   * @param {HTMLCanvasElement} canvas
   * @param {import('react-image-crop').PixelCrop} crop
   * @returns void
   */
  export function drawImageOnCanvas(image, canvas, crop) {
    if (!crop || !canvas || !image) {
      return;
    }
  
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;
  
    // Calculate the size based on the smaller dimension to ensure perfect circle
    const size = Math.min(crop.width * scaleX, crop.height * scaleY);
    
    // Set canvas to be perfectly square
    canvas.width = size * pixelRatio;
    canvas.height = size * pixelRatio;
  
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';
  
    // Center coordinates for the circle
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;
  
    // Start clipping the image in a circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  
    // Calculate centering offsets to position the cropped area in the square canvas
    const offsetX = (size - crop.width * scaleX) / 2;
    const offsetY = (size - crop.height * scaleY) / 2;
  
    // Draw the image inside the circle
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      offsetX,
      offsetY,
      crop.width * scaleX,
      crop.height * scaleY
    );
  }