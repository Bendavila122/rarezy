/**
 * Turns a free-text location ("Mayfair, London") into coordinates, using
 * OpenStreetMap's free Nominatim API — no key required, unlike Google Maps.
 * Deliberately not called on every keystroke: only when a seller explicitly
 * saves their location, in line with Nominatim's usage policy against
 * high-frequency lookups.
 */
export async function geocodeLocation(query: string): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
  );
  if (!res.ok) return null;
  const results = (await res.json()) as { lat: string; lon: string }[];
  const first = results[0];
  if (!first) return null;
  return { lat: Number(first.lat), lng: Number(first.lon) };
}

/** An embeddable OpenStreetMap iframe URL centred on a point with a marker — no API key, no npm map library. */
export function osmEmbedUrl(lat: number, lng: number, span = 0.01) {
  const bbox = `${lng - span}%2C${lat - span}%2C${lng + span}%2C${lat + span}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}
