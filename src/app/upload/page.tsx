"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import UploadForm from "@/components/uploadForm";

export default function UploadPage() {
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "complete" | "error">("idle");
    const [statusText, setStatusText] = useState("");

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            <Navbar />
            <main className="p-6 max-w-4xl mx-auto">
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
