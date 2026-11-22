const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImage(file) {
  if (!cloudName || !uploadPreset) {
    throw new Error('Image uploads are not configured. Set the Cloudinary cloud name and unsigned upload preset.');
  }
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Choose a valid image file.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Images must be 10 MB or smaller.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });
  const result = await response.json();

  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || 'Cloudinary could not upload this image.');
  }

  return result.secure_url;
}
