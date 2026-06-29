import crypto from 'node:crypto';

import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

const BASE = 'https://music.znnu.com';
const HMAC_SECRET = 'a09d0f3700a279584e1515354fbe08a7ee1c617f919543142fa625b82f1b5ad0';
const SIGN_DOMAIN = 'music.znnu.com';
const DEFAULT_LEVEL = 'lossless';

const LEVEL_META: Record<string, { format: string; bitrate?: number; sampleRate?: number; bitDepth?: number; label: string }> = {
    jymaster: { format: 'flac', bitDepth: 24, sampleRate: 192000, label: '超清母带' },
    sky: { format: 'flac', bitDepth: 24, sampleRate: 96000, label: '沉浸环绕声' },
    jyeffect: { format: 'flac', bitDepth: 24, sampleRate: 96000, label: '高清环绕声' },
    hires: { format: 'flac', bitDepth: 24, sampleRate: 96000, label: 'Hi-Res' },
    lossless: { format: 'flac', bitDepth: 16, sampleRate: 44100, label: '无损音质' },
    exhigh: { format: 'mp3', bitrate: 320, label: '极高音质' },
    higher: { format: 'mp3', bitrate: 192, label: '较高音质' },
    standard: { format: 'mp3', bitrate: 128, label: '标准音质' },
};

interface ZunaSongData {
    url?: string;
    type?: string;
    name?: string;
    artist?: string;
    album?: string;
    size?: string | number;
    level?: string;
}

interface ZunaSongResponse {
    code?: number;
    msg?: string;
    data?: ZunaSongData;
}

interface ZunaKeyResponse {
    data?: {
        keyToken?: string;
    };
    msg?: string;
}

function buildSignature(params: Record<string, string>): { signature: string; timestamp: number; domain: string } {
    const timestamp = Math.floor(Date.now() / 1000);
    const cleaned = { ...params };
    delete cleaned.signature;
    delete cleaned.timestamp;
    delete cleaned.domain;
    delete cleaned.ver;

    let signString = timestamp + SIGN_DOMAIN;
    for (const key of Object.keys(cleaned).toSorted()) {
        signString += `${key}=${cleaned[key]}`;
    }

    return {
        signature: crypto.createHmac('sha256', HMAC_SECRET).update(signString).digest('hex'),
        timestamp,
        domain: SIGN_DOMAIN,
    };
}

function extractSongId(input: string): string {
    const trimmed = input.trim();
    const id = trimmed.match(/[?&]id=(\d+)/)?.[1] ?? (/^\d+$/.test(trimmed) ? trimmed : undefined);
    if (!id) {
        throw new Error('无法从输入中提取网易云音乐歌曲 ID');
    }
    return id;
}

function formatFromUrl(url: string): string | undefined {
    return url.match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1]?.toLowerCase();
}

function audioMimeType(format: string): string {
    if (format === 'flac') {
        return 'audio/flac';
    }
    if (format === 'm4a') {
        return 'audio/mp4';
    }
    return 'audio/mpeg';
}

function parseSizeBytes(size: string | number | undefined): number | undefined {
    if (typeof size === 'number') {
        return size;
    }
    const match = size?.match(/([\d.]+)\s*(kb|mb|gb|b)?/i);
    if (!match) {
        return undefined;
    }
    const value = Number.parseFloat(match[1]);
    const unit = match[2]?.toLowerCase() ?? 'b';
    const multiplier = unit === 'gb' ? 1024 ** 3 : unit === 'mb' ? 1024 ** 2 : unit === 'kb' ? 1024 : 1;
    return Math.round(value * multiplier);
}

async function zunaKeyToken(): Promise<string> {
    const response = await ofetch<ZunaKeyResponse>(`${BASE}/api/key`, {
        headers: {
            'X-Referer': 'musicParser',
        },
    });
    const keyToken = response.data?.keyToken;
    if (!keyToken) {
        throw new Error(response.msg || 'Zuna did not return a key token');
    }
    return keyToken;
}

async function zunaSongUrl(id: string, level: string): Promise<ZunaSongData> {
    const keyToken = await zunaKeyToken();
    let ip = '';
    try {
        ip = (await ofetch<{ ip?: string }>(`${BASE}/api/ip`)).ip ?? '';
    } catch {
        // The parser accepts an empty IP value when the helper endpoint is unavailable.
    }
    const params: Record<string, string> = { act: 'song', id, level, rawInput: id, ip };
    const signature = buildSignature(params);
    const body = new URLSearchParams(params);
    body.append('signature', signature.signature);
    body.append('timestamp', String(signature.timestamp));
    body.append('domain', signature.domain);

    const response = await ofetch<ZunaSongResponse>(`${BASE}/api/song`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Referer': 'musicParser',
            'X-Key-Token': keyToken,
            Origin: BASE,
            Referer: `${BASE}/`,
        },
        body,
    });

    if (response.code !== 200) {
        throw new Error(response.msg || `zuna song request failed with code ${response.code ?? 'unknown'}`);
    }
    if (!response.data?.url) {
        throw new Error('Zuna did not return a download URL');
    }
    return response.data;
}

export async function buildZunaData(input: string, level = DEFAULT_LEVEL): Promise<Data> {
    const id = extractSongId(input);
    const song = await zunaSongUrl(id, level);
    const meta = LEVEL_META[level] ?? {};
    const format = formatFromUrl(song.url!) ?? song.type ?? meta.format ?? 'mp3';
    const title = song.name ?? id;
    const itemTitle = [title, song.artist].filter(Boolean).join(' - ');
    const sizeBytes = parseSizeBytes(song.size);
    const link = `https://music.163.com/song?id=${id}`;
    const description = [
        song.artist ? `歌手：${song.artist}` : undefined,
        song.album ? `专辑：${song.album}` : undefined,
        `音质：${song.level ?? meta.label ?? level}`,
        sizeBytes ? `大小：${(sizeBytes / 1024 / 1024).toFixed(2)} MB` : undefined,
        `<a href="${song.url}">下载音频</a>`,
    ]
        .filter(Boolean)
        .join('<br>');

    const item: DataItem = {
        title: itemTitle,
        link,
        guid: `zuna-${id}-${level}`,
        author: song.artist,
        description,
        content: {
            html: description,
            text: [title, song.artist, song.album, song.level].filter(Boolean).join('\n'),
        },
        enclosure_url: song.url,
        enclosure_type: audioMimeType(format),
        enclosure_title: itemTitle,
        enclosure_length: sizeBytes,
        _extra: {
            provider: 'zuna',
            sourceUrl: song.url,
            format,
            bitrate: meta.bitrate,
            sampleRate: meta.sampleRate,
            bitDepth: meta.bitDepth,
            level,
        },
    };

    return {
        title: `Zuna Download - ${title}`,
        link,
        item: [item],
        allowEmpty: true,
        language: 'zh-CN',
    };
}

export const handler = (ctx: Context): Promise<Data> => {
    const { id, level = DEFAULT_LEVEL } = ctx.req.param();
    return buildZunaData(decodeURIComponent(id), level);
};

export const route: Route = {
    path: '/download/:id/:level?',
    name: 'Download',
    url: 'music.znnu.com',
    maintainers: ['JaggerGuo'],
    handler,
    example: '/zuna/download/1824045033/lossless',
    parameters: {
        id: '网易云音乐歌曲 ID，也可以传入歌曲链接',
        level: {
            description: '音质，默认为 `lossless`',
            default: DEFAULT_LEVEL,
            options: Object.entries(LEVEL_META).map(([value, { label }]) => ({ value, label })),
        },
    },
    description: `::: tip
该路由调用 Zuna / ZNNU 的网易云音乐解析接口，返回歌曲下载链接和结构化音质元数据。
:::

::: warning
下载链接由上游接口实时返回，通常带有过期时间。
:::`,
    categories: ['multimedia'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['music.163.com/song?id=:id'],
            target: '/download/:id',
        },
    ],
    view: ViewType.Audios,
};
