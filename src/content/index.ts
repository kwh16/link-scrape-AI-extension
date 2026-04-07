import { ScrapingRequest, ScrapingResponse, VideoData } from '../lib/types';

console.log('YouTube History AI Filter: Content script loaded');

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeHistory(): Promise<VideoData[]> {
  const MAX_SCROLLS = 10;
  const SCROLL_DELAY = 1500;

  for (let i = 0; i < MAX_SCROLLS; i++) {
    window.scrollTo(0, document.body.scrollHeight);
    await delay(SCROLL_DELAY);
  }

  const videos: VideoData[] = [];
  
  // YouTube history usually contains ytd-video-renderer
  const videoElements = document.querySelectorAll('ytd-video-renderer');
  
  videoElements.forEach(el => {
    const titleEl = el.querySelector('#video-title') as HTMLAnchorElement;
    const channelEl = el.querySelector('.ytd-channel-name a') as HTMLAnchorElement;
    
    if (titleEl && titleEl.href) {
      videos.push({
        title: titleEl.textContent?.trim() || '',
        url: titleEl.href,
        channel: channelEl?.textContent?.trim() || 'Unknown'
      });
    }
  });

  // Deduplicate just in case
  const uniqueVideos = Array.from(new Map(videos.map(v => [v.url, v])).values());
  
  return uniqueVideos;
}

chrome.runtime.onMessage.addListener(
  (request: ScrapingRequest, sender, sendResponse) => {
    if (request.action === 'START_SCRAPING') {
      scrapeHistory()
        .then((data) => {
          sendResponse({ success: true, data } as ScrapingResponse);
        })
        .catch((error) => {
          console.error('[YT History Scraper] Error:', error);
          sendResponse({ success: false, error: String(error) } as ScrapingResponse);
        });
      
      // Return true to indicate we will send a response asynchronously
      return true;
    }
  }
);
