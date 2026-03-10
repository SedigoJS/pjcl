import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

function trySpawn(exe: string, args: string[], options: object) {
  try {
    const r = spawnSync(exe, args, options as any)
    if (r.error && (r.error as any).code === 'ENOENT') return null
    return r
  } catch {
    return null
  }
}

/**
 * Converts a DOCX ArrayBuffer to PDF using Microsoft Word COM automation via PowerShell.
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

    const psArgs = ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', ps]

    const spawnOpts = {
      timeout: 60_000,
      stdio: 'pipe' as const,
      encoding: 'utf8' as const,
      env: {
        ...process.env,
        PATH: [
          process.env.PATH ?? '',
          'C:\\Windows\\System32',
          'C:\\Windows\\SysWOW64',
          'C:\\Windows\\System32\\WindowsPowerShell\\v1.0',
          'C:\\Program Files\\PowerShell\\7',
        ].join(';'),
      },
    }

    // Try every possible PowerShell executable in order
    const candidates = [
      'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      'C:\\Windows\\SysWOW64\\WindowsPowerShell\\v1.0\\powershell.exe',
      'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
      'powershell.exe',
      'pwsh.exe',
    ]

    let result: ReturnType<typeof spawnSync> | null = null
    let usedExe = ''

    for (const exe of candidates) {
      result = trySpawn(exe, psArgs, spawnOpts)
      if (result !== null) { usedExe = exe; break }
    }

    if (!result) {
      throw new Error(
        'Could not launch PowerShell. None of these were found:\n' +
        candidates.join('\n') + '\n\n' +
        'Please ensure PowerShell is installed on this Windows machine.'
      )
    }

    const stdout = result.stdout?.toString().trim() ?? ''
    const stderr = result.stderr?.toString().trim() ?? ''
    const pdfExists = fs.existsSync(outputPath)

    if (!pdfExists) {
      throw new Error(
        `Word COM conversion failed — PDF was not created.\n` +
        `PowerShell: ${usedExe}\n` +
        `stdout: ${stdout || '(empty)'}\n` +
        `stderr: ${stderr || '(empty)'}\n` +
        `spawnStatus: ${result.status}`
      )
    }

    await new Promise(r => setTimeout(r, 500))
    return new Uint8Array(fs.readFileSync(outputPath))

  } finally {
    await new Promise(r => setTimeout(r, 500))
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch { }
  }
}