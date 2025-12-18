import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

const CVUploadButton = ({ onMatchesFound }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Call chatbot API
      const response = await axios.post(
        "http://localhost:8001/find_matches",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Pass results to parent component
      if (response.data && response.data.matches) {
        onMatchesFound(response.data.cv_text, response.data.matches);
      }
    } catch (err) {
      console.error("Error uploading CV:", err);
      setError("Failed to analyze CV. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="cv-upload"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <label
        htmlFor="cv-upload"
        className={`
          relative w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all
          ${isUploading 
            ? "bg-slate-500 cursor-not-allowed" 
            : "bg-green-600 hover:bg-green-700"
          }
        `}
        title="Upload CV to find matching jobs"
      >
        {isUploading ? (
          <span className="text-white text-xl animate-spin">⟳</span>
        ) : (
          <span className="text-white text-xl">📄</span>
        )}
      </label>
      
      {error && (
        <div className="absolute top-full mt-2 right-0 bg-red-500 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
};

CVUploadButton.propTypes = {
  onMatchesFound: PropTypes.func.isRequired,
};

export default CVUploadButton;
