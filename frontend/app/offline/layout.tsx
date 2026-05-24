// Offline page gets its own minimal layout — no Header/Footer/API calls
// This prevents static generation timeout on Vercel build
export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
