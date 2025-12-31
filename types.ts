
export interface Lyric {
  time: number;
  text: string;
}

export interface AppState {
  isStarted: boolean;
  isReady: boolean;
  photos: string[];
  audioUrl: string | null;
  currentLyricIndex: number;
  currentPhotoIndex: number;
}
