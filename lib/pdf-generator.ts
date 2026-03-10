import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

/**
 * Converts a DOCX ArrayBuffer to PDF using Microsoft Word COM automation.
 * Produces a pixel-perfect PDF identical to File -> Export -> PDF in Word.
 * Requires Microsoft Word to be installed on Windows.
 */
export async function generatePdf(
  docxBuffer: ArrayBuffer,
  _processedData?: unknown
): Promise<Uint8Array> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alaw-pdf-'))

  try {
    const inputPath  = path.join(tmpDir, 'input.docx')
    const outputPath = path.join(tmpDir, 'output.pdf')

    fs.writeFileSync(inputPath, Buffer.from(docxBuffer))

    // Forward slashes — Word COM accepts them and avoids backslash escaping issues
    const inputFwd  = inputPath.replace(/\\/g, '/')
    const outputFwd = outputPath.replace(/\\/g, '/')

    const ps = `
$ErrorActionPreference = 'Stop'
$pdfCreated = $false
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = [Microsoft.Office.Interop.Word.WdAlertLevel]::wdAlertsNone
try {
    $doc = $word.Documents.Open('${inputFwd}')
    $doc.SaveAs2('${outputFwd}', 17)
    $doc.Close([ref]$false)
    $pdfCreated = $true
} catch {
    Write-Host "SAVE_ERROR: $_"
}
try { $word.Quit() } catch { }
try {
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
} catch { }
if ($pdfCreated) { Write-Host 'PDF_OK' } else { exit 1 }
`.trim()

    const result = spawnSync(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', ps],
      { timeout: 60_000, stdio: 'pipe', encoding: 'utf8' }
    )

    const stdout = result.stdout?.toString().trim() ?? ''
    const stderr = result.stderr?.toString().trim() ?? ''

    // PDF file existing is the only success condition — ignore Word's Quit() errors
    if (!fs.existsSync(outputPath)) {
      throw new Error(
        `Word COM conversion failed — PDF was not created.\n` +
        (stderr ? `stderr: ${stderr}\n` : '') +
        (stdout ? `stdout: ${stdout}\n` : '')
      )
    }

    await new Promise(r => setTimeout(r, 500))

    return new Uint8Array(fs.readFileSync(outputPath))
  } finally {
    await new Promise(r => setTimeout(r, 500))
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch { }
  }
}