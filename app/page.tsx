'use client'

import { useState } from 'react'
import { DocumentProcessor, ProcessingResult } from '@/components/document-processor'
import { ProcessingStatus } from '@/components/processing-status'

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleProcessing = (processing: boolean) => {
    setIsProcessing(processing)
  }

  const handleResult = (data: typeof result) => {
    setResult(data)
  }

  const handleError = (err: string) => {
    setError(err)
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-background dark:from-background dark:via-slate-950 dark:to-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-block mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Document Processor</h1>
            <p className="text-muted-foreground">Convert and rename your documents automatically</p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {!result && !error && (
              <DocumentProcessor
                onProcessing={handleProcessing}
                onResult={handleResult}
                onError={handleError}
              />
            )}

            {isProcessing && (
              <ProcessingStatus />
            )}

            {result && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Success!</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">Your document has been processed and converted to PDF.</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-green-900 dark:text-green-100">Renamed DOCX:</span>
                          <p className="text-green-800 dark:text-green-200 font-mono break-all mt-1">{result.renamedDocxFilename}</p>
                        </div>
                        <div>
                          <span className="font-medium text-green-900 dark:text-green-100">PDF Filename:</span>
                          <p className="text-green-800 dark:text-green-200 font-mono break-all mt-1">{result.pdfFilename}</p>
                        </div>
                        <div>
                          <span className="font-medium text-green-900 dark:text-green-100">Extracted Data:</span>
                          <ul className="text-green-800 dark:text-green-200 mt-1 space-y-1">
                            <li>Account Number: <span className="font-mono">{result.extractedData.accountNumber}</span></li>
                            <li>ALAW File: <span className="font-mono">{result.extractedData.alawFile}</span></li>
                            <li>Account Holder: <span className="font-mono">{result.extractedData.accountHolder}</span></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                >
                  Process Another Document
                </button>
              </div>
            )}

            {error && (
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Error</h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">{error}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
