import { unlink } from 'fs';
import { join } from 'path';

export function deleteFile(folder: 'temp' | 'premanent', fileName: string) {
  try {
    unlink(
      join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        '..',
        'uploads',
        folder,
        fileName,
      ),
      (err) => {
        if (err) console.log(err);
      },
    );
  } catch (err) {
    console.log(err);
  }
}
