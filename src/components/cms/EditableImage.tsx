import React, { useState, useRef } from 'react';
import { Edit2, Check, X, Upload, AlertTriangle } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useAuthStore } from '../../store/authStore';
import { usePageContent } from '../../hooks/usePageContent';

interface ImageDimensions {
  width: number;
  height: number;
  aspect: number;
}

interface EditableImageProps {
  pageId: string;
  sectionId: string;
  defaultSrc: string;
  alt: string;
  className?: string;
  maxSize?: number; // in bytes, defaults to 10MB
  allowedTypes?: string[]; // e.g. ['image/jpeg', 'image/png', 'image/webp']
}

export function EditableImage({ 
  pageId, 
  sectionId, 
  defaultSrc,
  alt,
  className = '',
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: EditableImageProps) {
  const { user } = useAuthStore();
  const { content, updateContent, initialized } = usePageContent(pageId);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const initialLoadRef = useRef(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [frameDimensions, setFrameDimensions] = useState<ImageDimensions | null>(null);

  const isSuperAdmin = user?.role === 'super_admin';
  const displaySrc = content.find(c => c.section_id === sectionId)?.content || defaultSrc;

  React.useEffect(() => {
    if (isEditing) {
      const frame = document.querySelector(`.${className.split(' ').join('.')}`);
      if (frame) {
        const rect = frame.getBoundingClientRect();
        setFrameDimensions({
          width: rect.width,
          height: rect.height,
          aspect: rect.width / rect.height
        });
      }
    }
  }, [isEditing, className]);

  React.useEffect(() => {
    if (initialized && !initialLoadRef.current) {
      const dbContent = content.find(c => c.section_id === sectionId)?.content;
      if (dbContent) {
        setPreviewUrl(null);
        setSelectedFile(null);
      }
      initialLoadRef.current = true;
    }
  }, [content, sectionId, initialized]);

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }
    if (file.size > maxSize) {
      return `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    return null;
  };

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg', 1);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    
    // Set initial crop based on frame dimensions
    if (frameDimensions) {
      const img = new Image();
      img.onload = () => {
        const imageAspect = img.width / img.height;
        let cropWidth, cropHeight;

        if (imageAspect > frameDimensions.aspect) {
          // Image is wider than frame
          cropHeight = 100;
          cropWidth = (frameDimensions.aspect * 100) / imageAspect;
        } else {
          // Image is taller than frame
          cropWidth = 100;
          cropHeight = (100 / frameDimensions.aspect) * imageAspect;
        }

        setCrop({
          unit: '%',
          x: (100 - cropWidth) / 2,
          y: (100 - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight
        });
      };
      img.src = imageUrl;
    }

    setSelectedImage(imageUrl);
    setPreviewUrl(imageUrl);
  };

  const handleSave = async () => {
    if (!user?.id || !selectedFile || !completedCrop || !imgRef.current || isSaving) return;

    try {
      setIsSaving(true);
      setError(null);

      // Get cropped image data
      const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop);
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();

      // Convert cropped image to base64
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      await updateContent({
        id: content.find(c => c.section_id === sectionId)?.id || crypto.randomUUID(),
        page_id: pageId,
        section_id: sectionId,
        content: base64Data,
        content_type: 'image',
        updated_by: user.id
      });

      setIsEditing(false);
      setPreviewUrl(null);
      setSelectedFile(null);
      setSelectedImage(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
    } catch (error) {
      console.error('Error saving image:', error);
      setError('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedImage(null);
    setSelectedFile(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setError(null);
  };

  // For non-admin users, render static image
  if (!isSuperAdmin) {
    return <img src={displaySrc} alt={alt} className={className} />;
  }

  return (
    <div className="group relative">
      <img 
        src={previewUrl || displaySrc} 
        alt={alt} 
        className={`${className} ${isEditing ? 'opacity-75' : ''} ${!isEditing ? 'group-hover:opacity-90' : ''}`}
      />

      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-kapstone-sage text-white rounded-full hover:bg-kapstone-sage-dark"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      )}

      {isEditing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Update Image</h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {selectedImage && (
                <div className="relative w-full max-h-[400px] overflow-hidden">
                  <ReactCrop
                    locked
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={frameDimensions?.aspect}
                  >
                    <img
                      ref={imgRef}
                      src={selectedImage}
                      className="max-w-full"
                      alt="Crop preview"
                    />
                  </ReactCrop>
                </div>
              )}

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  disabled={isSaving}
                >
                  <Upload className="h-5 w-5" />
                  Choose Image
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={allowedTypes.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFile && (
                  <div className="text-sm text-gray-500">
                    Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSave}
                  disabled={!completedCrop || isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}