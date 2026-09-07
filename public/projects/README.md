# Project media

Edit `app/data/projects.ts` to update the portfolio. Each entry has `title`, `category`, `thumbnail`, `videoUrl`, and an optional `externalUrl`.

Place thumbnails and videos in this directory and reference them without `/public`, for example:

```ts
{
  title: "Gaming Edit",
  category: "Gaming",
  thumbnail: "/projects/gaming-edit.jpg",
  videoUrl: "/projects/gaming-edit.mp4",
  externalUrl: "https://example.com/project",
}
```

JPG, PNG, WebP, and SVG thumbnails work; 16:9 is recommended. MP4 with H.264/AAC is recommended for video compatibility. Hosted direct video URLs also work. YouTube/Vimeo watch-page URLs are not video files; use `externalUrl` for those links.

The six included SVG thumbnails are sample artwork. All entries currently share the public MDN flower demo video; replace these URLs with your own footage. Demo playback requires internet access. Videos start only when the visitor presses play and are removed when the lightbox closes.

Update the sample-project subtitle in `app/components/selected-work.tsx` when your actual work is ready.
