import formidable from 'express-formidable';
import path from 'path';

export const uploadMiddlware = formidable({
  uploadDir: path.resolve('src', 'storage'),
});
