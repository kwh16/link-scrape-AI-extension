export interface VideoData {
  title: string;
  url: string;
  channel: string;
}

export interface ScrapingResponse {
  success: boolean;
  data?: VideoData[];
  error?: string;
}

export interface ScrapingRequest {
  action: 'START_SCRAPING';
}
