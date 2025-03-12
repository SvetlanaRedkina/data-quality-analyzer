'use client';
import Link from 'next/link';
import { usePathname} from 'next/navigation';

export default function SimpleNavbar() {
    const pathname = usePathname();

    const isActive = (path) => {
        return pathname === path;
    };

    return (
        <nav className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold flex items-center">Data Quality Tool</Link>
                <div className="flex space-x-2">
                    <Link href="/" className="px-3 py-2 rounded-md transition">Dashboard</Link>
                </div>
                <div className="flex space-x-2">
                    <Link href="/history" className="px-3 py-2 rounded-md transition">History</Link>
                </div>
                <div className="flex space-x-2">
                    <Link href="/settings" className="px-3 py-2 rounded-md transition">Settings</Link>
                </div>
            </div>
        </nav>
        
    );
}