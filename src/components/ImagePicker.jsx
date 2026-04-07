import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';

const ImagePicker = ({ onUpload, currentImage, bucket = 'admin-assets' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      // 1. Create Preview
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);

      // 2. Upload to Supabase
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300
          ${preview ? 'border-primary/50' : 'border-white/10 hover:border-primary/50'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
          h-48 flex items-center justify-center bg-white/5`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-sm font-medium">Change Image</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              <ImageIcon size={24} />
            </div>
            <p className="text-white/60 text-sm">Click to upload or drag and drop</p>
            <p className="text-white/40 text-xs mt-1">PNG, JPG, WebP up to 5MB</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-white text-xs">Uploading...</p>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ImagePicker;
