# Document Processor - Usage Guide

## Quick Start

1. **Upload DOCX File**: Select or drag your campaign letter document
2. **Upload Excel File**: Select or drag your account numbers spreadsheet
3. **Click "Convert to PDF"**: The processor will automatically:
   - Extract account information from the DOCX
   - Look up the full account number in Excel
   - Clean and format the data
   - Generate and download a PDF with the standardized filename

## Document Format Requirements

### DOCX File Requirements

Your DOCX file must contain the following information:

```
Account Number: XXXXXX0000
ALAW File: 00-000000
Account Holder: NAME or COMPANY NAME
```

**Important Details:**
- The "Account Number" field should contain at least the last 4 digits (these will be used for lookup)
- The "ALAW File" must follow the format: `00-000000` (2 digits, dash, 6 digits)
- The "Account Holder" can be a person's name or a company name
- These fields must appear exactly as shown (case-insensitive, but exact keywords required)

### Excel File Requirements

Your Excel file should have account numbers in **Column A**, starting from the first row.

**Supported formats:**
- `.xlsx` (Microsoft Excel)
- `.xls` (Legacy Excel)

**Example Column A:**
```
ABC1234567
XYZ9876543
DEF5555555
```

## Processing Logic

### 1. Data Extraction
The system extracts three pieces of information from your DOCX file:
- **Account Number**: The complete account number
- **ALAW File**: The file reference code
- **Account Holder**: The name or company name

### 2. Account Number Lookup
- Takes the **last 4 digits** of the account number from DOCX
- Searches Excel Column A for an account number ending with those 4 digits
- Uses the **first match found** as the full account number

### 3. Truncation
- Takes the full account number from Excel
- **Removes the first 3 characters**
- The remaining digits are used in the PDF filename

**Example:**
```
Excel account number: ABC1234567
First 3 chars removed: 1234567
Used in filename: xf00.alawdocs.dm00.751+1234567+...
```

### 4. Name Cleaning
The account holder name is processed to remove special characters:
- **Ampersands (&)**: Removed and replaced with a space
- **Special characters**: All removed except hyphens
- **Whitespace**: Normalized (multiple spaces become single space)

**Examples:**
- `Smith & Associates` → `Smith Associates`
- `John's Company LLC` → `Johns Company LLC`
- `ABC-123 Corp` → `ABC-123 Corp` (hyphens preserved)

### 5. PDF Filename Generation
The final PDF filename follows this format:

```
xf00.alawdocs.dm00.751+{truncated_account_number}+{cleaned_holder_name}+CBBLIT.pdf
```

**Example:**
```
Input:
- Account Number: ABC1234567 → Last 4: 1234
- Full Account Found in Excel: ABC1234567
- Truncated: 1234567
- Account Holder: John Smith & Co

Output filename:
xf00.alawdocs.dm00.751+1234567+John Smith Co+CBBLIT.pdf
```

## Creating Test Files

### Creating a Test DOCX File

1. Open Microsoft Word or any compatible word processor
2. Type or paste the following content:
```
Account Number: ABC1234567
ALAW File: 12-345678
Account Holder: John Smith
```
3. Save as `.docx` format

### Creating a Test Excel File

1. Open Microsoft Excel or any compatible spreadsheet software
2. In Column A, add account numbers:
   - A1: ABC1234567
   - A2: XYZ9876543
   - A3: DEF5555555
3. Save as `.xlsx` or `.xls` format

## Troubleshooting

### "Could not extract Account Number from document"
**Solution:**
- Ensure the DOCX contains: `Account Number: XXXXXX0000`
- Check that the format matches exactly (case-insensitive)
- Make sure the account number has at least 4 characters

### "Could not extract ALAW File from document"
**Solution:**
- Ensure the DOCX contains: `ALAW File: 00-000000`
- The format must be: 2 digits, a dash, then 6 digits
- Example correct formats: `12-345678`, `00-000000`, `99-999999`

### "Could not find account number in Excel file"
**Solution:**
- Check that the last 4 digits of your DOCX account number match an account number in Excel Column A
- Ensure the Excel account numbers are in the first column (Column A)
- Verify there are no extra spaces or formatting issues in the Excel file

### "Could not extract Account Holder from document"
**Solution:**
- Ensure the DOCX contains: `Account Holder: NAME`
- The name should appear right after the colon
- Make sure there's content after "Account Holder:"

### File upload errors
**Solution:**
- Verify you're uploading the correct file formats:
  - DOCX file must be `.docx`
  - Excel file must be `.xlsx` or `.xls`
- Check that files are not corrupted
- Try re-saving the files in the required format

## Advanced Usage

### Batch Processing
To process multiple documents:
1. Create separate DOCX files for each document
2. Combine all account numbers into a single Excel file in Column A
3. Process each DOCX file individually with the same Excel file

### Account Number Formats
The system works with any account number format, as long as:
- The DOCX contains the account number in the required field
- The Excel file has the matching full account number in Column A
- At least the last 4 digits match between them

### Company Name Formatting
If your company names contain special characters:
- `&` will be removed and replaced with a space
- Other symbols will be removed entirely
- Result: The name will be "cleaned" but still readable

## Output Location

The generated PDF will be automatically downloaded to your computer's default download folder with the name:

```
xf00.alawdocs.dm00.751+{account_number}+{company_name}+CBBLIT.pdf
```

## Security & Privacy

- All processing happens securely on the server
- Files are not stored or archived
- Data is only used to extract the required information
- PDFs are generated dynamically and immediately deleted after download

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your file formats match the requirements
3. Review the examples provided in this guide
4. Check that all required fields are present in your documents
