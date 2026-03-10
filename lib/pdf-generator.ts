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

    const inputEsc  = inputPath.replace(/\\/g, '\\\\')
    const outputEsc = outputPath.replace(/\\/g, '\\\\')

    const ps = `
$ErrorActionPreference = 'Continue'
$results = @()
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open("${inputEsc}")
    $doc.SaveAs2("${outputEsc}", 17)
    $doc.Close([ref]$false)
    $results += "PDF_SAVED"
    try { $word.Quit() } catch { }
} catch {
    $results += "ERROR: $_"
}
$results | ForEach-Object { Write-Output $_ }
`.trim()

    // Try multiple known PowerShell locations — Next.js may run with a
    // stripped PATH that doesn't include the Windows system dirs
    const psLocations = [
      'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      'C:\\Windows\\SysWOW64\\WindowsPowerShell\\v1.0\\powershell.exe',
      'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
      'C:\\Program Files\\PowerShell\\7.4\\pwsh.exe',
      'C:\\Program Files\\PowerShell\\7.3\\pwsh.exe',
      'powershell.exe', // fallback: hope it's on PATH
    ]

    const psExe = psLocations.find(p => {
      try { return p === 'powershell.exe' || fs.existsSync(p) } catch { return false }
    }) ?? 'powershell.exe'

    const result = spawnSync(
      psExe,
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', ps],
      {
        timeout: 60_000,
        stdio: 'pipe',
        encoding: 'utf8',
        // Inject system dirs into PATH so Word COM and powershell can find DLLs
        env: {
          ...process.env,
          PATH: [
            process.env.PATH,
            'C:\\Windows\\System32',
            'C:\\Windows\\SysWOW64',
            'C:\\Windows\\System32\\WindowsPowerShell\\v1.0',
          ].filter(Boolean).join(';'),
        },
      }
    )

    const stdout = result.stdout?.toString().trim() ?? ''
    const stderr = result.stderr?.toString().trim() ?? ''
    const pdfExists = fs.existsSync(outputPath)

    if (!pdfExists) {
      throw new Error(
        `Word COM conversion failed.\n` +
        `powershell used: ${psExe}\n` +
        `stdout: ${stdout || '(empty)'}\n` +
        `stderr: ${stderr || '(empty)'}\n` +
        `spawnStatus: ${result.status}\n` +
        `spawnError: ${result.error ?? 'none'}`
      )
    }

    await new Promise(r => setTimeout(r, 500))
    return new Uint8Array(fs.readFileSync(outputPath))

  } finally {
    await new Promise(r => setTimeout(r, 500))
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch { }
  }
}