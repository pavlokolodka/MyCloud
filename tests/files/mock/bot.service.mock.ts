import { FileOptions } from '../../../src/files/types/file-options.type';

export default class MockBotService {
  greet() {
    console.log('greeting');
  }

  sendPhoto(file: any) {
    return Promise.resolve(`Successfully sent photo: ${file}`);
  }

  sendDocs(file: any, fileOptions: FileOptions) {
    return Promise.resolve(`Successfully sent document: ${file}`);
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
