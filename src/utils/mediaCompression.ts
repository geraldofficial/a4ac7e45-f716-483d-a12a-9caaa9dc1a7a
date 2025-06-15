
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export const compressImage = async (
  file: File, 
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 500
  } = options;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

export const compressVideo = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  // For videos, we'll resize using canvas for thumbnails
  // and limit file size by rejecting large files
  const maxSizeKB = options.maxSizeKB || 5000; // 5MB max for videos
  
  if (file.size > maxSizeKB * 1024) {
    throw new Error(`Video file too large. Maximum size is ${maxSizeKB}KB`);
  }
  
  return file;
};

export const compressMedia = async (file: File): Promise<File> => {
  if (file.type.startsWith('image/')) {
    return compressImage(file, { maxSizeKB: 300 });
  } else if (file.type.startsWith('video/')) {
    return compressVideo(file, { maxSizeKB: 5000 });
  }
  return file;
};
