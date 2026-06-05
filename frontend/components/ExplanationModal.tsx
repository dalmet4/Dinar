import React from 'react';
import { AlertCircle, X, Server, MessageCircle, CheckCircle2 } from 'lucide-react';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex justify-between items-start">
          <div className="flex gap-3">
            <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <h2 className="font-semibold text-emerald-900 text-lg leading-tight">
                Я подключил ваш токен!
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-emerald-700 hover:bg-emerald-100 p-1 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto text-sm text-slate-700 space-y-4">
          <p>
            Я увидел, что вы снова прислали токен <code>8713180276:...</code>. Вы очень хотите, чтобы бот заработал именно в самом приложении Telegram!
          </p>
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Server size={16} className="text-emerald-500"/> 
              Что я сделал для вас:
            </h3>
            <p className="text-slate-600 mb-2">
              Я превратил это веб-приложение во временный <strong>сервер для вашего Telegram-бота</strong>. 
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-slate-700 font-medium">
              <li>Закройте это окно.</li>
              <li>Перейдите на вкладку <strong>«Telegram Сервер»</strong> (сверху).</li>
              <li>Нажмите зеленую кнопку <strong>«Запустить сервер»</strong>.</li>
              <li>Откройте Telegram на телефоне и напишите вашему боту <code>/start</code>.</li>
            </ol>
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-800">
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <AlertCircle size={16} />
              Важное ограничение
            </h3>
            <p className="text-xs">
              Бот в Telegram будет отвечать <strong>ТОЛЬКО ПОКА ОТКРЫТА ЭТА СТРАНИЦА</strong> и запущен сервер. Если вы закроете вкладку браузера, бот снова перестанет работать, так как сервер отключится.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
          >
            Понятно, запустить сервер!
          </button>
        </div>
      </div>
    </div>
  );
};
