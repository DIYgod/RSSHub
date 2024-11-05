import got from '../pixiv-got';
import { maskHeader } from '../constants';
import queryString from 'query-string';
import { config } from '@/config';
import { JSDOM, VirtualConsole } from 'jsdom';

import pixivUtils from '../utils';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import cache from '@/utils/cache';
import { parseDate } from 'tough-cookie';
import { getToken } from '../token';

interface nsfwNovelWork {
    id: string;
    title: string;
    caption: string;
    restrict: number;
    x_restrict: number;
    is_original: boolean;
    image_urls: {
        square_medium: string;
        medium: string;
        large: string;
    };
    create_date: string;
    tags: Array<{
        name: string;
        translated_name: string | null;
        added_by_uploaded_user: boolean;
    }>;
    page_count: number;
    text_length: number;
    user: {
        id: number;
        name: string;
        account: string;
        profile_image_urls: {
            medium: string;
        };
        is_followed: boolean;
        is_access_blocking_user: boolean;
    };
    series?: {
        id?: number;
        title?: string;
    };
    total_bookmarks: number;
    total_view: number;
    total_comments: number;
}

interface nsfwNovelsResponse {
    data: {
        user: {
            id: number;
            name: string;
            account: string;
            profile_image_urls: {
                medium: string;
            };
            is_followed: boolean;
            is_access_blocking_user: boolean;
        };
        novels: nsfwNovelWork[];
    };
}

interface nsfwNovelDetail {
    id: string;
    title: string;
    seriesId: string | null;
    seriesTitle: string | null;
    seriesIsWatched: boolean | null;
    userId: string;
    coverUrl: string;
    tags: string[];
    caption: string;
    cdate: string;
    rating: {
        like: number;
        bookmark: number;
        view: number;
    };
    text: string;
    marker: null;
    illusts: string[];
    images: {
        [key: string]: {
            novelImageId: string;
            sl: string;
            urls: {
                '240mw': string;
                '480mw': string;
                '1200x1200': string;
                '128x128': string;
                original: string;
            };
        };
    };
    seriesNavigation: {
        nextNovel: null;
        prevNovel: {
            id: number;
            viewable: boolean;
            contentOrder: string;
            title: string;
            coverUrl: string;
            viewableMessage: null;
        } | null;
    } | null;
    glossaryItems: string[];
    replaceableItemIds: string[];
    aiType: number;
    isOriginal: boolean;
}

function getNovels(user_id: string, token: string): Promise<nsfwNovelsResponse> {
    return got('https://app-api.pixiv.net/v1/user/novels', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            user_id,
            filter: 'for_ios',
        }),
    });
}

async function getNovelFullContent(novel_id: string, token: string): Promise<nsfwNovelDetail> {
    return (await cache.tryGet(`https://app-api.pixiv.net/webview/v2/novel:${novel_id}`, async () => {
        // https://github.com/mikf/gallery-dl/blob/main/gallery_dl/extractor/pixiv.py
        // https://github.com/mikf/gallery-dl/commit/db507e30c7431d4ed7e23c153a044ce1751c2847
        const response = await got('https://app-api.pixiv.net/webview/v2/novel', {
            headers: {
                ...maskHeader,
                Authorization: 'Bearer ' + token,
            },
            searchParams: queryString.stringify({
                id: novel_id,
                viewer_version: '20221031_ai',
            }),
        });

        const virtualConsole = new VirtualConsole().on('error', () => void 0);

        const { window } = new JSDOM(response.data, {
            runScripts: 'dangerously',
            virtualConsole,
        });

        const novelDetail = window.pixiv?.novel as nsfwNovelDetail;

        window.close();

        if (!novelDetail) {
            throw new Error('No novel data found');
        }

        return novelDetail;
    })) as nsfwNovelDetail;
}

function convertPixivProtocolExtended(caption: string): string {
    const protocolMap = new Map([
        [/pixiv:\/\/novels\/(\d+)/g, 'https://www.pixiv.net/novel/show.php?id=$1'],
        [/pixiv:\/\/illusts\/(\d+)/g, 'https://www.pixiv.net/artworks/$1'],
        [/pixiv:\/\/users\/(\d+)/g, 'https://www.pixiv.net/users/$1'],
        [/pixiv:\/\/novel\/series\/(\d+)/g, 'https://www.pixiv.net/novel/series/$1'],
    ]);

    let convertedText = caption;

    for (const [pattern, replacement] of protocolMap) {
        convertedText = convertedText.replace(pattern, replacement);
    }

    return convertedText;
}

export async function getR18Novels(id: string, fullContent: boolean, limit: number = 100) {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new ConfigNotFoundError(
            '該用戶爲 R18 創作者，需要 PIXIV_REFRESHTOKEN。This user is an R18 creator, PIXIV_REFRESHTOKEN is required - pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>'
        );
    }

    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new ConfigNotFoundError('pixiv not login');
    }

    const response = await getNovels(id, token);
    const novels = limit ? response.data.novels.slice(0, limit) : response.data.novels;
    const username = novels[0].user.name;

    const items = await Promise.all(
        novels.map(async (novel) => {
            const baseItem = {
                title: novel.series?.title ? `${novel.series.title} - ${novel.title}` : novel.title,
                description: `
                    <img src="${pixivUtils.getProxiedImageUrl(novel.image_urls.large)}" />
                    <p>${convertPixivProtocolExtended(novel.caption) || ''}</p>
                    <p>
                    字數：${novel.text_length}<br>
                    閱覽數：${novel.total_view}<br>
                    收藏數：${novel.total_bookmarks}<br>
                    評論數：${novel.total_comments}<br>
                    </p>`,
                author: novel.user.name,
                pubDate: parseDate(novel.create_date),
                link: `https://www.pixiv.net/novel/show.php?id=${novel.id}`,
                category: novel.tags.map((t) => t.name),
            };

            if (!fullContent) {
                return baseItem;
            }

            try {
                const novelDetail = await getNovelFullContent(novel.id, token);
                const images = Object.fromEntries(
                    Object.entries(novelDetail.images)
                        .filter(([, image]) => image?.urls?.original)
                        .map(([id, image]) => [id, image.urls.original.replace('https://i.pximg.net', config.pixiv.imgProxy || '')])
                );

                const content = await pixivUtils.parseNovelContent(novelDetail.text, images, token);

                return {
                    ...baseItem,
                    description: `${baseItem.description}<hr>${content}`,
                };
            } catch {
                return baseItem;
            }
        })
    );

    return {
        title: `${username}'s novels - pixiv`,
        description: `${username} 的 pixiv 最新小说`,
        image: pixivUtils.getProxiedImageUrl(novels[0].user.profile_image_urls.medium),
        link: `https://www.pixiv.net/users/${id}/novels`,
        item: items,
    };
}
