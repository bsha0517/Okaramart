// Update these to your real profile URLs before launch
const SOCIAL_LINKS = {
  instagram: "https://instagram.com/okaramart",
  facebook: "https://facebook.com/okaramart",
  tiktok: "https://tiktok.com/@okaramart",
};

export default function SocialLinks() {
  return (
    <div className="flex items-center gap-3">
      <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
        className="w-8 h-8 rounded-full bg-canal/5 flex items-center justify-center text-canal hover:bg-canal/10">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
        className="w-8 h-8 rounded-full bg-canal/5 flex items-center justify-center text-canal hover:bg-canal/10">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.25-1.5 1.55-1.5H16.5V4.3c-.28-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.92V10.5H8v3h2.42V21h3.08z"/>
        </svg>
      </a>
      <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"
        className="w-8 h-8 rounded-full bg-canal/5 flex items-center justify-center text-canal hover:bg-canal/10">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.6 5.82a4.28 4.28 0 01-.61-2.46h-3.06v13.4a2.6 2.6 0 11-2.6-2.6c.24 0 .47.03.7.09v-3.1a5.7 5.7 0 00-.7-.04A5.7 5.7 0 105.7 16.8a5.7 5.7 0 005.63-4.87V9.36a7.3 7.3 0 004.27 1.37V7.67a4.28 4.28 0 01-.99-1.85z"/>
        </svg>
      </a>
    </div>
  );
}
