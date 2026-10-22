import React, { useState } from 'react';
import { Upload, Film, Loader2, Video } from 'lucide-react';
import { getErrorMessage } from '../services/api';

interface VideoUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  csrfToken: string;
  placeholder?: string;
  className?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  label,
  value,
  onChange,
  csrfToken,
  placeholder = 'Video URL or path (e.g., /uploads/video.mp4)',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxMb = 50;
    if (file.size > maxMb * 1024 * 1024) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds limit of ${maxMb}MB.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/uploads.php', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: formData
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        onChange(data.data.url);
      } else {
        setError(getErrorMessage(data?.error || data, 'Failed to upload video'));
      }
    } catch (err) {
      setError('Upload error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-[10px] tracking-widest text-[#737373] uppercase">
          {label}
        </label>
      )}

      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        {/* Preview Box */}
        <div className="w-20 h-20 shrink-0 bg-[#F8F8F8] border border-[#EAEAEA] p-1 flex items-center justify-center relative overflow-hidden">
          {value ? (
            <video
              src={value}
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <Film className="w-6 h-6 text-zinc-600" />
          )}
        </div>

        {/* Input and Upload Action */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] font-mono"
            />

            <label className="inline-flex items-center gap-1.5 bg-[#111111] text-white hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider px-3.5 py-2 cursor-pointer shrink-0 transition-colors">
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading Video...</span>
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5" />
                  <span>Upload Video</span>
                </>
              )}
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <p className="text-[11px] text-red-400 font-sans">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};
