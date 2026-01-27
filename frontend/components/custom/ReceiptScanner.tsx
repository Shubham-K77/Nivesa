"use client";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, Camera, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
interface ReceiptScannerProps {
  onScanComplete: (file: File) => void;
  isScanning?: boolean;
}
const ReceiptScanner = ({
  onScanComplete,
  isScanning = false,
}: ReceiptScannerProps) => {
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  //Handle Change
  const handleReceiptScan = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5 MB.");
      return;
    }
    setSelectedFile(file);
  };
  //Clear selected file
  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };
  //Submit The Selected
  const submitSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onScanComplete(selectedFile!);
  };

  return (
    <div className="w-full flex justify-start items-center gap-x-6 p-2">
      <input
        type="file"
        ref={inputFileRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />
      <Button
        type="button"
        className="hover:cursor-pointer w-[55%] h-[10vh] flex items-center justify-between relative overflow-hidden bg-linear-to-br from-orange-500/80 via-yellow-500/80 to-amber-500/80 hover:transition-shadow hover:shadow-md hover:shadow-orange-500/40"
        title="Scan Receipt"
        onClick={() => inputFileRef.current?.click()}
      >
        <div className="flex justify-start items-center gap-x-4 p-2">
          {isScanning ? (
            <Loader2 className="text-2xl animate-spin" />
          ) : (
            <Camera className="text-2xl" />
          )}
          <div className="flex flex-col justify-start items-start">
            <div className="text-white font-semibold text-md">
              {isScanning
                ? "Scanning..."
                : selectedFile
                  ? "Receipt Selected"
                  : "Scan Receipt With AI"}
            </div>
            <div className="text-gray-300 text-sm truncate max-w-[200px]">
              {isScanning
                ? "Please wait..."
                : selectedFile
                  ? selectedFile.name
                  : "Use AI to auto-fill"}
            </div>
          </div>
        </div>
        {selectedFile && !isScanning ? (
          <div className="flex justify-start items-center gap-x-4">
            {/* Submit Button */}
            <div
              className="w-8 h-8 rounded-full bg-emerald-500/80 text-white flex justify-center items-center hover:cursor-pointer hover:bg-emerald-400/80 transition-colors"
              onClick={(e) => submitSelectedFile(e)}
            >
              <Check className="w-5 h-5" />
            </div>
            {/* Cancel Button */}
            <div
              className="w-8 h-8 rounded-full bg-rose-500/80 text-white flex justify-center items-center hover:cursor-pointer hover:bg-rose-400/80 transition-colors"
              onClick={clearFile}
            >
              <X className="w-5 h-5" />
            </div>
          </div>
        ) : (
          <ArrowRightIcon className="text-3xl text-white" />
        )}
      </Button>
      <div className="text-md text-white">
        Or, if you prefer, please fill in the details manually in the form
        below.
      </div>
    </div>
  );
};

export default ReceiptScanner;
