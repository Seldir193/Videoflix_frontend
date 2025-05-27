
export interface PlyrSource {
    src: string;
    type: string;
    size: number;
  }
  
  export interface VideoBackend {
    id: number;
    title: string;
    description?: string;
    url: string | null;
    video_file?: string | null;
    source_url?: string | null;
    source_variants?: { path: string; height: number }[];
    hero_frame?: string | null;
    thumb?: string | null;
    created_at: string;
    genre?: string;
    release?: string;
    director?: string;
    license_type?: string;
    license_url?: string;
  }
  
  export interface Video extends Omit<VideoBackend, 'source_variants'> {
    video_file_url: string | null;
    hero_frame_url: string | null;
    sources: PlyrSource[];
  }
  
  