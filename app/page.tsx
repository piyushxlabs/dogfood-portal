// app/page.tsx
// Public landing page redirecting to public gallery
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/projects');
}
