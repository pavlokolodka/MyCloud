import * as crypto from 'crypto';
import {createReadStream, createWriteStream, promises, ReadStream, statSync, WriteStream} from 'fs';
import {pipeline} from 'stream/promises';
import * as path from 'node:path';
import { Readable } from 'stream'

const algorithm = 'aes-256-cbc';
export default class DataEncode {
    static async encrypt(input: string, secretData: string) {
        const key = Buffer.from(crypto.createHash('sha256').update(secretData).digest('base64').substring(0, 32));
        const iv = crypto.randomBytes(16);  
        const output = input + '_dec';
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        
        await pipeline(
            createReadStream(input),
            cipher,
            createWriteStream(output)
        )

        await promises.writeFile(output, iv, {flag: 'a'})

        return output;
    }

    static async decrypt(input: string, output: string, secretData: string) {
        const key = Buffer.from(crypto.createHash('sha256').update(secretData).digest('base64').substring(0, 32));
        const chunks = []
        let iv: Buffer | string;
        const stats = statSync(input);
        const fileSize = stats.size;
        const stream = createReadStream(input, { start: fileSize - 16 });
        
        stream.on('data', (chunk) => {
            chunks.push(chunk); 
        });

        stream.on('end', () => {
            iv =  Buffer.concat(chunks);
        })

        stream.on('close', () => {
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
          
            pipeline(
                createReadStream(input, { end: fileSize - 17 }),
                decipher,
                createWriteStream(output)
            )
        })
    }

    static async decryptWithStream(inputStream: ReadStream, outputStream: WriteStream, secretData: string) {
        const key = Buffer.from(crypto.createHash('sha256').update(secretData).digest('base64').substring(0, 32));
        let data: Buffer;
        const chunks = [];
        let iv: Buffer | string;

        inputStream.on('data', (chunk) => {
            chunks.push(chunk); 
        });

        inputStream.on('end', () => {
            const rawData = Buffer.concat(chunks);
            iv = rawData.slice(rawData.byteLength - 16, rawData.byteLength);
            data = rawData.slice(0, rawData.byteLength - 16)
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            const readable = new Readable()
            readable._read = () => {} 
            readable.push(data)
            readable.push(null)
    
            pipeline(
                readable,
                decipher,
                outputStream
            ) 
        })
    }
}
