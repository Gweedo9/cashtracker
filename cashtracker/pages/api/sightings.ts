import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, Sighting } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const noteId = process.env.NEXT_PUBLIC_NOTE_ID!

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('sightings')
      .select('*')
      .eq('note_id', noteId)
      .order('created_at', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { city, country, note, lat, lon } = req.body

    if (!city || !country) {
      return res.status(400).json({ error: 'city and country are required' })
    }

    // Count existing sightings to assign handler number
    const { count } = await supabase
      .from('sightings')
      .select('*', { count: 'exact', head: true })
      .eq('note_id', noteId)

    const handler_number = (count ?? 0) + 1

    const { data, error } = await supabase
      .from('sightings')
      .insert([{ note_id: noteId, city, country, note: note || null, lat: lat || null, lon: lon || null, handler_number }])
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
