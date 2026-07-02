import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const API_BASE = 'https://nextmusic.toubiec.cn';
const SITE_BASE = 'https://wyapi.toubiec.cn';
const DEFAULT_LEVEL = 'exhigh';
const DEFAULT_LIMIT = 30;
const PLAYLIST_PAGE_SIZE = 500;

const LEVEL_LABELS: Record<string, string> = {
    standard: '标准音质',
    exhigh: '极高音质',
    lossless: '无损音质',
    hires: 'Hi-Res 音质',
    jyeffect: '高清环绕声',
    sky: '沉浸环绕声',
    dolby: '杜比全景声',
    vivid: '臻音全景声',
    jymaster: '超清母带',
};

interface ApiEnvelope<T> {
    code?: number;
    message?: string;
    msg?: string;
    data?: T;
}

interface SongInfo {
    id: number | string;
    name?: string;
    singer?: string;
    album?: string;
    picimg?: string;
    duration?: string;
    time?: string;
    free?: boolean;
}

interface SongUrl {
    id?: number | string;
    url?: string;
    br?: number;
    level?: string;
    size?: number;
    md5?: string;
    type?: string;
    source?: string;
    time?: string;
}

interface LyricData {
    lrc?: string;
    tlyric?: string;
    romalrc?: string;
    klyric?: string;
}

interface SearchData {
    songs?: SongInfo[];
    songCount?: number;
}

interface CollectionData {
    id?: number | string;
    name?: string;
    title?: string;
    coverImage?: string;
    picUrl?: string;
    description?: string;
    songCount?: number;
    songs?: SongInfo[];
    tracks?: SongInfo[];
    list?: SongInfo[];
    artist?: {
        name?: string;
    };
    creator?: {
        name?: string;
        nickname?: string;
    };
}

async function postApi<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const response = await ofetch<ApiEnvelope<T>>(`${API_BASE}/api/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...body,
            timestamp: Date.now(),
        }),
    });

    if (response.code === 429) {
        throw new Error(response.message || response.msg || '当前 IP 请求频率过快，请稍后再试');
    }
    if (response.code !== 200 || response.data === undefined || response.data === null) {
        throw new Error(response.message || response.msg || `${endpoint} request failed`);
    }

    return response.data;
}

async function getSongUrl(id: string, level: string): Promise<{ data: SongUrl; endpoint: string }> {
    let primary: SongUrl | null = null;
    try {
        primary = await postApi<SongUrl>('getSongUrl', { id, level });
    } catch {
        primary = null;
    }
    if (primary?.url && (!primary.level || primary.level === level)) {
        return { data: primary, endpoint: 'getSongUrl' };
    }

    const fallback = await postApi<SongUrl>('getMusicUrl', { id, level });
    if (!fallback.url) {
        throw new Error('无法获取该歌曲的播放链接');
    }
    return { data: fallback, endpoint: 'getMusicUrl' };
}

function extractId(input: string, mode: string): string {
    const trimmed = input.trim();
    const id = trimmed.match(/[?&]id=(\d+)/)?.[1] ?? (mode === 'album' ? trimmed.match(/\/album\/(\d+)(?:\/|$)/)?.[1] : undefined) ?? (/^\d+$/.test(trimmed) ? trimmed : undefined);

    if (!id) {
        throw new Error(`无法从输入中提取 ${mode} ID`);
    }
    return id;
}

function audioMimeType(url: string): string {
    const ext = url.match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1]?.toLowerCase();
    if (ext === 'flac') {
        return 'audio/flac';
    }
    if (ext === 'm4a') {
        return 'audio/mp4';
    }
    if (ext === 'mp4') {
        return 'video/mp4';
    }
    return 'audio/mpeg';
}

function songLink(id: string | number): string {
    return `https://music.163.com/song?id=${id}`;
}

function renderSongDescription(song: SongInfo, urlData?: SongUrl, lyric?: LyricData, endpoint?: string): string {
    const lines = [
        song.singer ? `歌手：${song.singer}` : undefined,
        song.album ? `专辑：${song.album}` : undefined,
        song.duration ? `时长：${song.duration}` : undefined,
        urlData?.level ? `音质：${LEVEL_LABELS[urlData.level] ?? urlData.level}` : undefined,
        urlData?.br ? `码率：${Math.round(urlData.br / 1000)} kbps` : undefined,
        urlData?.size ? `大小：${(urlData.size / 1024 / 1024).toFixed(2)} MB` : undefined,
        endpoint ? `接口：${endpoint}` : undefined,
    ].filter(Boolean);

    const lyrics = lyric?.lrc ? `<h3>歌词</h3><pre>${lyric.lrc}</pre>` : '';

    return `<p>${lines.join('<br>')}</p>${urlData?.url ? `<p><a href="${urlData.url}">下载音频</a></p>` : ''}${lyrics}`;
}

function songToItem(song: SongInfo, level: string, includeLyric = false): Promise<DataItem> {
    const id = String(song.id);
    return cache.tryGet(`toubiec:wyapi:song:${id}:${level}:${includeLyric ? 'lyrics' : 'audio'}`, async () => {
        const { data: urlData, endpoint } = await getSongUrl(id, level);
        let lyric: LyricData | undefined;
        if (includeLyric) {
            try {
                lyric = await postApi<LyricData>('getSongLyric', { id });
            } catch {
                // Lyrics are optional; keep the audio item if the lyric endpoint fails.
            }
        }
        const title = [song.name || id, song.singer].filter(Boolean).join(' - ');
        const description = renderSongDescription(song, urlData, lyric, endpoint);

        return {
            title,
            link: songLink(id),
            guid: `toubiec-${id}-${urlData.level ?? level}`,
            author: song.singer,
            pubDate: song.time ? parseDate(song.time) : undefined,
            description,
            content: {
                html: description,
                text: [song.name, song.singer, song.album, lyric?.lrc].filter(Boolean).join('\n'),
            },
            image: song.picimg,
            enclosure_url: urlData.url,
            enclosure_type: urlData.url ? audioMimeType(urlData.url) : undefined,
            enclosure_title: title,
            enclosure_length: urlData.size,
            itunes_duration: song.duration,
            itunes_item_image: song.picimg,
            _extra: {
                level: urlData.level ?? level,
                bitrate: urlData.br,
                lyrics: lyric,
            },
        };
    });
}

async function collectPlaylistSongs(id: string, limit: number, offset = 0, songs: SongInfo[] = [], info?: CollectionData): Promise<{ info?: CollectionData; songs: SongInfo[] }> {
    if (songs.length >= limit) {
        return { info, songs };
    }

    const data = await postApi<CollectionData>('playlist_trackall', { id, limit: PLAYLIST_PAGE_SIZE, offset });
    const pageSongs = data.songs ?? data.tracks ?? data.list ?? [];
    const nextSongs = [...songs, ...pageSongs];
    const nextInfo = info ?? data;

    if (pageSongs.length < PLAYLIST_PAGE_SIZE) {
        return { info: nextInfo, songs: nextSongs };
    }

    return collectPlaylistSongs(id, limit, offset + PLAYLIST_PAGE_SIZE, nextSongs, nextInfo);
}

export async function buildWyapiData(mode: string, input: string, level = DEFAULT_LEVEL, limit = DEFAULT_LIMIT): Promise<Data> {
    if (mode === 'song') {
        const id = extractId(input, mode);
        const item = await songToItem({ id }, level, true);
        return {
            title: `网易云音乐无损解析 - ${item.title}`,
            link: songLink(id),
            item: [item],
            allowEmpty: true,
            language: 'zh-CN',
        };
    }

    if (mode === 'search') {
        const data = await postApi<SearchData>('search', { keyword: input, limit, offset: 0 });
        const songs = data.songs ?? [];
        const items = await Promise.all(songs.slice(0, limit).map((song) => songToItem(song, level)));
        return {
            title: `网易云音乐无损解析 - 搜索 ${input}`,
            description: data.songCount === undefined ? undefined : `共 ${data.songCount} 首歌曲`,
            link: `${SITE_BASE}/?keyword=${encodeURIComponent(input)}`,
            item: items,
            allowEmpty: true,
            language: 'zh-CN',
        };
    }

    if (mode === 'playlist') {
        const id = extractId(input, mode);
        const { info, songs } = await collectPlaylistSongs(id, limit);

        const items = await Promise.all(songs.slice(0, limit).map((song) => songToItem(song, level)));
        return {
            title: `网易云音乐无损解析 - ${info?.name ?? info?.title ?? `歌单 ${id}`}`,
            description: info?.description,
            link: `https://music.163.com/playlist?id=${id}`,
            image: info?.coverImage ?? info?.picUrl,
            author: info?.creator?.name ?? info?.creator?.nickname,
            item: items,
            allowEmpty: true,
            language: 'zh-CN',
        };
    }

    if (mode === 'album') {
        const id = extractId(input, mode);
        const data = await postApi<CollectionData>('getAlbum', { id });
        const songs = data.songs ?? data.tracks ?? data.list ?? [];
        const items = await Promise.all(songs.slice(0, limit).map((song) => songToItem(song, level)));
        return {
            title: `网易云音乐无损解析 - ${data.name ?? data.title ?? `专辑 ${id}`}`,
            description: data.description,
            link: `https://music.163.com/album?id=${id}`,
            image: data.picUrl ?? data.coverImage,
            author: data.artist?.name,
            item: items,
            allowEmpty: true,
            language: 'zh-CN',
        };
    }

    throw new Error('mode must be one of song, search, playlist, album');
}

export const handler = (ctx: Context): Promise<Data> => {
    const { mode, id, level = DEFAULT_LEVEL } = ctx.req.param();
    const limit = Math.trunc(Number(ctx.req.query('limit') ?? String(DEFAULT_LIMIT)));
    return buildWyapiData(mode, decodeURIComponent(id), level, limit);
};

export const route: Route = {
    path: '/:mode/:id/:level?',
    name: '网易云音乐无损解析',
    url: 'wyapi.toubiec.cn',
    maintainers: ['JaggerGuo'],
    handler,
    example: '/toubiec/song/33894312/exhigh',
    parameters: {
        mode: {
            description: '解析模式',
            options: [
                { label: '单曲', value: 'song' },
                { label: '搜索', value: 'search' },
                { label: '歌单', value: 'playlist' },
                { label: '专辑', value: 'album' },
            ],
        },
        id: '单曲、歌单、专辑 ID；搜索模式下为关键词。也可以传入对应的网易云音乐链接',
        level: {
            description: '音质，默认为 `exhigh`',
            default: DEFAULT_LEVEL,
            options: Object.entries(LEVEL_LABELS).map(([value, label]) => ({ value, label })),
        },
    },
    description: `::: tip
该路由调用 [网易云音乐无损解析](https://wyapi.toubiec.cn/) 的接口，返回歌曲下载链接、音质、大小、封面和歌词。歌单模式会按 \`limit=500&offset=...\` 翻页拉取歌曲列表；可通过查询参数 \`limit\` 控制 RSS 条目数量。
:::

::: warning
下载链接由上游接口实时返回，通常带有过期时间。
:::`,
    categories: ['multimedia'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['wyapi.toubiec.cn'],
            target: '/song/:id',
        },
        {
            source: ['music.163.com/song'],
            target: '/song/:id',
        },
        {
            source: ['music.163.com/playlist'],
            target: '/playlist/:id',
        },
        {
            source: ['music.163.com/album'],
            target: '/album/:id',
        },
    ],
    view: ViewType.Audios,
};
