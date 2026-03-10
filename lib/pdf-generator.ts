/**
 * DOCX → PDF via ConvertAPI — single API call, fastest option.
 *
 * Setup (2 minutes):
 *  1. Sign up free at https://www.convertapi.com — no credit card needed
 *  2. Copy your secret from the dashboard
 *  3. Add to .env.local:  CONVERTAPI_SECRET=your_secret_here
 *
 * Free tier: 250 conversions/month
 */

export async function generatePdf(
  docxBuffer: ArrayBuffer,
  _processedData?: unknown
): Promise<Uint8Array> {
  const secret = process.env.CONVERTAPI_SECRET
  if (!secret) {
    throw new Error(
      'Missing ConvertAPI secret. Add to .env.local:\n' +
      '  CONVERTAPI_SECRET=your_secret_here\n' +
      'Get it free at https://www.convertapi.com'
    )
  }

  const formData = new FormData()
  formData.append(
    'File',
    new Blob([docxBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }),
    'input.docx'
  )

  const res = await fetch(
    `https://v2.convertapi.com/convert/docx/to/pdf?Secret=${secret}`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    throw new Error(`ConvertAPI failed (${res.status}): ${await res.text()}`)
  }

  const data = await res.json()
  const base64 = data.Files?.[0]?.FileData

  if (!base64) {
    throw new Error(`ConvertAPI returned no file: ${JSON.stringify(data)}`)
  }

  return new Uint8Array(Buffer.from(base64, 'base64'))
}