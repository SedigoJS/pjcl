import { NextRequest, NextResponse } from 'next/server'
import { parseDocx } from '@/lib/docx-parser'
import { parseExcel } from '@/lib/excel-parser'
import { generatePdf } from '@/lib/pdf-generator'
import { processAccountData } from '@/lib/data-processor'
import { getDocxFilename } from '@/lib/docx-renamer'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const docFile = formData.get('docFile') as File
    const excelFile = formData.get('excelFile') as File

    if (!docFile || !excelFile) {
      return NextResponse.json(
        { error: 'Missing required files' },
        { status: 400 }
      )
    }

    // Parse DOCX file
    console.log('[v0] Parsing DOCX file...')
    const docContent = await docFile.arrayBuffer()
    const extractedData = await parseDocx(docContent)
    console.log('[v0] Extracted from DOCX:', extractedData)

    // Parse Excel file
    console.log('[v0] Parsing Excel file...')
    const excelContent = await excelFile.arrayBuffer()
    const accountNumbers = await parseExcel(excelContent)
    console.log('[v0] Account numbers from Excel:', accountNumbers)

    // Process account data
    console.log('[v0] Processing account data...')
    const processedData = processAccountData(extractedData, accountNumbers)
    console.log('[v0] Processed data:', processedData)

    // Generate PDF
    console.log('[v0] Generating PDF...')
    const pdfBytes = await generatePdf(docContent, processedData)

    // Get the renamed DOCX filename
    const renamedDocxFilename = getDocxFilename(processedData) + '.docx'
    
    // Convert PDF and DOCX to base64 for transmission
    const base64Pdf = Buffer.from(pdfBytes).toString('base64')
    const base64Docx = Buffer.from(docContent).toString('base64')
    
    const pdfFilename = `${processedData.pdfFilename}.pdf`
    
    return NextResponse.json({
      originalFilename: docFile.name,
      renamedDocxFilename,
      pdfFilename,
      extractedData: {
        accountNumber: processedData.truncatedAccountNumber,
        alawFile: processedData.alawFile,
        accountHolder: processedData.cleanAccountHolder,
      },
      pdfData: base64Pdf,
      docxData: base64Docx,
    })
  } catch (error) {
    console.error('[v0] Processing error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process documents'
      },
      { status: 500 }
    )
  }
}
