'use client'

import { useRef, useState } from 'react'

export interface ProcessingResult {
  originalFilename: string
  renamedDocxFilename: string
  pdfFilename: string
  extractedData: {
    accountNumber: string
    alawFile: string
    accountHolder: string
  }
  pdfData?: string
  docxData?: string
}

interface DocumentProcessorProps {
  onProcessing: (processing: boolean) => void
  onResult: (data: ProcessingResult) => void
  onError: (error: string) => void
}

export function DocumentProcessor({ onProcessing, onResult, onError }: DocumentProcessorProps) {
  const [docFile, setDocFile] = useState<File | null>(null)
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleFiles = (files: FileList) => {
    let hasDocx = false
    let hasExcel = false

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.name.endsWith('.docx')) {
        setDocFile(file)
        hasDocx = true
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setExcelFile(file)
        hasExcel = true
      }
    }

    if (!hasDocx && !hasExcel) {
      onError('Please drop both a DOCX file and an Excel file (XLSX or XLS)')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const downloadFile = (base64Data: string, filename: string, mimeType: string) => {
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleProcess = async () => {
    if (!docFile || !excelFile) {
      onError('Please drop both a DOCX file and an Excel file')
      return
    }

    onProcessing(true)

    try {
      const formData = new FormData()
      formData.append('docFile', docFile)
      formData.append('excelFile', excelFile)

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process documents')
      }

      const result = await response.json()
      
      // Auto-download both the renamed DOCX and the PDF
      if (result.docxData) {
        downloadFile(result.docxData, result.renamedDocxFilename, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        // Small delay before downloading PDF to avoid browser conflicts
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      if (result.pdfData) {
        downloadFile(result.pdfData, result.pdfFilename, 'application/pdf')
      }
      
      onResult(result)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An error occurred during processing')
    } finally {
      onProcessing(false)
    }
  }

  const canProcess = docFile && excelFile
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-6">
      {/* Unified Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-primary/30 bg-card hover:border-primary/60'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".docx,.xlsx,.xls"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <svg
          className="w-12 h-12 mx-auto mb-4 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <h2 className="text-lg font-semibold text-foreground mb-2">Drop files here to process</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Upload both the DOCX campaign letter and Excel account file together
        </p>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <span className={docFile ? 'text-accent' : ''}>{docFile ? '✓' : '○'} DOCX file: {docFile?.name || 'Not uploaded'}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className={excelFile ? 'text-accent' : ''}>{excelFile ? '✓' : '○'} Excel file: {excelFile?.name || 'Not uploaded'}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Click or drag DOCX and Excel files here
        </p>
      </div>

      {/* Process Button */}
      {canProcess && (
        <button
          onClick={handleProcess}
          className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Process & Download Files
        </button>
      )}

      {canProcess && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Ready to process:</span> Click the button to convert and download your renamed DOCX and PDF files
          </p>
        </div>
      )}
    </div>
  )
}
