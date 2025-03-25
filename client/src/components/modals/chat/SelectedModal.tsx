import React, { useEffect } from "react";
import {
  FileCopy as FileCopyIcon,
  Image as ImageIcon,
  SlowMotionVideo as SlowMotionVideoIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import "./css/selected-modal.css";

interface SelectedModalProps {
  file: File | null;
  onClose: () => void;
  onUpload: () => void;
}

const SelectedModal: React.FC<SelectedModalProps> = ({
  file,
  onClose,
  onUpload,
}) => {
  useEffect(() => {
    return () => {
      if (file) URL.revokeObjectURL(URL.createObjectURL(file));
    };
  }, [file]);

  if (!file) return null;

  const getFileType = () => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "file";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderPreview = () => {
    const fileType = getFileType();
    const previewUrl = URL.createObjectURL(file);

    switch (fileType) {
      case "image":
        return (
          <img
            src={previewUrl}
            alt="Selected content"
            className="file-preview image-preview"
          />
        );
      case "video":
        return (
          <video controls className="file-preview">
            <source src={previewUrl} type={file.type} />
            Your browser does not support the video tag.
          </video>
        );
      default:
        return (
          <div className="file-icon">
            <FileCopyIcon />
            <span className="file-extension">{file.name.split(".").pop()}</span>
          </div>
        );
    }
  };

  return (
    <div className="modal-overlay selected-modal-overlay" onClick={onClose}>
      <div className="selected-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {getFileType() === "image" && <ImageIcon className="type-icon" />}
            {getFileType() === "video" && (
              <SlowMotionVideoIcon className="type-icon" />
            )}
            {getFileType() === "file" && <FileCopyIcon className="type-icon" />}
            {file.name}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <CloudUploadIcon />
          </button>
        </div>

        <div className="preview-container">
          {renderPreview()}
          <div className="file-info">
            <div className="info-row">
              <span>Type:</span>
              <span>{file.type}</span>
            </div>
            <div className="info-row">
              <span>Size:</span>
              <span>{formatFileSize(file.size)}</span>
            </div>
            <div className="info-row">
              <span>Last Modified:</span>
              <span>{new Date(file.lastModified).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="upload-btn" onClick={onUpload}>
            <CloseIcon className="upload-icon" />
            {getFileType() === "image" && "Upload Image"}
            {getFileType() === "video" && "Upload Video"}
            {getFileType() === "file" && "Upload File"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectedModal;
