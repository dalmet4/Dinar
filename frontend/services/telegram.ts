// Используем токен, который предоставил пользователь
const TELEGRAM_TOKEN = '8713180276:AAEWsi9AjPr6oldTke5ZweHJ262-KTQsv7A';
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export const getUpdates = async (offset: number, signal: AbortSignal) => {
  const res = await fetch(`${BASE_URL}/getUpdates?offset=${offset}&timeout=10`, { signal });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};

export const sendMessage = async (chatId: number, text: string) => {
  const res = await fetch(`${BASE_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};
