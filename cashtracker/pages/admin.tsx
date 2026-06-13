import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Sighting } from '../lib/supabase'

export default function Admin() {
  const [sightings, setSightings] = useState<Sighting[]>([])
  const [qrUrl, setQrUrl] = useState('')
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    fetch('/api/sightings').then(r => r.json()).then(setSightings)
    const origin = window.location.origin
    setBaseUrl(origin)
    setQrUrl(`/api/qr?url=${encodeURIComponent(origin)}`)
  }, [])

  function downloadQr() {
    const a = document.createElement('a')
    a.href = qrUrl
    a.download = 'cashtracker-qr.png'
    a.click()
  }

  return (
    <>
      <Head><title>Admin — CashTracker</title></Head>
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '48px 20px 80px' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--amber)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}>admin</p>
        <h1 style={{ fontSize: 26, fontWeight: 500, marginBottom: 40 }}>Your QR sticker</h1>

        {/* QR */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', padding: 28, marginBottom: 16, textAlign: 'center' }}>
          {qrUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="QR code" style={{ width: 200, height: 200, borderRadius: 8, marginBottom: 16 }} />
          )}
          <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 16, wordBreak: 'break-all' }}>{baseUrl}</p>
          <button onClick={downloadQr}>Download QR as PNG →</button>
        </div>

        <div style={{ background: 'var(--amber-dim)', border: '1px solid rgba(232,167,58,0.2)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 40, fontSize: 13, color: 'var(--amber)', lineHeight: 1.6 }}>
          <strong>Print tip:</strong> Print at ~2×2 cm on a label sheet. Stick on the back lower corner of the note — out of the way but visible. In Germany, lightly marking a note for tracking purposes is generally tolerated but avoid covering serial numbers or security features.
        </div>

        {/* Sightings table */}
        <p style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>all sightings ({sightings.length})</p>
        {sightings.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No sightings yet — go release the note!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--mono)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--muted)' }}>
                  {['#', 'city', 'country', 'date', 'note'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px 8px 0', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sightings.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px 10px 0', color: 'var(--amber)' }}>{s.handler_number}</td>
                    <td style={{ padding: '10px 12px 10px 0' }}>{s.city}</td>
                    <td style={{ padding: '10px 12px 10px 0' }}>{s.country}</td>
                    <td style={{ padding: '10px 12px 10px 0', color: 'var(--muted)' }}>{new Date(s.created_at).toLocaleDateString('en-GB')}</td>
                    <td style={{ padding: '10px 0', color: 'var(--muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
