import { notFound } from 'next/navigation';
import { RoastDisplay } from '@/components/roast-display';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flame } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RoastPageProps {
  params: { id: string };
}

export default async function RoastPage({ params }: RoastPageProps) {
  const roast = await prisma.roast.findUnique({
    where: { id: params?.id ?? '' }
  });

  if (!roast) {
    notFound();
  }

  const roastData = {
    id: roast?.id ?? '',
    filename: roast?.filename ?? 'Resume',
    roastType: roast?.roastType ?? 'Standard',
    content: roast?.content ?? '',
    sections: (roast?.sections as any) ?? [],
    scores: (roast?.scores as any) ?? {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Resume Roast</h1>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Roast Another
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Roast Display */}
      <RoastDisplay roastData={roastData} />
    </div>
  );
}
