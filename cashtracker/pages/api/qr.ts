import type { NextApiRequest, NextApiResponse } from 'next'
import QRCode from 'qrcode'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url param required' })
  }

  try {
    const buffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: 400,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' },
    })
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(buffer)
  } catch (err) {
    res.status(500).json({ error: 'QR generation failed' })
  }
}
