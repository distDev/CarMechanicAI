export const MAX_FILES = 10;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const FOLDER_PATH_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/;
