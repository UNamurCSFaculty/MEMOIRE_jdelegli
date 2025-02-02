import { useState } from "react";

export default function SetUserProfile() {
  const [file, setFile] = useState<File | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  }

  function savePicture() {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // apiClient.setUserPicture({ formData });z

    fetch("/elder-rings/api/user/set-picture", {
      method: "POST",
      body: formData,
    });
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={savePicture} disabled={!file}>
        Upload Picture
      </button>
    </div>
  );
}
