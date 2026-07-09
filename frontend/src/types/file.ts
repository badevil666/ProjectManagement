export interface ProjectFile {
  id: string;
  projectId: string;
  moduleId?: string | null;
  name: string;
  size: number;
  mimeType: string;
  uploadedBy?: string | null;
  createdAt: string;
}

export interface FilesQueryParams {
  moduleId?: string;
}
