/**
 * En-tetes de securite de base (OWASP A05 : Security Misconfiguration).
 * Aucun n'etait present avant ce fichier.
 *
 * La CSP est volontairement en mode Report-Only : le site charge des scripts,
 * styles et websockets depuis plusieurs CDN externes (bootstrap-icons,
 * font-awesome, swiper, dropzone, apexcharts, vue-multiselect, Pusher) et une
 * regle trop stricte casserait silencieusement l'affichage (icones, cartes,
 * temps reel) sans erreur serveur visible. En Report-Only, les violations
 * s'affichent dans la console du navigateur sans rien bloquer — a verifier en
 * conditions reelles avant de passer en Content-Security-Policy (bloquant).
 */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'DENY')
  setResponseHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
  setResponseHeader(event, 'Permissions-Policy', 'geolocation=(self), camera=(), microphone=(), payment=(self)')

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com https://fonts.googleapis.com",
    "font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https: wss:",
  ].join('; ')

  setResponseHeader(event, 'Content-Security-Policy-Report-Only', csp)
})
