import React, { useRef } from "react";
import "./css/attach-modal.css";

interface AttachModalProps {
  onClose: () => void;
  onSelectFile: (files: FileList | null) => void;
  onSelectVideo: (files: FileList | null) => void;
  onSelectImage: (files: FileList | null) => void;
}

const AttachModal: React.FC<AttachModalProps> = ({
  onClose,
  onSelectFile,
  onSelectVideo,
  onSelectImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handler: (files: FileList | null) => void
  ) => {
    handler(e.target.files);
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="attach-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Add Attachment</h2>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>

          <div className="attach-options">
            <div
              className="option-item"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="icon-wrapper file">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <span className="option-label">File</span>
              <span className="option-subtext">PDF, DOC, TXT, PPTX, etc</span>
            </div>

            <div
              className="option-item"
              onClick={() => videoInputRef.current?.click()}
            >
              <div className="icon-wrapper video">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <span className="option-label">Video</span>
              <span className="option-subtext">MP4, MOV, AVI</span>
            </div>

            <div
              className="option-item"
              onClick={() => imageInputRef.current?.click()}
            >
              <div className="icon-wrapper image">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
              <span className="option-label">Photo</span>
              <span className="option-subtext">
                PNG, JPG, GIF, WEBP, SVG, ICO
              </span>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => handleInputChange(e, onSelectFile)}
          />
          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            style={{ display: "none" }}
            onChange={(e) => handleInputChange(e, onSelectVideo)}
          />
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleInputChange(e, onSelectImage)}
          />
        </div>
      </div>
    </>
  );
};

export default AttachModal;
