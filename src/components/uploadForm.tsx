"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";

type Props = {
    setUploadStatus: (status: "idle" | "uploading" | "complete" | "error") => void;
    setStatusText: (msg: string) => void;
};

export default function UploadForm({ setUploadStatus, setStatusText }: Props) {
    const [method, setMethod] = useState("local");
    const [file, setFile] = useState<File | null>(null);
    const [s3Link, setS3Link] = useState("");

    const handleLocalUpload = async () => {
        try {
            if (!file) return;

            setUploadStatus("uploading");
            setStatusText("Requesting pre-signed URL from server...");

            const presignResult = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_BACKEND_API}/import/local/presigned-url`,
                {
                    filename: file.name,
                    content_type: file.type,
                    size: file.size
                },
            );

            setStatusText("Uploading file directly to S3...");

            const { presigned } = presignResult.data;
            const { presigned_post, s3_key } = presigned;
            const { url, fields } = presigned_post;

            if (!url || !fields) {
                throw new Error("Invalid presigned response shape from backend");
            }

            const formData = new FormData();
            Object.entries(fields).forEach(([key, value]) =>
                formData.append(key, String(value))
            );
            formData.append("file", file);

            await axiosInstance.post(url, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setStatusText("Notifying server of completed upload...");

            await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_BACKEND_API}/import/local/complete`,
                {
                    s3_key,
                    original_filename: file.name,
                    size: file.size
                },
            );

            setStatusText("File upload complete. Server is processing your data...");

            // const job_id = 1;

            // const poll = setInterval(async () => {
            //     const statusRes = await axiosInstance.get(`/api/import/${job_id}`);
            //     if (statusRes.data.status === "complete") {
            //         clearInterval(poll);
            //         setUploadStatus("complete");
            //     } else if (statusRes.data.status === "error") {
            //         clearInterval(poll);
            //         setUploadStatus("error");
            //         setStatusText("Upload failed.");
            //     } else {
            //         setStatusText(`Progress: ${statusRes.data.progress}%`);
            //     }
            // }, 2000);
        } catch (err) {
            console.error(err);
            setUploadStatus("error");
            setStatusText("Upload error");
        }
    };

    const handleS3LinkUpload = async () => {
        try {
            setUploadStatus("uploading");
            const res = await axiosInstance.post("/api/import/s3", { url: s3Link });
            const job_id = res.data.job_id;

            // Poll status
            const poll = setInterval(async () => {
                const statusRes = await axiosInstance.get(`/api/import/${job_id}`);
                if (statusRes.data.status === "complete") {
                    clearInterval(poll);
                    setUploadStatus("complete");
                } else if (statusRes.data.status === "error") {
                    clearInterval(poll);
                    setUploadStatus("error");
                    setStatusText("Failed to import from S3");
                } else {
                    setStatusText(`Progress: ${statusRes.data.progress}%`);
                }
            }, 2000);
        } catch (err) {
            console.error(err);
            setUploadStatus("error");
            setStatusText("S3 upload error");
        }
    };

    const handleCloudAuth = (provider: "google" | "onedrive") => {
        window.location.href = `/api/oauth/${provider}`;
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (method === "local" && file) {
            await handleLocalUpload();
        } else if (method === "s3" && s3Link) {
            await handleS3LinkUpload();
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded shadow-md border">
            <div>
                <label className="block font-medium mb-2">Select Upload Method</label>
                <div className="flex gap-4">
                    <button type="button" className={`px-3 py-2 rounded ${method === "local" ? "bg-blue-500 text-white" : "bg-gray-100"}`} onClick={() => setMethod("local")}>Local</button>
                    <button type="button" className={`px-3 py-2 rounded ${method === "s3" ? "bg-blue-500 text-white" : "bg-gray-100"}`} onClick={() => setMethod("s3")}>S3 Link</button>
                    <button type="button" className="px-3 py-2 bg-gray-100 rounded" onClick={() => handleCloudAuth("google")}>Connect Google Drive</button>
                    <button type="button" className="px-3 py-2 bg-gray-100 rounded" onClick={() => handleCloudAuth("onedrive")}>Connect OneDrive</button>
                </div>
            </div>

            {method === "local" && (
                <div>
                    <label className="block mb-2 text-sm font-medium">Select File</label>
                    <input
                        type="file"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            if (e.target.files?.[0]) setFile(e.target.files[0]);
                        }}
                        className="block w-full border rounded px-3 py-2"
                    />
                </div>
            )}

            {method === "s3" && (
                <div>
                    <label className="block mb-2 text-sm font-medium">S3 URL</label>
                    <input
                        type="text"
                        value={s3Link}
                        onChange={(e) => setS3Link(e.target.value)}
                        placeholder="https://s3.amazonaws.com/your-bucket/file.csv"
                        className="block w-full border rounded px-3 py-2"
                    />
                </div>
            )}

            {(method === "local" || method === "s3") && (
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded">
                    Start Upload
                </button>
            )}
        </form>
    );
}
