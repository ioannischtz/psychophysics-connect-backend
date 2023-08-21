export const textMimeTypes = [
  "text/csv",
  "text/html",
  "text/javascript",
  "text/plain",
] as const;

declare type TextMIMEtypes = (typeof textMimeTypes)[number];

export function isTextMIMEtype(mimetype: string): mimetype is TextMIMEtypes {
  return textMimeTypes.includes(mimetype);
}

export const audioMimeTypes = [
  "audio/aac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
] as const;

declare type AudioMIMEtypes = (typeof audioMimeTypes)[number];

export function isAudioMIMEtype(mimetype: string): mimetype is AudioMIMEtypes {
  return audioMimeTypes.includes(mimetype);
}

export const imageMimeTypes = [
  "image/bmp",
  "image/gif",
  "image/png",
  "image/svg+xml",
  "image/webp",
] as const;

declare type ImageMIMEtypes = (typeof imageMimeTypes)[number];

export function isImageMIMEtype(mimetype: string): mimetype is ImageMIMEtypes {
  return imageMimeTypes.includes(mimetype);
}

export const videoMimeTypes = [
  "video/mpeg",
  "video/ogg",
  "video/webm",
  "video/3gp",
  "video/3gp2",
  "video/x-msvideo",
] as const;

declare type VideoMIMEtypes = (typeof videoMimeTypes)[number];

export function isVideoMIMEtype(mimetype: string): mimetype is VideoMIMEtypes {
  return videoMimeTypes.includes(mimetype);
}

export const applicationMimeTypes = [
  "application/octet-stream",
  "application/gzip",
  "application/json",
  "application/pdf",
  "application/x-tar",
  "application/zip",
] as const;

declare type ApplicationMIMEtypes = (typeof applicationMimeTypes)[number];

export function isApplicationMIMEtype(
  mimetype: string,
): mimetype is ApplicationIMEtypes {
  return applicationMimeTypes.includes(mimetype);
}

export const mimeTypes = [
  ...textMimeTypes,
  ...audioMimeTypes,
  ...imageMimeTypes,
  ...videoMimeTypes,
  ...applicationMimeTypes,
] as const;

declare type MIMEtypes = (typeof mimeTypes)[number];
