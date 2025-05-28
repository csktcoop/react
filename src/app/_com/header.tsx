import Link from 'next/link';
import SiteNav from './site-nav';

export default function Header() {
  return (
    <header className="bg-gray-900 text-white py-4 sticky top-0 z-50">
      {/* Header container */}
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Website title */}
        <h1 className="text-xl font-semibold">Jordan Thirkle</h1>
        {/* Navigation menu */}
        <SiteNav />
        {/* Social media icons */}
        <div className="hidden md:block">
          <SocialIcons />
        </div>
        {/* Add Mobile Navigation Toggle Here */}
      </div>
    </header>
  );
}

// Define the SocialIcons component
function SocialIcons() {
  return (
    <div className="flex gap-x-4">
      {/* Twitter icon */}
      <a
        href="https://twitter.com/PROFILE"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="text-white hover:text-gray-300" ></i>
      </a>
      {/* GitHub icon */}
      <a
        href="https://github.com/PROFILE"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="text-white hover:text-gray-300" ></i>
      </a>
      {/* Add more social media icons as needed */}
    </div>
  );
}