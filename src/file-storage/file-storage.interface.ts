export interface IFileStorage {
  // saveFile(): Promise
  getURL(id: string): Promise<string>;
}
