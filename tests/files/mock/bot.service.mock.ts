import { FileOptions } from '../../../src/files/types/file-options.type';
import { telegramAudioDocumentMock, telegramDocumentMock } from './files.mock';

export default class MockBotService {
  greet() {
    console.log('greeting');
  }

  sendPhoto(file: any) {
    return Promise.resolve(`Successfully sent photo: ${file}`);
  }

  sendDocs(file: any, fileOptions: FileOptions) {
    if (fileOptions.type.split('/')[0] === 'audio') {
      return Promise.resolve(telegramAudioDocumentMock);
    }

    return Promise.resolve(telegramDocumentMock);
  }

  sendAudio(file: any) {
    return Promise.resolve(`Successfully sent audio: ${file}`);
  }

  sendVideo(file: any) {
    return Promise.resolve(`Successfully sent video: ${file}`);
  }

  getLink(id: string) {
    return Promise.resolve(`https://example.com/${id}`);
  }
}
