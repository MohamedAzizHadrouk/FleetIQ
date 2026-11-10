/**
 * Small offline gazetteer of Tunisian localities (approximate centres), used to
 * label a vehicle's current position without calling a reverse-geocoding API.
 */
export interface TunisiaPlace {
  name: string;
  governorate: string;
  coords: [number, number];
}

export const TUNISIA_PLACES: TunisiaPlace[] = [
  { name: 'Tunis Centre', governorate: 'Tunis', coords: [36.8008, 10.18] },
  { name: 'Bab Saadoun', governorate: 'Tunis', coords: [36.8078, 10.1611] },
  { name: 'El Menzah', governorate: 'Tunis', coords: [36.84, 10.172] },
  { name: 'Charguia', governorate: 'Tunis', coords: [36.841, 10.205] },
  { name: 'Aéroport Tunis-Carthage', governorate: 'Tunis', coords: [36.851, 10.227] },
  { name: 'Lac 1', governorate: 'Tunis', coords: [36.835, 10.238] },
  { name: 'La Goulette', governorate: 'Tunis', coords: [36.818, 10.305] },
  { name: 'Le Kram', governorate: 'Tunis', coords: [36.833, 10.316] },
  { name: 'Carthage', governorate: 'Tunis', coords: [36.853, 10.323] },
  { name: 'Sidi Bou Saïd', governorate: 'Tunis', coords: [36.87, 10.341] },
  { name: 'La Marsa', governorate: 'Tunis', coords: [36.878, 10.325] },
  { name: 'Ariana', governorate: 'Ariana', coords: [36.8625, 10.1956] },
  { name: 'La Soukra', governorate: 'Ariana', coords: [36.874, 10.251] },
  { name: 'Manouba', governorate: 'Manouba', coords: [36.81, 10.097] },
  { name: 'Den Den', governorate: 'Manouba', coords: [36.805, 10.115] },
  { name: 'Ben Arous', governorate: 'Ben Arous', coords: [36.753, 10.219] },
  { name: 'Radès', governorate: 'Ben Arous', coords: [36.768, 10.275] },
  { name: 'Mégrine', governorate: 'Ben Arous', coords: [36.77, 10.233] },
  { name: 'Hammam Lif', governorate: 'Ben Arous', coords: [36.73, 10.34] },
  { name: 'Mornag', governorate: 'Ben Arous', coords: [36.683, 10.288] },
  { name: 'Fouchana', governorate: 'Ben Arous', coords: [36.699, 10.169] },
  { name: 'Mohamedia', governorate: 'Ben Arous', coords: [36.677, 10.156] },
  { name: 'Zaghouan', governorate: 'Zaghouan', coords: [36.403, 10.143] },
  { name: 'Bir Mcherga', governorate: 'Zaghouan', coords: [36.524, 10.017] },
  { name: 'Soliman', governorate: 'Nabeul', coords: [36.696, 10.49] },
  { name: 'Grombalia', governorate: 'Nabeul', coords: [36.6, 10.5] },
  { name: 'Bou Argoub', governorate: 'Nabeul', coords: [36.53, 10.55] },
  { name: 'Bir Bouregba', governorate: 'Nabeul', coords: [36.43, 10.57] },
  { name: 'Hammamet', governorate: 'Nabeul', coords: [36.4, 10.617] },
  { name: 'Nabeul', governorate: 'Nabeul', coords: [36.456, 10.737] },
  { name: 'Dar Chaâbane', governorate: 'Nabeul', coords: [36.47, 10.75] },
  { name: 'Bouficha', governorate: 'Sousse', coords: [36.3, 10.45] },
  { name: 'Enfidha', governorate: 'Sousse', coords: [36.135, 10.38] },
  { name: 'Hergla', governorate: 'Sousse', coords: [36.03, 10.51] },
  { name: 'Sidi Bou Ali', governorate: 'Sousse', coords: [35.956, 10.473] },
  { name: 'Kalâa Kebira', governorate: 'Sousse', coords: [35.87, 10.53] },
  { name: 'Kalâa Sghira', governorate: 'Sousse', coords: [35.82, 10.56] },
  { name: 'Akouda', governorate: 'Sousse', coords: [35.87, 10.57] },
  { name: 'Hammam Sousse', governorate: 'Sousse', coords: [35.86, 10.595] },
  { name: 'Sousse Médina', governorate: 'Sousse', coords: [35.8256, 10.6411] },
  { name: 'Msaken', governorate: 'Sousse', coords: [35.73, 10.58] },
  { name: 'Sidi El Hani', governorate: 'Sousse', coords: [35.67, 10.31] },
  { name: 'Sahline', governorate: 'Monastir', coords: [35.75, 10.71] },
  { name: 'Monastir', governorate: 'Monastir', coords: [35.777, 10.826] },
  { name: 'Ksar Hellal', governorate: 'Monastir', coords: [35.643, 10.89] },
  { name: 'Moknine', governorate: 'Monastir', coords: [35.63, 10.9] },
  { name: 'Bekalta', governorate: 'Monastir', coords: [35.617, 11.0] },
  { name: 'Mahdia', governorate: 'Mahdia', coords: [35.504, 11.062] },
  { name: 'Kairouan', governorate: 'Kairouan', coords: [35.678, 10.096] },
  { name: 'Sfax Centre', governorate: 'Sfax', coords: [34.7406, 10.7603] },
  { name: 'Sakiet Ezzit', governorate: 'Sfax', coords: [34.8, 10.76] },
  { name: 'Bizerte', governorate: 'Bizerte', coords: [37.2744, 9.8739] },
  { name: 'Menzel Bourguiba', governorate: 'Bizerte', coords: [37.154, 9.785] },
  { name: 'Menzel Jemil', governorate: 'Bizerte', coords: [37.238, 9.915] },
  { name: 'Menzel Abderrahmane', governorate: 'Bizerte', coords: [37.23, 9.86] },
  { name: 'El Alia', governorate: 'Bizerte', coords: [37.17, 10.03] },
  { name: 'Metline', governorate: 'Bizerte', coords: [37.247, 10.05] },
  { name: 'Ras Jebel', governorate: 'Bizerte', coords: [37.215, 10.12] },
  { name: 'Rafraf', governorate: 'Bizerte', coords: [37.19, 10.184] },
  { name: 'Ghar El Melh', governorate: 'Bizerte', coords: [37.169, 10.189] },
  { name: 'Utique', governorate: 'Bizerte', coords: [37.05, 10.06] },
  { name: 'Mateur', governorate: 'Bizerte', coords: [37.04, 9.665] },
  { name: 'Béja', governorate: 'Béja', coords: [36.725, 9.182] },
];

function distanceKm([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  const dLat = (lat2 - lat1) * 111;
  const dLng = (lng2 - lng1) * 111 * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180));
  return Math.hypot(dLat, dLng);
}

/** Current position as an address: "Hammamet, Nabeul" or "4 km de Bouficha, Sousse" */
export function addressNear(coords: [number, number]): string {
  let best = TUNISIA_PLACES[0];
  let bestKm = Infinity;
  for (const p of TUNISIA_PLACES) {
    const d = distanceKm(coords, p.coords);
    if (d < bestKm) {
      best = p;
      bestKm = d;
    }
  }
  const where = best.name === best.governorate ? best.name : `${best.name}, ${best.governorate}`;
  return bestKm < 2 ? where : `${Math.round(bestKm)} km de ${where}`;
}
