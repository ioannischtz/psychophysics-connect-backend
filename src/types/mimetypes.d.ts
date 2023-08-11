export const textMimeTypes = [
  "text/csv",
  "text/html",
  "text/javascript",
  "text/plain",
] as const;

declare type TextMIMEtypes = (typeof textMimeTypes)[number];

export const audioMimeTypes = [
  "audio/aac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
] as const;

declare type AudioMIMEtypes = (typeof audioMimeTypes)[number];

export const imageMimeTypes = [
  "image/bmp",
  "image/gif",
  "image/png",
  "image/svg+xml",
  "image/webp",
] as const;

declare type ImageMIMEtypes = (typeof imageMimeTypes)[number];

export const videoMimeTypes = [
  "video/mpeg",
  "video/ogg",
  "video/webm",
  "video/3gp",
  "video/3gp2",
  "video/x-msvideo",
] as const;

declare type VideoMIMEtypes = (typeof videoMimeTypes)[number];

export const applicationMimeTypes = [
  "application/octet-stream",
  "application/gzip",
  "application/json",
  "application/pdf",
  "application/x-tar",
  "application/zip",
] as const;

declare type ApplicationMIMEtypes = (typeof applicationMimeTypes)[number];

export const mimeTypes = [
  ...textMimeTypes,
  ...audioMimeTypes,
  ...imageMimeTypes,
  ...videoMimeTypes,
  ...applicationMimeTypes,
] as const;

declare type MIMEtypes = (typeof mimeTypes)[number];
