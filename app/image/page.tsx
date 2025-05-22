'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { FiUpload, FiX, FiSave } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const Page = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length + previews.length > 4) {
        alert('Max 4 images allowed');
        return;
      }
      setFiles(prev => [...prev, ...selectedFiles]);
      setPreviews(prev => [...prev, ...selectedFiles.map(file => URL.createObjectURL(file))]);
    }
  };

  const removeImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Upload successful!');
      // Clear all state
      setFiles([]);
      setPreviews([]);
    } catch {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || previews.length >= 4}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            <FiUpload /> Upload
          </button>

          <div className="flex flex-wrap gap-4 mt-4">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                <Image src={src} alt="preview" width={100} height={100} className="rounded" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || files.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded"
          >
            <FiSave />
            {loading ? 'Uploading...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;
