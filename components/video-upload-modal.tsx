"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  Video,
  CheckCircle,
  Loader2,
  X,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";

interface VideoUploadModalProps {
  bookingId: string;
  orderNumber: string;
  customerName: string;
  children: React.ReactNode;
  onUploadSuccess?: () => void;
}

export function VideoUploadModal({
  bookingId,
  orderNumber,
  customerName,
  children,
  onUploadSuccess,
}: VideoUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 80 * 1024 * 1024; // Increased to 80MB to allow for larger videos
  const ALLOWED_TYPES = [
    "video/mp4",
    "video/mov",
    "video/avi",
    "video/quicktime",
    "video/webm",
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        "Please select a video file (MP4, MOV, AVI, QuickTime, or WebM)."
      );
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Please select a video file smaller than 50MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a video file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename for video
      const timestamp = Date.now();
      const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `celebrity-videos/${bookingId}/${timestamp}-${sanitizedFileName}`;

      console.log("🔄 Uploading video to Vercel Blob...");
      
      // Upload directly to Vercel Blob with progress tracking
      const blob = await upload(filename, selectedFile, {
        access: "public",
        handleUploadUrl: "/api/celebrity/upload-video/blob",
        onUploadProgress: (progress) => {
          const percentage = Math.round((progress.loaded / progress.total) * 100);
          setUploadProgress(percentage);
        },
      });

      console.log("✅ Video uploaded to Blob:", blob.url);

      // Now send the blob URL and metadata to our API
      const response = await fetch("/api/celebrity/upload-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          videoUrl: blob.url,
          filename: blob.pathname,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUploadComplete(true);
        toast.success(
          "The customer will be notified to review your video message."
        );

        // Call success callback
        if (onUploadSuccess) {
          onUploadSuccess();
        }

        // Reset form after a delay
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        throw new Error(data.error || data.details || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload video. Please try again."
      );
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (isUploading) return; // Prevent closing during upload

    setIsOpen(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadComplete(false);
    setNotes("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="w-[95vw] max-w-lg mx-auto bg-white/95 backdrop-blur-lg border-white/20 max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          if (isUploading) e.preventDefault();
        }}
      >
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            <span className="truncate">Upload Video Message</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600">
            Upload the video message for order #{orderNumber} -{" "}
            <span className="truncate">{customerName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* 18+ Content Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base">
                18+ Content Rating
              </span>
            </div>
            <p className="text-xs sm:text-sm text-red-600">
              All video messages are rated 18+ and must comply with our content
              guidelines. Ensure your message is appropriate and follows our
              community standards.
            </p>
          </div>

          {!uploadComplete ? (
            <>
              {/* File Upload Area */}
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Video File
                </Label>

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-4" />
                    <p className="text-gray-600 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                      Click to select video file
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Supports MP4, MOV, AVI, QuickTime, WebM (max 80MB)
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Video className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate w-32">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                      {!isUploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="flex-shrink-0 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label
                  htmlFor="notes"
                  className="text-sm font-medium text-gray-700"
                >
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about the video message..."
                  className="bg-white/50 border-gray-300 focus:border-purple-500 resize-none text-sm"
                  rows={3}
                  maxLength={200}
                  disabled={isUploading}
                />
                <p className="text-xs text-gray-500 text-right">
                  {notes.length}/200 characters
                </p>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Uploading...
                    </span>
                    <span className="text-sm text-gray-500">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-gray-500 text-center">
                    Please don't close this window while uploading
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 bg-transparent text-sm sm:text-base"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-sm sm:text-base"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Video
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            /* Success State - Updated for Approval Workflow */
            <div className="text-center py-4 sm:py-8">
              <div className="relative mb-4 sm:mb-6">
                <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Video Uploaded Successfully!
              </h3>
              <div className="space-y-2 sm:space-y-3 text-gray-600">
                <p className="font-medium text-sm sm:text-base">
                  📧 Customer has been notified to review your video
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-orange-700 mb-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">
                      Pending Customer Approval
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-orange-600">
                    Your payment will be released once {customerName} approves
                    the video. If they request changes, you'll be notified to
                    upload a revision.
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                  This window will close automatically...
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
