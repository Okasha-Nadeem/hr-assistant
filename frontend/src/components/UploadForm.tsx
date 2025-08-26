import React from "react";

type Props = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
};

export default function UploadForm({ file, onFileChange, name, setName, email, setEmail }: Props) {
  return (
    <div className="upload-form">
      <div className="form-row">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
      </div>

      <div className="form-row">
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>

      <div className="form-row">
        <label>Upload CV (PDF or DOCX)</label>
        <input type="file" accept=".pdf,.docx" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
        {file && <div className="file-info">Selected: {file.name}</div>}
      </div>
    </div>
  );
}
