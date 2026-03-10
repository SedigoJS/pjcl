'use client'

import { useRef } from 'react'

interface FileUploadProps {
  accept: string
  onFile: (file: File) => void
  fileName?: string
  label: string
}

export function FileUpload({ accept, onFile, fileName, label }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    dragRef.current?.classList.add('border-primary', 'bg-primary/5')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragRef.current?.classList.remove('border-primary', 'bg-primary/5')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragRef.current?.classList.remove('border-primary', 'bg-primary/5')
    const file = e.dataTransfer.files?.[0]
    if (file) {
      onFile(file)
    }
  }

  return (
    <div className="space-y-3">
      {fileName ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900 dark:text-green-100 truncate">{fileName}</p>
            <p className="text-xs text-green-800 dark:text-green-200">File selected</p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm px-3 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            Change
          </button>
        </div>
      ) : (
        <div
          ref={dragRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors text-center"
        >
          <svg className="w-12 h-12 mx-auto mb-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          <p className="font-semibold text-foreground mb-1">Drag and drop your file here</p>
          <p className="text-sm text-muted-foreground">or click to select from your computer</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-label={label}
      />
    </div>
  )
}
