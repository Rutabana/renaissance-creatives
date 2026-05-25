// Base URL for this project's media on S3, served via CloudFront.
// Bucket prefix: rennaissance-creatives/  (see CLAUDE.md "Asset Management").
//
// NOTE: only assets loaded via plain <img> are served from the CDN today.
// WebGL/canvas assets (women.glb, church-background.jpg, pirate-map.jpeg,
// book covers, birds) are loaded by three.js / canvas with crossOrigin and
// require an Access-Control-Allow-Origin header the bucket does not yet send,
// so those stay local until bucket CORS + CloudFront Origin-forwarding is set.
export const CDN = "https://d3s90ejqky0l1n.cloudfront.net/rennaissance-creatives";
