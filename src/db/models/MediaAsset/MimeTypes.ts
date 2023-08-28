export const textMimeTypes = [
  "text/csv",
  "text/html",
  "text/javascript",
  "text/plain",
] as const;
export type TextMIMEtypes = (typeof textMimeTypes)[number];

export function isTextMIMEtype(mimetype: string): mimetype is TextMIMEtypes {
  return textMimeTypes.includes(mimetype as TextMIMEtypes) as boolean;
}

export const audioMimeTypes = [
  "audio/aac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
] as const;
export type AudioMIMEtypes = (typeof audioMimeTypes)[number];

export function isAudioMIMEtype(mimetype: string): mimetype is AudioMIMEtypes {
  return audioMimeTypes.includes(mimetype as AudioMIMEtypes) as boolean;
}

export const imageMimeTypes = [
  "image/bmp",
  "image/jpeg",
  "image/gif",
  "image/png",
  "image/svg+xml",
  "image/webp",
] as const;
export type ImageMIMEtypes = (typeof imageMimeTypes)[number];

export function isImageMIMEtype(mimetype: string): mimetype is ImageMIMEtypes {
  return imageMimeTypes.includes(mimetype as ImageMIMEtypes) as boolean;
}

export const videoMimeTypes = [
  "video/mpeg",
  "video/ogg",
  "video/webm",
  "video/3gp",
  "video/3gp2",
  "video/x-msvideo",
] as const;
export type VideoMIMEtypes = (typeof videoMimeTypes)[number];

export function isVideoMIMEtype(mimetype: string): mimetype is VideoMIMEtypes {
  return videoMimeTypes.includes(mimetype as VideoMIMEtypes) as boolean;
}

export const applicationMimeTypes = [
  "application/octet-stream",
  "application/gzip",
  "application/json",
  "application/pdf",
  "application/x-tar",
  "application/zip",
] as const;
export type ApplicationMIMEtypes = (typeof applicationMimeTypes)[number];

export function isApplicationMIMEtype(
  mimetype: string,
): mimetype is ApplicationMIMEtypes {
  return applicationMimeTypes.includes(
    mimetype as ApplicationMIMEtypes,
  ) as boolean;
}

export const mimeTypes = [
  ...textMimeTypes,
  ...audioMimeTypes,
  ...imageMimeTypes,
  ...videoMimeTypes,
  ...applicationMimeTypes,
] as const;

export type MIMEtypes = (typeof mimeTypes)[number];
