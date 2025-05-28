import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'About',
    description: 'Home description',
    keywords: ['Next.js', 'React', 'JavaScript']
    // TODO openGraph: {}
}

const siteLogo = {
    url: 'https://i.imgur.com/yXOvdOSs.jpg',
    alt: 'Site Name',
};
const photo = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2048&q=20";
const user = {
    name: 'Anonymous',
    imageUrl: 'https://i.imgur.com/yXOvdOSs.jpg',
    imageSize: 90,
};

export default function Page() {
  return (
    <>
        about
    </>
  );
}
