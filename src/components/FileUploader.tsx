import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, File, Image as ImageIcon, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function FileUploader({ onFileSelect, disabled }: FileUploaderProps) {
  const { t } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    setError('');
    const isImage = file.type.startsWith('image/');
    const limit = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
    
    if (file.size > limit) {
      setError(`${t('uploader_error_size')} ${limit / (1024 * 1024)}MB.`);
      return false;
    }
    
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (['.exe', '.bat', '.cmd', '.ps1', '.msi', '.vbs', '.scr'].includes(ext)) {
      setError(t('uploader_error_type'));
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
            dragActive ? 'border-tp-blue bg-tp-blue/10' : 'border-tp-secondary/30 bg-black/20 hover:border-tp-blue/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            disabled={disabled}
          />
          <UploadCloud className="w-12 h-12 text-tp-secondary mb-4" />
          <p className="text-tp-primary text-center font-medium">{t('uploader_drag')}</p>
          <p className="text-tp-secondary text-sm mt-2 text-center">{t('uploader_images')}<br/>{t('uploader_files')}</p>
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-tp-blue/30 glow-blue">
          <div className="flex items-center gap-4 overflow-hidden">
            {previewUrl ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-tp-blue/30 bg-black/40">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="p-3 bg-tp-blue/20 rounded-xl shrink-0">
                {selectedFile.type.startsWith('image/') ? <ImageIcon className="text-tp-blue w-6 h-6" /> : <File className="text-tp-blue w-6 h-6" />}
              </div>
            )}
            <div className="flex flex-col truncate">
              <span className="text-tp-primary font-medium truncate" title={selectedFile.name}>{selectedFile.name}</span>
              <span className="text-tp-secondary text-sm">{formatSize(selectedFile.size)}</span>
            </div>
          </div>
          {!disabled && (
            <button 
              onClick={() => { setSelectedFile(null); (inputRef.current as any).value = ''; }}
              className="p-2 hover:bg-white/10 rounded-full text-tp-secondary hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="text-tp-red text-sm text-center p-2 bg-tp-red/10 rounded-lg border border-tp-red/20">
          {error}
        </div>
      )}
    </div>
  );
}
