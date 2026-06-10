// services/community/announcement.service.ts
// Version fusionnée : images, vidéos, PDF, DOCX, XLSX, ZIP,
// upload multiple, progression d'upload, compatibilité Laravel.

import api from "@/lib/axios";
import { Announcement, Paginated } from "@/types/community.types";

export interface Attachment {
  id: number;
  name: string;
  original_name?: string;
  url: string;
  mime_type: string;
  extension?: string;
  size: number;
  created_at?: string;
}

export interface AnnouncementFilters {
  category?: string;
  page?: number;
  perPage?: number;
  search?: string;
  status?: "published" | "draft" | "archived";
  startDate?: string;
  endDate?: string;
}

export interface AnnouncementStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  byCategory: Record<string, number>;
  likesTotal: number;
  commentsTotal: number;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  category: string;
  attachments?: File[];
  is_pinned?: boolean;
  scheduled_at?: string;
}

export interface UpdateAnnouncementData
  extends Partial<CreateAnnouncementData> {
  id: number;
}

export const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg","image/png","image/gif","image/webp",
  "video/mp4","video/webm","video/quicktime","video/x-msvideo","video/x-matroska",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip","application/x-zip-compressed"
];

export const MAX_FILE_SIZE = 20 * 1024 * 1024;

export function prepareAnnouncementFormData(
  data: CreateAnnouncementData
): FormData {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("content", data.content);
  formData.append("category", data.category);

  if (data.is_pinned !== undefined) {
    formData.append("is_pinned", String(data.is_pinned));
  }

  if (data.scheduled_at) {
    formData.append("scheduled_at", data.scheduled_at);
  }

  data.attachments?.forEach((file) => {
    formData.append("attachments[]", file);
  });

  return formData;
}

export function validateMediaFile(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "Le fichier dépasse 20 MB" };
  }

  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
    return { valid: false, error: "Type de fichier non supporté" };
  }

  return { valid: true };
}

export function getFullMediaUrl(url?: string | null) {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return `${apiUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

export function getMediaTypeFromUrl(
  url?: string | null
): "image" | "video" | "document" | null {
  if (!url) return null;

  const lower = url.toLowerCase();

  if (
    [".mp4", ".webm", ".mov", ".avi", ".mkv"].some((e) =>
      lower.includes(e)
    )
  ) return "video";

  if (
    [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip"].some((e) =>
      lower.includes(e)
    )
  ) return "document";

  return "image";
}

export const announcementService = {
  async getAll(category?: string, page = 1, perPage = 10): Promise<Paginated<Announcement>> {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });

    if (category) params.append("category", category);

    const res = await api.get(`/community/announcements?${params}`);
    return res.data.data;
  },

  async getOne(id: number): Promise<Announcement> {
    const res = await api.get(`/community/announcements/${id}`);
    return res.data.data;
  },

  async create(data: FormData): Promise<Announcement> {
    const res = await api.post("/community/announcements", data, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress(progressEvent) {
        if (progressEvent.total) {
          console.log(
            Math.round((progressEvent.loaded * 100) / progressEvent.total)
          );
        }
      },
    });

    return res.data.data;
  },

  async update(id: number, data: FormData): Promise<Announcement> {
    data.append("_method", "PUT");

    const res = await api.post(
      `/community/announcements/${id}`,
      data,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/community/announcements/${id}`);
  },

  async toggleLike(id: number) {
    const res = await api.post(`/community/announcements/${id}/like`);
    return res.data.data;
  },

  async togglePin(id: number) {
    const res = await api.post(`/community/announcements/${id}/pin`);
    return res.data.data;
  },

  async archive(id: number) {
    await api.post(`/community/announcements/${id}/archive`);
  },

  async restore(id: number) {
    await api.post(`/community/announcements/${id}/restore`);
  },

  async getStats(): Promise<AnnouncementStats> {
    const res = await api.get("/community/announcements/stats");
    return res.data.data;
  },

  async uploadAttachments(id: number, files: File[]) {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("attachments[]", file);
    });

    const res = await api.post(
      `/community/announcements/${id}/attachments`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return res.data.data;
  },

  async getAttachments(id: number) {
    const res = await api.get(
      `/community/announcements/${id}/attachments`
    );

    return res.data.data;
  },

  async deleteAttachment(id: number, attachmentId: number) {
    await api.delete(
      `/community/announcements/${id}/attachments/${attachmentId}`
    );
  },

  async downloadAttachment(id: number, attachmentId: number) {
    const res = await api.get(
      `/community/announcements/${id}/attachments/${attachmentId}/download`,
      { responseType: "blob" }
    );

    return res.data;
  },
};
