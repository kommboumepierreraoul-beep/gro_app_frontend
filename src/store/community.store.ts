// src/store/community.store.ts
import { create } from 'zustand'

interface CommunityState {
  unreadMessages: number
  unreadNotifs: number
  setUnreadMessages: (n: number) => void
  setUnreadNotifs: (n: number) => void
  decrementNotifs: () => void
  decrementMessages: () => void
}

export const useCommunityStore = create<CommunityState>((set) => ({
  unreadMessages: 0,
  unreadNotifs:   0,
  setUnreadMessages: (n) => set({ unreadMessages: n }),
  setUnreadNotifs:   (n) => set({ unreadNotifs: n }),
  decrementNotifs:   ()  => set((s) => ({ unreadNotifs:   Math.max(0, s.unreadNotifs - 1) })),
  decrementMessages: ()  => set((s) => ({ unreadMessages: Math.max(0, s.unreadMessages - 1) })),
}))