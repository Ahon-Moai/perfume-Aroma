import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { getErrorMessage } from '../services/api';

interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface MediaManagerProps {
  csrfToken: string;
}

export const MediaManager: React.FC<MediaManagerProps> = ({ csrfToken }) => {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media.php', {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMediaList(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch media library', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await fetch('/api/uploads.php', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        fetchMedia();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to upload image'));
      }
    } catch (err) {
      alert('Upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const res = await fetch(`/api/admin/media.php?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success) {
        fetchMedia();
      }
    } catch (e) {
      alert('Failed to delete media file');
    }
  };

  const copyToClipboard = (path: string, id: number) => {
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white border border-[#EAEAEA] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl text-[#111111] font-normal">Media & Asset Library</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Persistent local filesystem uploads for products, campaign banners, and journal articles
          </p>
        </div>

        <label className="inline-flex items-center gap-2 bg-[#111111] text-white hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider px-5 py-2.5 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <div className="bg-white border border-[#EAEAEA] p-6">
        {loading ? (
          <p className="text-xs text-[#737373] py-8 text-center">Loading media library...</p>
        ) : mediaList.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-[#737373]">No media files uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mediaList.map((m) => (
              <div key={m.id} className="bg-[#F8F8F8] border border-[#EAEAEA] p-2 space-y-2 group relative">
                <div className="aspect-square bg-white overflow-hidden flex items-center justify-center p-2">
                  <img src={m.file_path} alt={m.original_name} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="text-[10px]">
                  <p className="font-medium text-[#111111] truncate" title={m.original_name}>{m.original_name}</p>
                  <p className="text-[#737373] font-mono">{(m.file_size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#EAEAEA]/80 text-[10px]">
                  <button
                    onClick={() => copyToClipboard(m.file_path, m.id)}
                    className="inline-flex items-center gap-1 text-[#111111] hover:text-amber-200"
                  >
                    {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === m.id ? 'Copied!' : 'Copy URL'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-[#737373] hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
