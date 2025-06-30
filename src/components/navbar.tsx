// components/Navbar.tsx
export default function Navbar({ authenticated }: { authenticated: boolean }) {
    return (
        <header className="bg-white shadow-md">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-800">Data Management Service</h1>

                <div className="flex items-center gap-4">
                    {/* Example connected accounts display */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Connected: Google Drive</span>
                        <button className="text-red-500 hover:underline text-sm">Disconnect</button>
                    </div>

                    <hr className="border-l h-5 rotate-180" />

                    {authenticated && (
                        <button className="text-red-500 hover:underline text-sm">Logout</button>
                    )}
                </div>
            </div>
        </header>
    );
}
