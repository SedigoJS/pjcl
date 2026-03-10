import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

/**
 * Converts a DOCX ArrayBuffer to PDF using Microsoft Word COM automation.
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

    // Use backslash paths wrapped in escaped quotes for the PS script
    const inputEsc  = inputPath.replace(/\\/g, '\\\\')
    const outputEsc = outputPath.replace(/\\/g, '\\\\')

    const ps = `
$ErrorActionPreference = 'Continue'
$stdout = @()
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open("${inputEsc}")
    $doc.SaveAs2("${outputEsc}", 17)
    $doc.Close([ref]$false)
    $stdout += "PDF_SAVED"
    try { $word.Quit() } catch { $stdout += "QUIT_ERR: $_" }
} catch {
    $stdout += "ERROR: $_"
}
$stdout | ForEach-Object { Write-Output $_ }
`.trim()

    const result = spawnSync(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', ps],
      { timeout: 60_000, stdio: 'pipe', encoding: 'utf8' }
    )

    const stdout = result.stdout?.toString().trim() ?? ''
    const stderr = result.stderr?.toString().trim() ?? ''
    const pdfExists = fs.existsSync(outputPath)

    // Surface full debug info so we can see exactly what went wrong
    if (!pdfExists) {
      throw new Error(
        `Word COM conversion failed.\n` +
        `stdout: ${stdout || '(empty)'}\n` +
        `stderr: ${stderr || '(empty)'}\n` +
        `spawnStatus: ${result.status}\n` +
        `spawnError: ${result.error ?? 'none'}\n` +
        `tmpDir: ${tmpDir}\n` +
        `inputExists: ${fs.existsSync(inputPath)}`
      )
    }

    await new Promise(r => setTimeout(r, 500))
    return new Uint8Array(fs.readFileSync(outputPath))

  } finally {
    await new Promise(r => setTimeout(r, 500))
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch { }
  }
}