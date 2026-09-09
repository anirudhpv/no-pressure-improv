// Pulls recent posts via the Instagram Graph API and writes assets/data/instagram.json.
// Requires env vars IG_ACCESS_TOKEN (a long-lived token) and IG_USER_ID (the Instagram
// Business/Creator account's numeric id). See README.md, "Instagram carousel" section,
// for how to obtain both.
const fs = require("fs");
const path = require("path");

const TOKEN = process.env.IG_ACCESS_TOKEN;
const USER_ID = process.env.IG_USER_ID;
const LIMIT = 12;
const CAPTION_MAX = 140;
const OUT_PATH = path.join(__dirname, "..", "..", "assets", "data", "instagram.json");

if (!TOKEN || !USER_ID) {
  console.error("Missing IG_ACCESS_TOKEN or IG_USER_ID — skipping (leaving instagram.json untouched).");
  process.exit(0);
}

function truncate(s, max) {
  if (!s) return "";
  const oneLine = s.replace(/\s+/g, " ").trim();
  return oneLine.length > max ? oneLine.slice(0, max - 1).trimEnd() + "…" : oneLine;
}

async function main() {
  const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
  const url = `https://graph.facebook.com/v19.0/${USER_ID}/media?fields=${fields}&limit=${LIMIT}&access_token=${TOKEN}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) {
    throw new Error(`Instagram Graph API error: ${json.error.message}`);
  }

  const posts = (json.data || []).map(p => ({
    id: p.id,
    permalink: p.permalink,
    caption: truncate(p.caption, CAPTION_MAX),
    imageUrl: p.media_type === "VIDEO" ? p.thumbnail_url : p.media_url,
    timestamp: p.timestamp,
  })).filter(p => p.imageUrl);

  fs.writeFileSync(OUT_PATH, JSON.stringify(posts, null, 2) + "\n");
  console.log(`Wrote ${posts.length} posts to ${OUT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
