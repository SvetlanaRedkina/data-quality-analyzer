'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  // Function to check if a link is active
  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold flex items-center">
          <svg
            xmlns="https://nam02.safelinks.protection.outlook.com/?url=http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg&data=05%7C02%7Csvetlana.redkina%40assaabloy.com%7C213c69833f88457c864208dd5750dab2%7Cf0bdc1c951484f86ac40edd976e1814c%7C0%7C0%7C638762726965352748%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=RJ3DCAq7nFubwTynt4FakEPSJky%2F3jazhBftVb55%2F7g%3D&reserved=0"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Data Quality Tool
        </Link>

        <div className="flex space-x-2">
          <Link
            href="/"
            className={`px-3 py-2 rounded-md transition ${
              isActive('/')
                ? 'bg-blue-700 font-medium'
                : 'hover:bg-blue-700 hover:bg-opacity-70'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/history"
            className={`px-3 py-2 rounded-md transition ${
              isActive('/history')
                ? 'bg-blue-700 font-medium'
                : 'hover:bg-blue-700 hover:bg-opacity-70'
            }`}
          >
            History
          </Link>
          <Link
            href="/settings"
            className={`px-3 py-2 rounded-md transition ${
              isActive('/settings')
                ? 'bg-blue-700 font-medium'
                : 'hover:bg-blue-700 hover:bg-opacity-70'
            }`}
          >
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}