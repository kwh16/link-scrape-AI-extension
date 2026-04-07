import React, { useState, useEffect } from 'react';
import { ScrapingResponse } from '../lib/types';

interface Message {
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
}

const Popup: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'YouTubeの履歴から何を抽出しますか？\n(例: 「音楽の動画」「〇〇チャンネル」など)' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState(false);

  useEffect(() => {
    // Check if we are on the YouTube history page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.url && activeTab.url.startsWith('https://www.youtube.com/feed/history')) {
        setIsUrlValid(true);
      } else {
        setIsUrlValid(false);
        setMessages(prev => [...prev, { 
          role: 'error', 
          content: 'エラー: この拡張機能は YouTube の再生履歴ページ (https://www.youtube.com/feed/history) でのみ動作します。ページを移動してから再度開いてください。' 
        }]);
      }
    });
  }, []);

  const handleScrape = async () => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'system', content: '履歴をスクロールして取得しています... (約15秒かかります)' }]);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id!,
        { action: 'START_SCRAPING' },
        (response: ScrapingResponse) => {
          setIsLoading(false);
          if (chrome.runtime.lastError) {
            setMessages(prev => [...prev, { role: 'error', content: `エラー: ${chrome.runtime.lastError.message}` }]);
            return;
          }

          if (response && response.success) {
            setMessages(prev => [...prev, { 
              role: 'system', 
              content: `スクレイピング完了！ ${response.data?.length} 件の動画データを取得しました。` 
            }]);
            console.log('Scraped Data:', response.data);
            // Here we will later call the Gemini API
          } else {
            setMessages(prev => [...prev, { role: 'error', content: `スクレイピング失敗: ${response?.error}` }]);
          }
        }
      );
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
    setInputValue('');
    
    if (!isUrlValid) return;

    // For now, simulate "Phase 1: Confirmation" immediately
    setMessages(prev => [...prev, { role: 'assistant', content: '承知いたしました。スクレイピングを実行してよろしいですか？（はい/いいえ）' }]);
    
    // In Phase 1 logic, if the user answers "はい" to the confirmation, we start scraping.
    // As a simple mock behavior for Task 3 & 4 testing, we check if the input is "はい"
    if (inputValue.trim() === 'はい') {
      handleScrape();
    }
  };

  return (
    <div className="flex flex-col h-screen text-gray-800 bg-gray-50 font-sans">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-md flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-wide">YouTube AI Filter</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-indigo-100 text-indigo-900 rounded-tr-sm self-end'
                : msg.role === 'error'
                ? 'bg-red-100 text-red-800 rounded-tl-sm self-start shadow-sm border border-red-200'
                : msg.role === 'system'
                ? 'bg-gray-200 text-gray-600 text-xs self-center text-center rounded-lg max-w-[95%]'
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm self-start'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-white border border-gray-200 text-gray-800 p-3 rounded-2xl rounded-tl-sm shadow-sm self-start max-w-[85%] flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
            <span className="text-sm">処理中...</span>
          </div>
        )}
      </main>

      <footer className="p-3 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading || !isUrlValid}
            placeholder={isUrlValid ? "条件を入力して[Enter]..." : "履歴ページを開いてください"}
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow disabled:opacity-50" 
          />
          <button 
            type="submit" 
            disabled={isLoading || !isUrlValid}
            className="bg-indigo-600 text-white rounded-full p-2 h-[36px] w-[36px] flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-md disabled:bg-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Popup;
