"use client"

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure PDF.js worker - use local file to avoid CSP issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'

interface PDFViewerProps {
  url: string
  title?: string
  className?: string
  language?: 'sv' | 'en' | 'km'
}

export function PDFViewer({ url, title, className = '', language = 'en' }: PDFViewerProps) {
  const fontClass = language === 'km' ? 'font-khmer' : 'font-sweden'
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error)
    setError('Failed to load PDF. Please try downloading the file instead.')
    setLoading(false)
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset
      return Math.max(1, Math.min(newPage, numPages))
    })
  }

  const previousPage = () => changePage(-1)
  const nextPage = () => changePage(1)

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5))

  const downloadPDF = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = title || 'document.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const translations = {
    sv: {
      page: 'Sida',
      of: 'av',
      download: 'Ladda ner PDF',
      previous: 'Föregående',
      next: 'Nästa',
      zoomIn: 'Zooma in',
      zoomOut: 'Zooma ut',
      loading: 'Laddar PDF...',
      error: 'Kunde inte ladda PDF'
    },
    en: {
      page: 'Page',
      of: 'of',
      download: 'Download PDF',
      previous: 'Previous',
      next: 'Next',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      loading: 'Loading PDF...',
      error: 'Failed to load PDF'
    },
    km: {
      page: 'ទំព័រ',
      of: 'នៃ',
      download: 'ទាញយក PDF',
      previous: 'មុន',
      next: 'បន្ទាប់',
      zoomIn: 'ពង្រីក',
      zoomOut: 'បង្រួម',
      loading: 'កំពុងផ្ទុក PDF...',
      error: 'មិនអាចផ្ទុក PDF បានទេ'
    }
  }

  const t = translations[language]

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className={fontClass}>
          {t.error}. {error}
          <div className="mt-4">
            <Button onClick={downloadPDF} variant="outline" className={fontClass}>
              <Download className="h-4 w-4 mr-2" />
              {t.download}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Controls */}
      <div className="border-b bg-gray-50 p-3 md:p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Page Navigation */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <Button
              onClick={previousPage}
              disabled={pageNumber <= 1 || loading}
              variant="outline"
              size="sm"
              className={fontClass}
              title={t.previous}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className={`text-sm ${fontClass}`}>
              {t.page} {pageNumber} {t.of} {numPages || '...'}
            </span>

            <Button
              onClick={nextPage}
              disabled={pageNumber >= numPages || loading}
              variant="outline"
              size="sm"
              className={fontClass}
              title={t.next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <Button
              onClick={zoomOut}
              disabled={scale <= 0.5 || loading}
              variant="outline"
              size="sm"
              className={fontClass}
              title={t.zoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <span className={`text-sm ${fontClass} w-16 text-center`}>
              {Math.round(scale * 100)}%
            </span>

            <Button
              onClick={zoomIn}
              disabled={scale >= 2.5 || loading}
              variant="outline"
              size="sm"
              className={fontClass}
              title={t.zoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Download Button */}
          <Button
            onClick={downloadPDF}
            variant="default"
            size="sm"
            className={`${fontClass} w-full sm:w-auto`}
          >
            <Download className="h-4 w-4 mr-2" />
            {t.download}
          </Button>
        </div>
      </div>

      {/* PDF Display */}
      <div className="relative bg-gray-100 flex items-center justify-center min-h-[400px] md:min-h-[600px] overflow-auto">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-10">
            <Loader2 className="h-12 w-12 animate-spin text-sahakum-navy mb-4" />
            <p className={`text-gray-600 ${fontClass}`}>{t.loading}</p>
          </div>
        )}

        <div className="p-2 md:p-4">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <Loader2 className="h-8 w-8 animate-spin text-sahakum-navy" />
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="shadow-lg"
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </div>

      {/* Mobile Page Info */}
      <div className="border-t bg-gray-50 p-3 md:hidden">
        <p className={`text-center text-sm text-gray-600 ${fontClass}`}>
          {t.page} {pageNumber} {t.of} {numPages}
        </p>
      </div>
    </Card>
  )
}