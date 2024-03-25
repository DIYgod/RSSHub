import 'dotenv/config';
import fs from 'node:fs';
import Parser from 'rss-parser';
import { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';
import cache from '@/utils/cache';
import { config } from '@/config';

type TaskStatus =
    /** not started */
    | 0
    /** in progress */
    | 1
    /** done */
    | 2
    /** error */
    | 3;
const tasks = new Map<string, TaskStatus>();

function getFileName(url: string) {
    return url.split('/').pop()?.split('?')[0] || '';
}

function isAudio(url: string) {
    return getFileName(url).match(/(flac|mp3|mp4|mpeg|mpga|m4a|ogg|wav|webm)$/);
}

function download(dest: string, url: string) {
    return new Promise<Blob>((resolve, reject) => {
        if (!isAudio(dest)) {
            return reject(new Error('File type not supported'));
        }
        if (fs.existsSync(dest)) {
            return resolve(new Blob([fs.readFileSync(dest)]));
        }
        const file = fs.createWriteStream(dest);
        got.stream(url)
            .pipe(file)
            .on('finish', () => {
                file.on('finish', () => {
                    file.close(() => {
                        resolve(new Blob([fs.readFileSync(dest)]));
                    });
                });
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

/**
 * @see https://platform.openai.com/docs/api-reference/audio/createTranscription
 */
async function transcribe(file: Blob, language: string, prompt?: string, translate?: boolean) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('prompt', prompt || '');

    return (await (
        await fetch(`${config.openai.endpoint || 'https://api.openai.com'}/v1/audio/${translate ? 'translations' : 'transcriptions'}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.openai.apiKey}`,
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        })
    ).json()) as { text: string };
}

export const route: Route = {
    path: '/index',
    categories: ['multimedia'],
    example: '/transcribe/index?rss_url=https://rsshub.app/storyfm/episodes',
    features: {
        requireConfig: [
            {
                name: 'OPENAI_API_ENDPOINT',
                optional: true,
                description: 'OpenAI API Host',
            },
            {
                name: 'OPENAI_API_KEY',
                optional: false,
                description: 'OpenAI API Key',
            },
        ],
    },
    name: 'Transcribe',
    description: `Add transcription to the RSS feed.

Example:
  - /transcribe/index?rss_url=https%3A%2F%2Frsshub.app%2Fstoryfm%2Fepisodes&translate=1&language=en

This link will return a feed with transcribed content.


Query:
  - rss_url: The RSS feed URL, need warpper by encodeURIComponent.
  - translate: Whether to translate the content.
  - language: The language to translate to, default is en.
`,
    maintainers: ['zcf0508'],
    handler: async (ctx) => {
        const rssUrl = ctx.req.query('rss_url') as string;
        const translate = !!ctx.req.query('translate');
        const language = (ctx.req.query('language') || 'en') as string;

        if (!rssUrl) {
            throw new Error('Missing RSS URL');
        }

        const parser = new Parser();

        const feed = await parser.parseURL(rssUrl);

        if (feed.items?.length) {
            feed.items = await Promise.all(
                feed.items?.map(async (item) => {
                    if (item.enclosure?.url && isAudio(item.enclosure.url)) {
                        const filename = getFileName(item.enclosure.url);
                        const cachedText = cache.get(item.enclosure.url) as string;
                        if (cachedText && cachedText.trim().length) {
                            item.contentSnippet = `${item.contentSnippet}\n\n<strong>Transcription:<strong>\n<p>${cachedText}<p>`;
                        } else {
                            if (tasks.get(item.enclosure.url) === undefined || tasks.get(item.enclosure.url) === 3) {
                                tasks.set(item.enclosure.url, 0);
                                if (config.openai.apiKey) {
                                    const file = await download(filename, item.enclosure!.url);
                                    tasks.set(item.enclosure.url, 1);
                                    transcribe(file, language, item.title, translate)
                                        .then(({ text }) => {
                                            tasks.set(item.enclosure!.url, 2);
                                            cache.set(item.enclosure!.url, text, 60 * 60 * 24 * 10000);
                                        })
                                        .catch(() => {
                                            tasks.set(item.enclosure!.url, 3);
                                        })
                                        .finally(() => {
                                            fs.unlinkSync(filename);
                                        });
                                }
                            }
                            item.contentSnippet = `${item.contentSnippet}\n\n<strong>Transcription:<strong>\n<p>The transcription is being generated. code:${tasks.get(item.enclosure!.url)}}<p>`;
                        }
                    }
                    return item;
                })
            );
        }

        return {
            ...feed,
            title: feed.title!,
            link: feed.link!,
            description: feed.description!,
            item: (feed.items || []).map(
                (item) =>
                    ({
                        ...item,
                        title: item.title!,
                        description: item.contentSnippet!,
                        content: {
                            text: item.contentSnippet || '',
                            html: item.content || '',
                        },
                    }) satisfies DataItem
            ),
            author: feed.author!,
        } as Data;
    },
};
