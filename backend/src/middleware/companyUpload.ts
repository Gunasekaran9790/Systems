import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(
  process.cwd(),
  'public',
  'uploads',
  'company',
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    cb(
      null,
      `company-logo-${Date.now()}${extension}`,
    );
  },
});

const allowedExtensions = ['.png', '.jpg', '.jpeg'];
const allowedMimeTypes = ['image/png', 'image/jpeg'];

const fileFilter: multer.Options['fileFilter'] = (
  _req,
  file,
  cb,
) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    !allowedExtensions.includes(extension) ||
    !allowedMimeTypes.includes(file.mimetype)
  ) {
    return cb(
      new Error('Only PNG and JPG logo images are allowed.'),
    );
  }

  cb(null, true);
};

export const companyUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
});