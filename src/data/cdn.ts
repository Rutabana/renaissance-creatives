// Base URL for this project's media.
//
// Every heavy asset lives on S3 (bucket prefix `rennaissance-creatives/`) behind
// CloudFront — see CLAUDE.md "Asset Management".
//
// We do NOT point at the CloudFront host directly. Almost everything here is
// pulled in by three.js / react-globe.gl / canvas, which fetch with
// `crossOrigin="anonymous"`, and the bucket does not send
// `Access-Control-Allow-Origin` (fixing that needs admin AWS creds — the
// `LightsailAPIUser` profile is denied `s3:PutBucketCORS`).
//
// Instead we serve the CDN under a SAME-ORIGIN path, `/cdn/*`, proxied to
// CloudFront by:
//   - production: the rewrite in `vercel.json`
//   - dev/preview: the `/cdn` proxy in `vite.config.ts`
// Same-origin means the CORS check never happens, so WebGL assets just work.
export const CDN = "/cdn";

// The upstream the `/cdn` path proxies to. Kept here so vercel.json and
// vite.config.ts have one documented source of truth.
export const CDN_ORIGIN = "https://d3s90ejqky0l1n.cloudfront.net";
export const CDN_PREFIX = "/rennaissance-creatives";
