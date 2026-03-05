'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from './ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function FileUpload({ onFileSelect, selectedFile, onClear }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!validTypes?.includes?.(file?.type ?? '')) {
      setError('Please upload a PDF or DOCX file');
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if ((file?.size ?? 0) > maxSize) {
      setError('File size must be less than 10MB');
      return false;
    }

    setError(null);
    return true;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e?.preventDefault?.();
      setIsDragging(false);

      const file = e?.dataTransfer?.files?.[0];
      if (file && validateFile(file)) {
        onFileSelect?.(file);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e?.target?.files?.[0];
      if (file && validateFile(file)) {
        onFileSelect?.(file);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e?.preventDefault?.();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e?.preventDefault?.();
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {selectedFile ? (
        <div className="bg-white border-2 border-orange-500 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-orange-500" />
              <div>
                <p className="font-semibold text-gray-900">{selectedFile?.name ?? 'Unknown file'}</p>
                <p className="text-sm text-gray-500">
                  {((selectedFile?.size ?? 0) / 1024)?.toFixed?.(2) ?? '0'} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="hover:bg-red-50 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            isDragging
              ? 'border-orange-500 bg-orange-50 scale-105'
              : 'border-gray-300 bg-white hover:border-orange-400 hover:bg-orange-50/50'
          }`}
        >
          <Upload
            className={`w-16 h-16 mx-auto mb-4 transition-colors ${
              isDragging ? 'text-orange-500' : 'text-gray-400'
            }`}
          />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Drop your resume here
          </h3>
          <p className="text-gray-500 mb-6">or click to browse</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button type="button" className="bg-orange-500 hover:bg-orange-600" asChild>
              <span className="cursor-pointer">Select File</span>
            </Button>
          </label>
          <p className="text-sm text-gray-400 mt-4">PDF or DOCX • Max 10MB</p>
        </div>
      )}
      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
