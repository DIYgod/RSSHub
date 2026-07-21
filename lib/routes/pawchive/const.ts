export const baseUrl = 'https://pawchive.pw';
export const apiBaseUrl = `${baseUrl}/api/v1`;
export const thumbnailUrl = 'https://img.pawchive.pw/thumbnail/data';
export const fileUrl = 'https://file.pawchive.pw/data';

export const MIME_TYPE_MAP = {
    m4a: 'audio/mp4',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
} as const;
