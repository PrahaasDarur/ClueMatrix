import api from "./api";

export interface EvidenceUploadResponse {
  message: string;
  evidence_id: string;
  file_type: string;
  status: string;
}

export async function uploadEvidence(
  file: File
): Promise<EvidenceUploadResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/api/evidence/upload",
    formData
  );

  return response.data;
}
