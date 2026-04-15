'use client';

import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Card } from '@/components/ui/card';

export default function FaqPage() {
  const [pageContent, setPageContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const res = await fetch('/api/cms-pages/faq');
      const data = await res.json();
      
      if (data.success) {
        setPageContent(data.page);
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!pageContent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-12">
          <Breadcrumb items={[{ label: 'FAQ' }]} />
          <Card className="p-12 text-center max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            <p className="text-gray-600">
              The FAQ page content is not available. Please contact the administrator.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-12">
        <Breadcrumb items={[{ label: pageContent.title }]} />

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-6">{pageContent.title}</h1>
          <p className="text-sm sm:text-lg text-gray-600 text-center mb-6 sm:mb-12">
            Find answers to common questions about our products and services
          </p>
          
          <Card className="p-4 sm:p-8">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-black prose-a:text-gray-900 hover:prose-a:text-black"
              dangerouslySetInnerHTML={{ __html: pageContent.content }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
