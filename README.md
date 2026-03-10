# Document Processor

A professional web application for automatically processing and converting business documents.

## Features

- **Drag-and-Drop Upload**: Easily upload DOCX files and Excel spreadsheets
- **Automatic Data Extraction**: Extracts Account Number, ALAW File, and Account Holder information from documents
- **Smart Account Lookup**: Matches partial account numbers with complete account numbers from Excel
- **Automatic Name Cleaning**: Removes special characters from company/account holder names
- **PDF Generation**: Converts documents to PDF with standardized naming convention
- **Auto-Download**: Generated PDFs automatically download to your computer

## How It Works

### Step 1: Upload Documents
1. Upload a DOCX file containing:
   - Account Number (format: XXXXXX0000)
   - ALAW File (format: 00-000000)
   - Account Holder (name or company)

2. Upload an Excel file (XLSX or XLS) with account numbers in Column A

### Step 2: Processing
The application will:
1. Extract the last 4 digits of the account number from the DOCX
2. Find the full account number in the Excel file by matching those 4 digits
3. Remove the first 3 characters from the full account number
4. Clean the account holder name (remove special characters like &)
5. Generate a PDF with the filename: `xf00.alawdocs.dm00.751+{truncated_account_number}+{cleaned_name}+CBBLIT.pdf`

### Step 3: Download
The PDF automatically downloads with the processed filename

## File Format Requirements

### DOCX File
Must contain:
```
Account Number: XXXXXX0000
ALAW File: 00-000000
Account Holder: FIRST NAME SURNAME or COMPANY NAME
```

### Excel File
- Column A must contain complete account numbers
- Supports both .xlsx and .xls formats

## Example

**Input:**
- DOCX: Account Number: ABC1234, ALAW File: 12-345678, Account Holder: Smith & Associates
- Excel Column A: ABC1234, DEF5678, GHI9012

**Output:**
- PDF Filename: `xf00.alawdocs.dm00.751+1234+Smith Associates+CBBLIT.pdf`
- Contains extracted account information in the PDF

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technology Stack

- **Next.js 16**: React framework for production
- **React 19**: UI library
- **Tailwind CSS 4**: Utility-first CSS framework
- **JSZip**: DOCX file parsing
- **XLSX**: Excel file parsing
- **PDF-Lib**: PDF generation
- **TypeScript**: Type-safe JavaScript

## Data Processing Logic

1. **Account Number Extraction**: Regex pattern matching to extract account numbers from DOCX
2. **Account Lookup**: Matches last 4 digits from DOCX with complete account numbers in Excel
3. **Truncation**: Removes first 3 characters from the full account number
4. **Name Cleaning**: 
   - Removes ampersands (&) and replaces with spaces
   - Removes special characters
   - Normalizes whitespace
5. **PDF Filename Generation**: Combines all processed data into standardized filename

## Error Handling

The application provides clear error messages for:
- Invalid file formats
- Missing required information
- Account number mismatches
- Processing failures

## Browser Compatibility

Works with modern browsers that support:
- File API
- Fetch API
- Blob API
- Base64 encoding/decoding

## Notes

- Files are processed entirely on the client/server (no external storage)
- PDFs are generated dynamically and downloaded immediately
- All data is processed securely without external API calls
