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

// ─── MODERATION STORE ──────────────────────────────────────────────────────

interface ModerationState {
  showModerationDetails: boolean;
  toggleModerationDetails: () => void;
  setShowModerationDetails: (show: boolean) => void;
}

export const useModerationStore = create<ModerationState>((set) => ({
  showModerationDetails: false,
  toggleModerationDetails: () =>
    set((state) => ({ showModerationDetails: !state.showModerationDetails })),
  setShowModerationDetails: (show: boolean) =>
    set({ showModerationDetails: show }),
}));

// ─── PENDING CONTENT STORE ────────────────────────────────────────────────

interface PendingContentState {
  pendingPosts: number;
  pendingComments: number;
  pendingMessages: number;
  setPendingCounts: (posts: number, comments: number, messages: number) => void;
  incrementPendingPosts: () => void;
  decrementPendingPosts: () => void;
  incrementPendingComments: () => void;
  decrementPendingComments: () => void;
  incrementPendingMessages: () => void;
  decrementPendingMessages: () => void;
}

export const usePendingContentStore = create<PendingContentState>((set) => ({
  pendingPosts: 0,
  pendingComments: 0,
  pendingMessages: 0,
  setPendingCounts: (posts, comments, messages) =>
    set({
      pendingPosts: posts,
      pendingComments: comments,
      pendingMessages: messages,
    }),
  incrementPendingPosts: () =>
    set((state) => ({ pendingPosts: state.pendingPosts + 1 })),
  decrementPendingPosts: () =>
    set((state) => ({ pendingPosts: Math.max(0, state.pendingPosts - 1) })),
  incrementPendingComments: () =>
    set((state) => ({ pendingComments: state.pendingComments + 1 })),
  decrementPendingComments: () =>
    set((state) => ({
      pendingComments: Math.max(0, state.pendingComments - 1),
    })),
  incrementPendingMessages: () =>
    set((state) => ({ pendingMessages: state.pendingMessages + 1 })),
  decrementPendingMessages: () =>
    set((state) => ({
      pendingMessages: Math.max(0, state.pendingMessages - 1),
    })),
}));
