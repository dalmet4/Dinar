import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, ShieldCheck, Info, Server, MessageSquare } from 'lucide-react';
import { Chat } from '@google/genai';
import { createChatSession } from './services/gemini';
import { MessageBubble, Message } from './components/MessageBubble';
import { ExplanationModal } from './components/ExplanationModal';
import { useTelegramBridge } from './hooks/useTelegramBridge';

export default function App() {
  const [activeTab, setActiveTab] = useState<'telegram' | 'web'>('telegram');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Telegram Bridge Hook
  const { isActive: isTgActive, setIsActive: setIsTgActive, logs } = useTelegramBridge();
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize Web Chat
  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      try {
        setIsLoading(true);
        const session = createChatSession();
        if (isMounted) setChatSession(session);

        const response = await session.sendMessage({ 
          message: 'Начни диалог согласно шагу 1 твоей инструкции. Поприветствуй меня и объясни правила.' 
        });
        
        if (isMounted && response.text) {
          setMessages([
            { id: Date.now().toString(), role: 'model', text: response.text }
          ]);
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        if (isMounted) {
          setMessages([
            { id: 'error', role: 'model', text: 'Произошла ошибка при подключении. Пожалуйста, проверьте API ключ.' }
          ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll for Web Chat
  useEffect(() => {
    if (activeTab === 'web') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Auto-scroll for Telegram Logs
  useEffect(() => {
    if (activeTab === 'telegram') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmedInput = inputText.trim();
    if (!trimmedInput || !chatSession || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmedInput,
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: trimmedInput });
      
      if (response.text) {
        const newModelMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: response.text,
        };
        setMessages(prev => [...prev, newModelMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Извините, произошла ошибка при обработке вашего сообщения. Пожалуйста, попробуйте еще раз.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 relative">
      <ExplanationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Header */}
      <header className="bg-emerald-800 text-white p-3 flex flex-col gap-3 shadow-md z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-700 p-2 rounded-full">
              <ShieldCheck size={24} className="text-emerald-100" />
            </div>
            <div>
              <h1 className="font-semibold text-lg leading-tight">Виртуальный Хатыб</h1>
              <p className="text-emerald-200 text-xs">Панель управления</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-emerald-700 hover:bg-emerald-600 rounded-full transition-colors"
          >
            <Info size={20} className="text-emerald-100" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-emerald-900/50 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('telegram')} 
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'telegram' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-200 hover:text-white'}`}
          >
            <Server size={16} />
            Telegram Сервер
          </button>
          <button 
            onClick={() => setActiveTab('web')} 
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'web' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-200 hover:text-white'}`}
          >
            <MessageSquare size={16} />
            Веб-чат
          </button>
        </div>
      </header>

      {activeTab === 'telegram' ? (
        /* Telegram Bridge View */
        <main className="flex-1 p-4 flex flex-col overflow-hidden">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-4 flex-shrink-0">
            <h2 className="font-semibold text-slate-800 text-lg mb-2">Связь с Telegram</h2>
            <p className="text-sm text-slate-600 mb-5">
              Нажмите кнопку ниже, чтобы запустить сервер. Пока он работает, ваш бот <strong>@badooislam_bot</strong> будет отвечать пользователям в Telegram, используя искусственный интеллект.
            </p>
            <button
              onClick={() => setIsTgActive(!isTgActive)}
              className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-sm flex items-center justify-center gap-2 ${
                isTgActive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isTgActive ? (
                <>Остановить сервер</>
              ) : (
                <>
                  <Server size={20} />
                  Запустить сервер
                </>
              )}
            </button>
          </div>
          
          <div className="flex-1 bg-slate-900 rounded-2xl p-4 overflow-y-auto font-mono text-xs text-emerald-400 shadow-inner flex flex-col">
            <div className="text-slate-500 mb-2 border-b border-slate-800 pb-2">Терминал сервера...</div>
            {logs.map((log, i) => (
              <div key={i} className="mb-1 break-words">{log}</div>
            ))}
            {logs.length === 0 && !isTgActive && (
              <div className="text-slate-600 italic mt-2">Ожидание запуска...</div>
            )}
            <div ref={logsEndRef} />
          </div>
        </main>
      ) : (
        /* Web Chat View */
        <>
          <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {messages.length === 0 && !isLoading && (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Инициализация диалога...
              </div>
            )}
            
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isLoading && messages.length > 0 && (
              <div className="flex w-full mb-4 justify-start">
                <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-bl-none shadow-sm text-emerald-600">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm text-slate-500">Печатает...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          <footer className="bg-white border-t border-slate-200 p-3">
            <form 
              onSubmit={handleSendMessage}
              className="flex items-end gap-2 bg-slate-100 rounded-2xl p-1 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all"
            >
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Написать сообщение..."
                className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none"
                rows={1}
                disabled={isLoading || !chatSession}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading || !chatSession}
                className="p-3 m-1 rounded-xl bg-emerald-600 text-white disabled:bg-slate-300 disabled:text-slate-500 transition-colors flex-shrink-0 hover:bg-emerald-700"
              >
                <Send size={20} />
              </button>
            </form>
          </footer>
        </>
      )}
    </div>
  );
}
