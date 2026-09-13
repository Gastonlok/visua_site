export function siteUrl() {
 const url = new URL(process.env.SITE_URL || 'http://localhost:3000');
 if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('SITE_URL doit être une origine HTTP(S).');
 return url.origin;
}
export function isPublic() { return process.env.SITE_PUBLIC === 'true'; }
export function authSecret() {
 const secret = process.env.AUTH_SECRET;
 if (!secret || secret.length < 32) throw new Error('AUTH_SECRET doit contenir au moins 32 caractères.');
 return secret;
}
