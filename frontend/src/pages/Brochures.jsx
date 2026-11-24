import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import api from "../services/api";

import "./Brochures.css";

const Brochures = () => {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const [brochures, setBrochures] = useState([]);
  const [loadingBrochures, setLoadingBrochures] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  // Maximum file size: 25 MB
  const MAX_FILE_SIZE = 25 * 1024 * 1024;

  // =========================================
  // FETCH BROCHURES
  // =========================================

  const fetchBrochures = async () => {
    try {
      setLoadingBrochures(true);
      setFetchError("");

      const response = await api.get("/brochures");

      setBrochures(response.data.brochures || []);
    } catch (error) {
      console.error("Failed to fetch brochures:", error);

      setFetchError(
        error.response?.data?.message || "Unable to load brochures.",
      );
    } finally {
      setLoadingBrochures(false);
    }
  };

  useEffect(() => {
    fetchBrochures();
  }, []);

  // =========================================
  // HANDLE PDF SELECTION
  // =========================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    setError("");
    setUploadError("");
    setUploadSuccess("");
    setSelectedFile(null);

    if (!file) return;

    // Validate PDF extension and MIME type
    if (
      file.type !== "application/pdf" ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      e.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File size cannot exceed 25 MB.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // =========================================
  // UPLOAD BROCHURE
  // =========================================

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a PDF first.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadSuccess("");

      const formData = new FormData();

      // Must match upload.single("brochure") in backend
      formData.append("brochure", selectedFile);

      const response = await api.post("/brochures/upload", formData);

      setUploadSuccess(
        response.data.message || "Brochure uploaded successfully.",
      );

      await fetchBrochures();

      // Clear selected file after successful upload
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Brochure upload failed:", error);

      setUploadError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to upload brochure. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================================
  // REMOVE SELECTED FILE
  // =========================================

  const handleRemove = () => {
    setSelectedFile(null);
    setError("");
    setUploadError("");
    setUploadSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================
  // DELETE BROCHURE
  // =========================================

  const handleDelete = async (brochureId) => {
    try {
      setDeletingId(brochureId);
      setDeleteError("");

      // Immediately call the backend delete API
      await api.delete(`/brochures/${brochureId}`);

      // Remove brochure from the UI after successful deletion
      setBrochures((previousBrochures) =>
        previousBrochures.filter((brochure) => brochure._id !== brochureId),
      );
    } catch (error) {
      console.error("Brochure deletion failed:", error);

      setDeleteError(
        error.response?.data?.message ||
          "Failed to delete brochure. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================
  // FORMAT FILE SIZE
  // =========================================

  const formatFileSize = (bytes) => {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // =========================================
  // JSX
  // =========================================

  return (
    <div className="brochures-page">
      <Navbar />

      <main className="brochures-container">
        {/* PAGE HEADER */}

        <div className="brochures-header">
          <div>
            <span className="page-eyebrow">DOCUMENT MANAGEMENT</span>

            <h1>Vehicle Brochures</h1>

            <p>
              Upload Hyundai vehicle brochures to provide accurate information
              to your AI assistant.
            </p>
          </div>

          <Link to="/dashboard" className="back-dashboard">
            ← Back to Dashboard
          </Link>
        </div>

        {/* UPLOAD SECTION */}

        <section className="upload-section">
          <div className="upload-heading">
            <div>
              <h2>Upload a brochure</h2>
              <p>Select a Hyundai vehicle brochure in PDF format.</p>
            </div>
          </div>

          {/* FILE DROPZONE */}

          <div
            className="upload-dropzone"
            onClick={() => {
              if (!uploading) {
                fileInputRef.current?.click();
              }
            }}
            onKeyDown={(e) => {
              if (!uploading && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={uploading ? -1 : 0}
            aria-disabled={uploading}
          >
            <div className="upload-icon">
              <span>PDF</span>
            </div>

            <h3>Choose a PDF brochure</h3>

            <p>Click here to browse files from your device.</p>

            <span className="upload-format">
              PDF files only · Maximum size 25 MB
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              hidden
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {/* FILE VALIDATION ERROR */}

          {error && <div className="brochure-error">{error}</div>}

          {/* SELECTED FILE */}

          {selectedFile && (
            <div className="selected-file">
              <div className="selected-file-icon">PDF</div>

              <div className="selected-file-details">
                <strong>{selectedFile.name}</strong>

                <span>{formatFileSize(selectedFile.size)}</span>

                <small>Selected locally — ready to upload</small>
              </div>

              <button
                type="button"
                className="remove-file-button"
                onClick={handleRemove}
                disabled={uploading}
                aria-label="Remove selected file"
              >
                Remove
              </button>
            </div>
          )}

          {/* UPLOAD BUTTON */}

          <button
            type="button"
            className="upload-button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Uploading..." : "Upload Brochure"}
          </button>

          {/* UPLOAD ERROR */}

          {uploadError && <div className="brochure-error">{uploadError}</div>}

          {/* UPLOAD SUCCESS */}

          {uploadSuccess && (
            <div className="brochure-success">{uploadSuccess}</div>
          )}
        </section>

        {/* DOCUMENTS SECTION */}

        <section className="documents-section">
          <div className="documents-heading">
            <div>
              <h2>Uploaded brochures</h2>

              <p>Documents stored in your Hyundai AI workspace.</p>
            </div>

            <span className="document-count">
              {brochures.length}{" "}
              {brochures.length === 1 ? "document" : "documents"}
            </span>
          </div>

          {/* DELETE ERROR */}

          {deleteError && <div className="brochure-error">{deleteError}</div>}

          {/* LOADING */}

          {loadingBrochures && (
            <div className="empty-documents">
              <p>Loading brochures...</p>
            </div>
          )}

          {/* FETCH ERROR */}

          {!loadingBrochures && fetchError && (
            <div className="brochure-error">
              {fetchError}

              <button type="button" onClick={fetchBrochures}>
                Retry
              </button>
            </div>
          )}

          {/* EMPTY STATE */}

          {!loadingBrochures && !fetchError && brochures.length === 0 && (
            <div className="empty-documents">
              <div className="empty-documents-icon">PDF</div>

              <h3>No brochures uploaded yet</h3>

              <p>
                Upload your first Hyundai vehicle brochure to start building
                your knowledge base.
              </p>
            </div>
          )}

          {/* BROCHURE LIST */}

          {!loadingBrochures && !fetchError && brochures.length > 0 && (
            <div className="brochures-grid">
              {brochures.map((brochure) => (
                <div className="brochure-card" key={brochure._id}>
                  {/* PDF ICON */}

                  <div className="brochure-card-icon">PDF</div>

                  {/* BROCHURE DETAILS */}

                  <div className="brochure-card-details">
                    <h3>{brochure.originalName}</h3>

                    <p>{formatFileSize(brochure.fileSize)}</p>

                    <span className="brochure-status">
                      {brochure.processingStatus}
                    </span>

                    <small>
                      Uploaded:{" "}
                      {new Date(brochure.createdAt).toLocaleDateString()}
                    </small>
                  </div>

                  {/* DELETE BUTTON */}

                  <button
                    type="button"
                    className="delete-brochure-button"
                    onClick={() => handleDelete(brochure._id)}
                    disabled={deletingId === brochure._id}
                    title="Delete brochure"
                    aria-label={`Delete ${brochure.originalName}`}
                  >
                    {deletingId === brochure._id ? (
                      <span className="delete-loading">...</span>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="m19 6-1 14H6L5 6" />
                        <path d="M10 11v5M14 11v5" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Brochures;
