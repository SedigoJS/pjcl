'use client'

export function ProcessingStatus() {
  return (
    <div className="bg-card border border-primary/20 rounded-lg p-8">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-1">Processing your documents</h3>
          <p className="text-sm text-muted-foreground">
            Extracting data and converting to PDF...
          </p>
        </div>
      </div>
    </div>
  )
}
