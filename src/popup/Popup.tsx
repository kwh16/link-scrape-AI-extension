import React from 'react';

const Popup: React.FC = () => {
  return (
    <div className="flex flex-col h-screen text-gray-800 bg-gray-50 font-sans">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-md flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-wide">YouTube AI Filter</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <div className="bg-white border border-gray-200 text-gray-800 p-3 rounded-2xl rounded-tl-sm shadow-sm self-start max-w-[85%] text-sm leading-relaxed">
          YouTubeの履歴から何を抽出しますか？<br/>
          (例: 「音楽の動画」「〇〇チャンネル」など)
        </div>
      </main>

      <footer className="p-3 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <form className="flex gap-2">
          <input 
            type="text" 
            placeholder="条件を入力して[Enter]..."
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" 
          />
          <button 
            type="submit" 
            className="bg-indigo-600 text-white rounded-full p-2 h-[36px] w-[36px] flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-md"
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
