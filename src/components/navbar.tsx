import axiosInstance from "@/lib/axiosInstance";

export default function Navbar({ authenticated, setAuthenticated }: { authenticated: boolean, setAuthenticated: React.Dispatch<React.SetStateAction<boolean>> }) {
    const handleLogout = async () => {
        try {
            const response = await axiosInstance.post("http://localhost:8000/logout",
                { withCredentials: true }
            );

            if (response.status === 200) {
                console.log("User logged out successfully!");
                setAuthenticated(false);
            }
        } catch (err) {
            console.error("Login failed:", err);
        }
    };

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

                    {authenticated && (
                        <hr className="border-l h-5 rotate-180" />
                    )}

                    {authenticated && (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-red-500 hover:underline text-sm"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
