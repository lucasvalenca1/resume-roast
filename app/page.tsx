'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/file-upload';
import { ToneSelector } from '@/components/tone-selector';
import { LoadingRoast } from '@/components/loading-roast';
import { Button } from '@/components/ui/button';
import { Flame, Sparkles, Target, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type RoastTone = 'Humorous' | 'Constructive' | 'Brutal';

export default function HomePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTone, setSelectedTone] = useState<RoastTone>('Constructive');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a resume file to roast',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Get presigned URL
      const presignedResponse = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile?.name ?? 'resume',
          contentType: selectedFile?.type ?? 'application/pdf',
          isPublic: false
        })
      });

      if (!presignedResponse?.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, cloud_storage_path } = await presignedResponse?.json?.();

      // Step 2: Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile?.type ?? 'application/pdf'
        },
        body: selectedFile
      });

      if (!uploadResponse?.ok) {
        throw new Error('Failed to upload file');
      }

      // Step 3: Convert file to base64 for LLM processing
      const fileReader = new FileReader();
      const fileDataPromise = new Promise<string>((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader?.result as string ?? '');
        fileReader.onerror = reject;
        fileReader.readAsDataURL(selectedFile);
      });

      const fileData = await fileDataPromise;
      const fileType = selectedFile?.type?.includes?.('pdf') ? 'pdf' : 'docx';

      // Step 4: Generate roast with streaming
      const roastResponse = await fetch('/api/roast/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile?.name ?? 'resume',
          roastType: selectedTone,
          cloud_storage_path,
          isPublic: false,
          fileData,
          fileType
        })
      });

      if (!roastResponse?.ok) {
        throw new Error('Failed to generate roast');
      }

      // Step 5: Process streaming response
      const reader = roastResponse?.body?.getReader?.();
      const decoder = new TextDecoder();
      let partialRead = '';

      while (true) {
        const { done, value } = await reader?.read?.() ?? { done: true, value: undefined };
        if (done) break;

        partialRead += decoder?.decode?.(value, { stream: true }) ?? '';
        let lines = partialRead?.split?.('\n') ?? [];
        partialRead = lines?.pop?.() ?? '';

        for (const line of lines ?? []) {
          if (line?.startsWith?.('data: ')) {
            const data = line?.slice?.(6) ?? '';
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed?.status === 'completed') {
                // Redirect to roast page
                router?.push?.(`/roast/${parsed?.roastId}`);
                return;
              } else if (parsed?.status === 'error') {
                throw new Error(parsed?.message ?? 'Generation failed');
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Upload/Roast error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your resume. Please try again.',
        variant: 'destructive'
      });
      setIsUploading(false);
    }
  };

  if (isUploading) {
    return <LoadingRoast />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Resume Roast</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Get your resume <span className="text-orange-500">roasted</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your resume and get AI-powered feedback to improve your chances of landing that dream job
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
            <p className="text-sm text-gray-600">
              Advanced AI reviews every section of your resume
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Actionable Feedback</h3>
            <p className="text-sm text-gray-600">
              Get specific suggestions to improve your resume
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Private & Secure</h3>
            <p className="text-sm text-gray-600">
              Your resume data is handled with complete privacy
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-8">
          <ToneSelector selectedTone={selectedTone} onToneSelect={setSelectedTone} />
          <FileUpload
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onClear={handleClearFile}
          />
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-6 text-lg font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Processing...' : 'Roast My Resume'}
            <Flame className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600">
          <p className="text-sm">
            © 2026 Resume Roast. Your resume data is processed securely and not stored permanently.
          </p>
        </div>
      </footer>
    </div>
  );
}
