import { ExtractedDocxData } from './docx-parser'

export interface ProcessedData {
  accountNumber: string
  truncatedAccountNumber: string
  alawFile: string
  accountHolder: string
  cleanAccountHolder: string
  pdfFilename: string
}

export function processAccountData(
  docData: ExtractedDocxData,
  excelAccountNumbers: string[]
): ProcessedData {
  console.log('[v0] Processing account data...')
  console.log('[v0] Doc account number (last 4):', docData.accountNumber.slice(-4))
  console.log('[v0] Excel account numbers:', excelAccountNumbers)

  // Extract the last 4 digits (numeric portion) from the DOCX account number
  // The pattern is usually XXXXXX0000, so we want just the numeric part
  const numericMatch = docData.accountNumber.match(/(\d{4})$/i)
  const last4Digits = numericMatch ? numericMatch[1] : docData.accountNumber.slice(-4)
  
  console.log('[v0] Extracted last 4 digits:', last4Digits)
  
  // Find the full account number in Excel by matching the last 4 digits
  let fullAccountNumber = ''
  for (const excelNum of excelAccountNumbers) {
    if (excelNum.endsWith(last4Digits)) {
      fullAccountNumber = excelNum
      break
    }
  }

  if (!fullAccountNumber) {
    throw new Error(`Could not find account number ending with ${last4Digits} in Excel file. Excel has: ${excelAccountNumbers.slice(0, 3).join(', ')}`)
  }

  console.log('[v0] Full account number found:', fullAccountNumber)

  // Remove first 3 characters from the full account number
  const truncatedAccountNumber = fullAccountNumber.slice(3)
  console.log('[v0] Truncated account number (removed first 3 chars):', truncatedAccountNumber)

  // Extract the surname (last word) from account holder name
  const nameWords = docData.accountHolder.trim().split(/\s+/)
  const surname = nameWords[nameWords.length - 1]
    .replace(/[&]/g, '') // Remove ampersands
    .replace(/[^a-zA-Z0-9\-]/g, '') // Remove special characters except hyphens
    .toUpperCase()

  console.log('[v0] Original account holder:', docData.accountHolder)
  console.log('[v0] Extracted surname:', surname)

  // Build the PDF filename: xf00.alawdocs.dm00.751+{truncated_account_number}+{surname}+CBBLIT
  const pdfFilename = `xf00.alawdocs.dm00.751+${truncatedAccountNumber}+${surname}+CBBLIT`
  
  console.log('[v0] PDF filename:', pdfFilename)

  return {
    accountNumber: docData.accountNumber,
    truncatedAccountNumber,
    alawFile: docData.alawFile,
    accountHolder: docData.accountHolder,
    cleanAccountHolder: surname,
    pdfFilename,
  }
}
