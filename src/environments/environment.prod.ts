

// environment.prod.ts  (PROD)
export const environment = {
  production: true,

  // 1)  KEIN Slash am Ende (damit /videos/ usw. korrekt angehängt werden)
  // 2)  Gleiche Basis-Domain wie authUrl, sonst CORS-Chaos
  apiUrl:  'https://api.videoflix.com/api',

  // dito – keine doppelte Domain (.com ⇆ .xyz) und kein Slash am Ende
  authUrl: 'https://api.videoflix.com/api/auth',

  // Für statische Dateien DARF ein Slash bleiben
  staticUrl: 'https://api.videoflix.com/',
};
