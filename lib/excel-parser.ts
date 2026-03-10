export async function parseExcel(buffer: ArrayBuffer): Promise<string[]> {
  try {
    const XLSX = await import('xlsx')
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      throw new Error('No sheets found in Excel file')
    }

    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json<{ [key: string]: any }>(sheet, { header: 1 })
    
    // Extract Column A (account numbers)
    const accountNumbers: string[] = []
    for (const row of data) {
      if (Array.isArray(row) && row[0]) {
        const value = String(row[0]).trim()
        if (value && value.length > 0) {
          accountNumbers.push(value)
        }
      }
    }

    console.log('[v0] Parsed account numbers from Excel:', accountNumbers)

    if (accountNumbers.length === 0) {
      throw new Error('No account numbers found in Column A of Excel file')
    }

    return accountNumbers
  } catch (error) {
    console.error('[v0] Excel parsing error:', error)
    throw new Error(`Failed to parse Excel: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
