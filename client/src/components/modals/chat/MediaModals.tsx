import { useEffect, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import {
  MessagesDTO,
  MessageType,
} from "../../../services/socket/dto/messages-dto";
import ChatImage from "../../messenger/utils/media/ChatImage";
import ChatVideo from "../../messenger/utils/media/ChatVideo";
import ErrorMessage from "../../messages/ErrorMessage";
import SuccessMessage from "../../messages/SuccessMessage";
import { Tooltip } from "@mui/material";

interface MediaModalProps {
  messages: MessagesDTO[];
  setIsMediaModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MediaModal = ({ messages, setIsMediaModalOpen }: MediaModalProps) => {
  const [images, setImages] = useState<MessagesDTO[]>([]);
  const [videos, setVideos] = useState<MessagesDTO[]>([]);
  const [files, setFiles] = useState<MessagesDTO[]>([]);

  const [activeTab, setActiveTab] = useState<"images" | "videos" | "files">(
    "images"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const filteredImages = messages.filter(
      (message) => message.message_type === MessageType.IMAGE
    );
    const filteredVideos = messages.filter(
      (message) => message.message_type === MessageType.VIDEO
    );
    const filteredFiles = messages.filter(
      (message) => message.message_type === MessageType.FILE
    );
    setImages(filteredImages);
    setVideos(filteredVideos);
    setFiles(filteredFiles);
  }, [messages]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownloadFile = async (message: MessagesDTO) => {
    try {
      const response = await fetch(message.content);

      if (!response.ok) throw new Error("Failed to download file");

      if (message.message_type !== MessageType.FILE) {
        setErrorMessage("File not found");
      }

      const blob = await response.blob();

      const file_url = message.content;
      const file_name = file_url.split("/").pop();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `connectify/${file_name}`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMessage("File downloaded successfully");
    } catch {
      setErrorMessage("Download failed. Please try again later.");
    }
  };

  return (
    <>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Media Library
            </h2>
            <button
              onClick={() => setIsMediaModalOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b dark:border-gray-700 justify-center">
            {(["images", "videos", "files"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 font-medium capitalize transition-colors
                ${
                  activeTab === tab
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "images" && (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.length > 0 ? (
                  <>
                    {images.map((message, index) => (
                      <div
                        key={message.id || index}
                        className="aspect-square bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl cursor-pointer"
                      >
                        <ChatImage message={message} />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-white text-center">
                    There is no image in this chat
                  </div>
                )}
              </div>
            )}

            {activeTab === "videos" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {videos.length > 0 ? (
                    <>
                      {videos.map((message, index) => (
                        <div
                          key={message.id || index}
                          className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer"
                        >
                          <ChatVideo message={message} isInModal={true} />
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-white text-center">
                      There is no video in this chat
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "files" && (
              <div className="space-y-4">
                {files.length > 0 ? (
                  <>
                    {files.map((message, index) => (
                      <div
                        key={message.id || index}
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="flex">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                            <svg
                              className="w-6 h-6 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {message.message_name ?? "Imported File"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatFileSize(message.message_size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button onClick={() => handleDownloadFile(message)}
                            className="text-white">
                            <Tooltip
                              placement="top"
                              title={`Download "${message.message_name ?? "Imported File"}"`}
                            >
                              <DownloadIcon />
                            </Tooltip>
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-white text-center">
                    There is no file in this chat
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 p-6 border-t dark:border-gray-700">
            <button
              className="px-6 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsMediaModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MediaModal;
