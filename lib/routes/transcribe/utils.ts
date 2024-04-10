import got from '@/utils/got';
import { config } from '@/config';

/**
 * @see https://platform.openai.com/docs/api-reference/audio/createTranscription
 */
export async function transcribe(file: Blob, language: string, prompt?: string, translate?: boolean) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('prompt', prompt || '');

    return (await got.post(`${config.openai.endpoint || 'https://api.openai.com/v1'}/audio/${translate ? 'translations' : 'transcriptions'}`, {
        body: formData,
        headers: {
            Authorization: `Bearer ${config.openai.apiKey}`,
            'Content-Type': 'multipart/form-data',
        },
    })) as { text: string };
}
