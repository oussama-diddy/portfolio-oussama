export type Project = {
  title: string;
  category: string;
  thumbnail: string;
  videoUrl: string;
  externalUrl?: string;
};

export const projects: Project[] = [
  { title: "Gaming Highlights", category: "Gaming", thumbnail: "/projects/gaming-edit.jpg", videoUrl: "/projects/gaming-edit.mp4" },
  { title: "YouTube Videos", category: "YouTube Content", thumbnail: "/projects/youtube-videos.jpg", videoUrl: "/projects/youtube-videos.mp4" },
  { title: "Cinematic Edit", category: "Cinematic", thumbnail: "/projects/cinematic-edit.jpg", videoUrl: "/projects/cinematic-edit.mp4" },
  { title: "Promo Video", category: "Promotional", thumbnail: "/projects/promo-video.jpg", videoUrl: "/projects/promo-video.mp4" },
];
