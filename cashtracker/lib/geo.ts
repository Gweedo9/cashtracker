// Haversine formula — straight-line distance between two lat/lon points in km
export function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function totalDistance(sightings: { lat: number | null; lon: number | null }[]): number {
  const valid = sightings.filter((s) => s.lat !== null && s.lon !== null) as {
    lat: number
    lon: number
  }[]
  let total = 0
  for (let i = 1; i < valid.length; i++) {
    total += haversineKm(valid[i - 1].lat, valid[i - 1].lon, valid[i].lat, valid[i].lon)
  }
  return Math.round(total)
}

export function daysSince(dateStr: string): number {
  const ms = Date.now() - new Date(dateStr).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}
