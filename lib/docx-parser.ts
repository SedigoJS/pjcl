export interface ExtractedDocxData {
  accountNumber: string
  alawFile: string
  accountHolder: string
  content: string
}

export async function parseDocx(buffer: ArrayBuffer): Promise<ExtractedDocxData> {
  try {
    // Convert buffer to Uint8Array
    const uint8Array = new Uint8Array(buffer)
    
    // For DOCX parsing, we'll extract text using JSZip and XML parsing
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(uint8Array)
    
    // Read the main document XML
    const docXml = await zip.file('word/document.xml')?.async('text')
    if (!docXml) {
      throw new Error('Invalid DOCX file structure')
    }

    console.log('[v0] Document XML received, parsing...')

    // Extract text content by parsing XML
    // Simple regex-based text extraction from Word XML
    let fullText = ''
    
    // Extract all text nodes from <w:t> tags
    const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g
    let match
    while ((match = textRegex.exec(docXml)) !== null) {
      fullText += match[1]
    }

    // Extract ALAW File first (pattern: 00-000000) as an anchor
    const alawFileMatch = fullText.match(/ALAW\s+File[:\s]+([0-9]{2}-[0-9]{6})/i)
    const alawFile = alawFileMatch ? alawFileMatch[1].trim() : ''
    
    if (!alawFile) {
      throw new Error('Could not extract ALAW File from document. Looking for pattern: "ALAW File: 00-000000"')
    }

    // Extract Account Number - the text is "Account Number: XXXXXX6375ALAW File:"
    // We need to capture everything after "Account Number:" until we hit "ALAW"
    // Use a greedy match that captures all alphanumeric before ALAW
    const accountNumberMatch = fullText.match(/Account\s+Number:\s*([A-Z0-9]+)ALAW/i)
    const accountNumber = accountNumberMatch ? accountNumberMatch[1].trim() : ''
    
    if (!accountNumber) {
      throw new Error('Could not extract Account Number from document. Looking for pattern: "Account Number: XXXXXX0000"')
    }

    // Extract Account Holder - text is "Account Holders: MOHAMED S ABDIRAHMANJudgment Amount:"
    // Match from "Account Holder(s):" to "Judgment" (case-insensitive, allow any chars except newline)
    const accountHolderMatch = fullText.match(/Account\s+Holders?:\s*([^J]+?)Judgment/i)
    const accountHolder = accountHolderMatch ? accountHolderMatch[1].trim() : ''
    
    if (!accountHolder) {
      throw new Error('Could not extract Account Holder from document. Looking for pattern: "Account Holder: NAME"')
    }

    console.log('[v0] Extraction successful:', { accountNumber, alawFile, accountHolder })

    return {
      accountNumber,
      alawFile,
      accountHolder,
      content: fullText,
    }
  } catch (error) {
    console.error('[v0] DOCX parsing error:', error)
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
