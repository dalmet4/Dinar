import React from 'react';
import { User, Bot } from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-emerald-800'
        }`}>
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>

        {/* Message Content */}
        <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap ${
          isUser 
            ? 'bg-emerald-600 text-white rounded-br-none' 
            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
        }`}>
          {message.text}
        </div>
      </div>
    </div>
  );
};
