import { ChatType } from 'node-telegram-bot-api';

export type TelegramDocument = {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
  };
  chat: {
    id: number;
    first_name: string;
    username: string;
    type: ChatType;
  };
  date: number;
  document: {
    file_name: string;
    mime_type: string;
    file_id: string;
    file_unique_id: string;
    file_size: number;
  };
};

export type TelegramAudioDocument = {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
  };
  chat: {
    id: number;
    first_name: string;
    username: string;
    type: ChatType;
  };
  date: number;
  audio: {
    duration: number;
    file_name: string;
    mime_type: string;
    title: string;
    performer: string;
    file_id: string;
    file_unique_id: string;
    file_size: number;
  };
};
