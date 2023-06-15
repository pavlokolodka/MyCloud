import https from 'https';
import { ReadStream, WriteStream } from 'fs';
import { Types } from 'mongoose';
import { Response } from 'express';
import { TelegramDocument } from '../bot/types/telegram-file.type';
import { IFile } from '../files/model/files.interface';

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

/**
 * Saves a large file in parts.
 * @param {ReadStream} file - A stream of input file.
 * @param {TelegramDocument[]} savedChunks - An array for future processing saved chunks.
 * @param {(reqFile: Buffer) => Promise<TelegramDocument>} saveLargeFileChunk - Function for saving chunks.
 * @returns {Promise<void>} A Promise that resolves when all file chunks have been saved.
 */
export async function handleFileEvent(
  file: ReadStream,
  savedChunks: TelegramDocument[],
  saveLargeFileChunk: (reqFile: Buffer) => Promise<TelegramDocument>,
) {
  const highWaterMark = 20 * 1024 * 1024;
  let currentChunkSize = 0;
  let rawFileData: Buffer[] = [];

  return await new Promise<void>((resolve, reject) => {
    file
      .on('data', async (data: Buffer) => {
        console.log(data);
        try {
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
        } catch (error) {
          reject(error);
        }
      })
      .on('close', async () => {
        try {
          // save the last data before closing the stream
          if (rawFileData.length) {
            const savedChunk = await saveLargeFileChunk(
              Buffer.concat(rawFileData),
            );

            savedChunks.push(savedChunk);

            currentChunkSize = 0;
            rawFileData = [];
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      });
  });
}

/**
 * Handles the close event for the large file upload.
 * Waits for the completion of saving file chunks and creates the final large file.
 *
 * @param {string} fileName - The name of the file being uploaded.
 * @param {Types.ObjectId} userId - The ID of the user uploading the file.
 * @param {Promise<void>} saveChunks - Promise representing the completion of saving file chunks.
 * @param {TelegramDocument[]} savedChunks - Array of saved file chunks.
 * @param {Response} res - The response object to send the final file response.
 * @param {Function} createLargeFile - Function to create the final large file.
 * @param {string|undefined} directoryId - ID of the directory to save.
 * @returns {Promise<void>} - A Promise that resolves once the final file is created and the response is sent.
 */
export async function handleCloseEvent(
  fileName: string,
  userId: Types.ObjectId,
  savedChunks: TelegramDocument[],
  res: Response,
  createLargeFile: (
    name: string,
    size: number,
    chunks: string[],
    userId: Types.ObjectId,
    parent?: string | undefined,
  ) => Promise<IFile>,
  directoryId?: string,
) {
  const chunkIds: string[] = [];
  let size = 0;

  savedChunks.forEach((chunk: TelegramDocument) => {
    size += chunk.document.file_size;
    chunkIds.push(chunk.document.file_id);
  });

  const file = await createLargeFile(
    fileName,
    size,
    chunkIds,
    userId,
    directoryId,
  );

  res.send(file);
}
