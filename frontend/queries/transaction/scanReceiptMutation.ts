import { scanRecepitImage } from "@/actions/transactions.api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function scanReceiptMutation() {
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await scanRecepitImage(file);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Receipt scanned successfully!");
    },
    onError: (error: any) => {
      // Handle errors
      toast.error(error?.response?.data?.message || "Failed to scan receipt");
      console.error("Scan error:", error);
    },
  });
}
