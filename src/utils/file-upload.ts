import https from 'https';
import { ReadStream, WriteStream } from 'fs';
import { FileInfo } from '../files/types/file-info';
import { TelegramDocument } from '../bot/types/telegram-file.type';

/**
 * Fetches multiple file chunks from the given URLs and sends the data to the client.
 * @param {string[]} fileURLs - Array of file URLs to fetch.
 * @param {WriteStream} output - The output stream to write the fetched data.
 * @returns {Promise<void>} A Promise that resolves when all files have been fetched and sent.
 */
export async function fetchAndSendChunks(
  fileURLs: string[],
  output: WriteStream,
) {
  for (const fileURL of fileURLs) {
    await new Promise<void>((resolve, reject) => {
      https.get(fileURL, (response) => {
        // immediately send the data to client
        response.pipe(output, { end: false });

        response.on('end', () => {
          resolve();
        });

        response.on('error', (error) => {
          reject(error);
        });
      });
    });
  }

  output.end();
}

// export const handleFileEvent = async (name: string, file: ReadStream, info: FileInfo, fileName: string, savedChunks: TelegramDocument[],  saveLastChunkPromise: Promise<void>, saveLargeFileChunk: (reqFile: Buffer) => Promise<TelegramDocument>) => {
export async function handleFileEvent(
  name: string,
  file: ReadStream,
  info: FileInfo,
  fileName: string,
  savedChunks: TelegramDocument[],
  saveLastChunkPromise: Promise<void>,
  saveLargeFileChunk: (reqFile: Buffer) => Promise<TelegramDocument>,
) {
  const highWaterMark = 20 * 1024 * 1024;
  fileName = info.filename;
  let currentChunkSize = 0;
  let rawFileData: Buffer[] = [];

  await new Promise<void>((resolve) => {
    file
      .on('data', async (data: Buffer) => {
        if (
          currentChunkSize < highWaterMark &&
          currentChunkSize + Buffer.byteLength(data) <= highWaterMark
        ) {
          currentChunkSize += Buffer.byteLength(data);
          rawFileData.push(data);
        } else {
          file.pause();

          const savedChunk = await saveLargeFileChunk(
            Buffer.concat(rawFileData),
          );
          savedChunks.push(savedChunk);

          currentChunkSize = Buffer.byteLength(data);
          rawFileData = [];
          rawFileData.push(data);

          file.resume();
        }
      })
      .on('close', async () => {
        // save last chunk data before closing the stream
        if (rawFileData.length) {
          // eslint-disable-next-line no-async-promise-executor
          saveLastChunkPromise = new Promise<void>(async (resolve) => {
            const savedChunk = await saveLargeFileChunk(
              Buffer.concat(rawFileData),
            );

            savedChunks.push(savedChunk);

            currentChunkSize = 0;
            rawFileData = [];

            resolve();
          });
        }
        resolve();
      });
  });
}
