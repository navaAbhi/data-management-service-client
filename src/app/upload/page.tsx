"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import UploadForm from "@/components/uploadForm";
import axios from "axios";

export default function UploadPage() {
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "complete" | "error">("idle");
    const [statusText, setStatusText] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [authenticated, setAuthenticated] = useState<boolean>(false);

    const handleLogin = async () => {
        if (!email.trim()) return;
        try {
            const response = await axios.post("http://localhost:8000/login",
                { email: email.trim() },
                { withCredentials: true }
            );

            if (response.status === 200) {
                setUserEmail(email.trim());
                setEmail("");
                setAuthenticated(true);
            }
        } catch (err) {
            console.error("Login failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            <Navbar authenticated={authenticated} setAuthenticated={setAuthenticated} />
            <main className="p-6 max-w-4xl mx-auto">
                {!userEmail && (
                    <div className="mb-6 bg-white p-6 rounded shadow-md border">
                        <h2 className="text-xl font-semibold mb-2">Login / Signup</h2>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="border border-gray-300 rounded p-2 flex-1"
                            />
                            <button
                                onClick={handleLogin}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            >
                                Login / Signup
                            </button>
                        </div>
                    </div>
                )}

                {userEmail && (
                    <div className="mb-6 bg-white p-6 rounded shadow-md border">
                        <p className="text-xl mb-2 text-green-700 font-medium">Welcome, {userEmail}!</p>
                    </div>
                )}

                <h1 className="text-3xl font-semibold mb-6">Upload Your Data</h1>
                <UploadForm setUploadStatus={setUploadStatus} setStatusText={setStatusText} />

                {uploadStatus !== "idle" && (
                    <div className="mt-6 p-4 rounded bg-white shadow-md border border-gray-200">
                        <h2 className="font-medium mb-2">Status</h2>
                        {uploadStatus === "uploading" && <p className="text-yellow-600">Uploading... {statusText}</p>}
                        {uploadStatus === "complete" && <p className="text-green-600">✅ Upload complete!</p>}
                        {uploadStatus === "error" && <p className="text-red-600">❌ Upload failed. {statusText}</p>}
                    </div>
                )}
            </main>
        </div>
    );
}
