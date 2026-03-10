import { ProcessedData } from './data-processor'

/**
 * Prepares the renamed DOCX file for download
 * Returns the filename that should be used
 */
export function getDocxFilename(processedData: ProcessedData): string {
  // Format: {ALAW File} PJ Campaign Letter
  return `${processedData.alawFile} PJ Campaign Letter`
}
