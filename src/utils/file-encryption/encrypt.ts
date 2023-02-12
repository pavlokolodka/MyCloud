const crypto = require('crypto');
import {createReadStream, createWriteStream, promises} from 'fs';
import {pipeline} from 'stream/promises';
const path = require('node:path');

function encrypt(input: string, output: string, secretData: string) {
    const key = Buffer.from(crypto.createHash('sha256').update(secretData).digest('base64').substring(0, 32))
    const iv = crypto.randomBytes(16);
    const algorithm = 'aes-256-cbc';
    // const algorithm = 'aes-256-gcm';

    // const cipher = crypto.createCipheriv(algorithm, key, iv);
    const cipher = crypto.createCipheriv(algorithm, key, 'somefadfsfsfsfsf');

    return pipeline(
        createReadStream(input),
        cipher,
        createWriteStream(output)
    )
    // const file = await promises.readFile(input);
    // let encryptedData = cipher.update(file);

    // encryptedData += cipher.final("hex");
}

const path1 = path.join(__dirname, 'test.txt');
const path2 = path.join(__dirname, 'test1.txt');
const path3 = path.join(__dirname, 'test2.txt');
encrypt(path1, path2, 'some')
// console.log(path.join(__dirname, 'test.txt'))

async function decrypt(input: string, output: string, secretData: string) {
    const key = Buffer.from(crypto.createHash('sha256').update(secretData).digest('base64').substring(0, 32))
    // const iv = crypto.randomBytes(16);
    const algorithm = 'aes-256-cbc';
    // const algorithm = 'aes-256-cbc';
    
    // let iv: Buffer | string;
    // const stream = createReadStream(input, { start: 0, end: 16 });
    // stream.on('data', (chunk) => {
    //     iv += chunk as Buffer;
    // }
    // const file = await promises.readFile(input);
    // const iv = file.slice(0, 16);
    const decipher = crypto.createDecipheriv(algorithm, key, 'somefadfsfsfsfsf');

    // const final = createWriteStream(output);
    // createReadStream(input, { start: 16}).pipe(cipher).pipe(final)
    // const data = file.slice(16)
    // let decryptedData = decipher.update(data);
    // decryptedData += decipher.final();

    return pipeline(
        createReadStream(input),
        decipher,
        createWriteStream(output)
    )
}

decrypt(path2, path3, 'some')
