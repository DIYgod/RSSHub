const KEMONO_ROOT_URL = 'https://kemono.su';
const KEMONO_API_URL = `${KEMONO_ROOT_URL}/api/v1`;
const MIME_TYPE_MAP = {
    m4a: 'audio/mp4',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
} as const;

export { KEMONO_API_URL, KEMONO_ROOT_URL, MIME_TYPE_MAP };
