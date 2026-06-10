import { create } from "zustand";

interface CreatePostStore {
  open: boolean;
  prefillContent: string;
  openModal: (content?: string) => void;
  closeModal: () => void;
  clearPrefill: () => void;
}

export const useCreatePostStore = create<CreatePostStore>((set) => ({
  open: false,
  prefillContent: "",
  openModal: (content = "") => set({ open: true, prefillContent: content }),
  closeModal: () => set({ open: false }),
  clearPrefill: () => set({ prefillContent: "" }),
}));
