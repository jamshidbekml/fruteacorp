import { unlink } from 'fs';
import { join } from 'path';

export function deleteFile(fileName: string) {
  try {
    unlink(
      join(__dirname, '..', '..', '..', '..', '..', 'uploads', fileName),
      (err) => {
        if (err) console.log(err);
      },
    );
  } catch (err) {
    console.log(err);
  }
}
