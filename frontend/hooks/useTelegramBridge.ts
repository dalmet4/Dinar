import { useState, useEffect, useRef } from 'react';
import { getUpdates, sendMessage } from '../services/telegram';
import { getOrCreateTelegramSession } from '../services/gemini';

export const useTelegramBridge = () => {
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const offsetRef = useRef(0);

  const addLog = (msg: string) => {
    setLogs(prev => {
      const newLogs = [...prev, `${new Date().toLocaleTimeString()}: ${msg}`];
      return newLogs.slice(-50); // Храним только последние 50 логов
    });
  };

  useEffect(() => {
    if (!isActive) return;
    let isMounted = true;
    const abortController = new AbortController();

    const poll = async () => {
      addLog('Сервер запущен. Подключение к Telegram API...');
      
      while (isMounted) {
        try {
          const data = await getUpdates(offsetRef.current, abortController.signal);
          
          if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
              offsetRef.current = update.update_id + 1;
              
              if (update.message && update.message.text) {
                const chatId = update.message.chat.id;
                const text = update.message.text;
                const username = update.message.from?.username || update.message.from?.first_name || 'User';

                addLog(`[TG] @${username}: ${text}`);

                const session = getOrCreateTelegramSession(chatId);
                
                // Если это команда /start, отправляем скрытый промпт для инициализации
                let prompt = text;
                if (text === '/start') {
                    prompt = 'Начни диалог согласно шагу 1 твоей инструкции. Поприветствуй меня и объясни правила.';
                }

                try {
                  const response = await session.sendMessage({ message: prompt });
                  if (response.text) {
                    await sendMessage(chatId, response.text);
                    addLog(`[AI] Ответ отправлен @${username}`);
                  }
                } catch (aiError) {
                  console.error('Gemini API Error:', aiError);
                  addLog(`[Ошибка ИИ] Не удалось получить ответ для @${username}`);
                  await sendMessage(chatId, 'Извините, произошла техническая ошибка на сервере ИИ. Попробуйте позже.');
                }
              }
            }
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            addLog('Остановка сервера...');
            break;
          }
          console.error('Telegram polling error:', error);
          addLog('Ошибка соединения с Telegram. Повтор через 3 сек...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    };

    poll();

    return () => {
      isMounted = false;
      abortController.abort();
      addLog('Сервер остановлен.');
    };
  }, [isActive]);

  return { isActive, setIsActive, logs };
};
