// Helper functions for testing the document processor
// You can use these to understand the expected data formats

export const EXAMPLE_DOCX_CONTENT = `
Account Number: ABC1234567
ALAW File: 12-345678
Account Holder: John Smith

This is a sample campaign letter document.
It contains all the required information for processing.
`

export const EXAMPLE_EXCEL_DATA = [
  ['ABC1234567'], // Column A with full account numbers
  ['XYZ9876543'],
  ['DEF5555555'],
]

export const EXAMPLE_PROCESSED_OUTPUT = {
  originalFilename: 'sample.docx',
  pdfFilename: 'xf00.alawdocs.dm00.751+1234567+John Smith+CBBLIT.pdf',
  extractedData: {
    accountNumber: '1234567', // Last 4 digits removed from full account number
    alawFile: '12-345678',
    accountHolder: 'John Smith',
  },
}

// Example with company name containing special characters
export const EXAMPLE_WITH_COMPANY = {
  docxContent: `
Account Number: TEST9999999
ALAW File: 99-999999
Account Holder: ABC & XYZ Associates Inc.
  `,
  excelData: [
    ['TEST9999999'],
    ['OTHER1111111'],
  ],
  expectedOutput: {
    pdfFilename: 'xf00.alawdocs.dm00.751+9999999+ABC XYZ Associates Inc+CBBLIT.pdf',
    cleanedName: 'ABC XYZ Associates Inc', // & removed, replaced with space
  },
}
