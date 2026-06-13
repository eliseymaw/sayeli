import { create } from "zustand";

interface ExperienceState {
  /** Has the visitor pressed "Enter" on the intro veil? */
  entered: boolean;
  /** Ambient sound on/off. */
  muted: boolean;
  /** Normalized scroll offset 0..1, written every frame by the scene. */
  offset: number;
  /** Active chapter index, derived from offset. */
  chapter: number;
  /** Imperative scroll request (target offset 0..1) consumed by the scene. */
  seekTo: number | null;

  enter: () => void;
  toggleMute: () => void;
  setProgress: (offset: number, chapter: number) => void;
  requestSeek: (offset: number) => void;
  clearSeek: () => void;
}

export const useStore = create<ExperienceState>((set) => ({
  entered: false,
  muted: true,
  offset: 0,
  chapter: 0,
  seekTo: null,

  enter: () => set({ entered: true }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setProgress: (offset, chapter) =>
    set((s) => (s.offset === offset && s.chapter === chapter ? s : { offset, chapter })),
  requestSeek: (offset) => set({ seekTo: offset }),
  clearSeek: () => set({ seekTo: null }),
}));
