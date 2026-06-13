import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import { Sighting } from '../lib/supabase'
import { totalDistance, daysSince } from '../lib/geo'

const NOTE_ID = process.env.NEXT_PUBLIC_NOTE_ID ?? '—'

export default function Home() {
  const [sightings, setSightings] = useState<Sighting[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    fetch('/api/sightings')
      .then((r) => r.json())
      .then((data) => { setSightings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!city.trim() || !country.trim()) { setError('City and country are required.'); return }
    setSubmitting(true)
    setError('')

    // Try to get lat/lon via free geocoding
    let lat = null, lon = null
    try {
      const geo = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', ' + country)}&format=json&limit=1`
      ).then(r => r.json())
      if (geo[0]) { lat = parseFloat(geo[0].lat); lon = parseFloat(geo[0].lon) }
    } catch {}

    const res = await fetch('/api/sightings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: city.trim(), country: country.trim(), note: note.trim(), lat, lon }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Something went wrong.'); setSubmitting(false); return }
    setSightings((prev) => [...prev, data])
    setSubmitted(true)
    setSubmitting(false)
  }

  const dist = totalDistance(sightings)
  const days = sightings.length > 0 ? daysSince(sightings[0].created_at) : 0
  const handlerNumber = sightings.length + 1

  return (
    <>
      <Head>
        <title>This bill has a story — follow it</title>
        <meta name="description" content={`A €20 note on a journey. ${sightings.length} sightings so far.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="This bill has a story" />
        <meta property="og:description" content={`${sightings.length} hands. ${dist} km. Where will it go next?`} />
      </Head>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--amber)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            note · {NOTE_ID}
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.2, marginBottom: 12 }}>
            This bill has<br />been places.
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>
            You're holding a tracked €20 note. Every time it changes hands,
            someone logs it here. You're handler&nbsp;
            <span style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>#{handlerNumber}</span>.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 40 }}>
          {[
            { label: 'handlers', value: sightings.length },
            { label: 'km travelled', value: dist.toLocaleString() },
            { label: 'days in the wild', value: days },
          ].map((s) => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 14px' }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 500, color: 'var(--amber)', marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Journey timeline */}
        {!loading && sightings.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>the journey so far</p>
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              {/* vertical line */}
              <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1, background: 'var(--border-strong)' }} />
              {sightings.map((s, i) => (
                <div key={s.id} style={{ position: 'relative', marginBottom: i < sightings.length - 1 ? 24 : 0 }}>
                  <div style={{ position: 'absolute', left: -24, top: 4, width: 10, height: 10, borderRadius: '50%', background: i === sightings.length - 1 ? 'var(--amber)' : 'var(--surface2)', border: '1px solid var(--border-strong)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                    <span style={{ fontWeight: 500, fontSize: 15 }}>{s.city}, {s.country}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
                      #{s.handler_number} · {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {s.note && <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{s.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && <p style={{ color: 'var(--muted)', marginBottom: 40 }}>Loading journey…</p>}

        {/* Log sighting form */}
        <div ref={formRef} style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', padding: '24px 20px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ fontSize: 22, marginBottom: 8 }}>✦</p>
              <p style={{ fontWeight: 500, marginBottom: 6 }}>You're on the map.</p>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Pass it on — and see where it ends up next.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ fontWeight: 500, marginBottom: 4 }}>You're holding it now.</p>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>Take 20 seconds to log your sighting. No account needed.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input placeholder="City" value={city} onChange={e => setCity(e.target.value)} required />
                <input placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <textarea
                  placeholder="How did you get it? (optional)"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  style={{ resize: 'none' }}
                />
              </div>
              {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 10 }}>{error}</p>}
              <button type="submit" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? 'Logging…' : 'Log my sighting →'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', marginTop: 48, lineHeight: 1.7 }}>
          This is a personal experiment in following cash.<br />
          No personal data stored beyond city and country.
        </p>
      </main>
    </>
  )
}
