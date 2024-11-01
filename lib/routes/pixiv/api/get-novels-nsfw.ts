import got from '../pixiv-got';
import { maskHeader } from '../constants';
import queryString from 'query-string';
import { config } from '@/config';
import { load } from 'cheerio';
import getIllustDetail from './get-illust-detail';

import pixivUtils from '../utils';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import cache from '@/utils/cache';
import { parseDate } from 'tough-cookie';
import { getToken } from '../token';

export interface nsfwNovelWork {
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

export interface nsfwNovelsResponse {
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

export default function getNovels(user_id: string, token: string): Promise<nsfwNovelsResponse> {
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

export async function getNovelDetail(novel_id: string, token: string): Promise<nsfwNovelDetail> {
    try {
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

        const $ = load(response.data);
        let novelDetail: nsfwNovelDetail | undefined;

        $('script').each((_, script) => {
            const content = $(script).html() || '';
            if (content.includes("Object.defineProperty(window, 'pixiv'")) {
                const match = content.match(/novel:\s*({[\s\S]*?}),\s*isOwnWork/);
                if (match) {
                    try {
                        novelDetail = JSON.parse(match[1]) as nsfwNovelDetail;
                    } catch (error) {
                        throw new Error(`Failed to parse novel data: ${error instanceof Error ? error.message : String(error)}`);
                    }
                }
            }
        });

        if (!novelDetail) {
            throw new Error('No novel data found');
        }

        return novelDetail;
    } catch (error) {
        throw new Error(`Error getting novel data: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function parseNovelContent(novelDetail: nsfwNovelDetail, token: string): Promise<string> {
    try {
        if (!novelDetail?.text) {
            return '';
        }

        let content = novelDetail.text;

        // 收集所有需要處理的圖片 ID 和頁碼
        const imageMatches = [...content.matchAll(/\[pixivimage:(\d+)(?:-(\d+))?\]/g)];
        const imageIdToUrl = new Map<string, string>();

        // 批量獲取圖片資訊
        await Promise.all(
            imageMatches.map(async ([, illustId, pageNum]) => {
                if (!illustId) {
                    return;
                }

                try {
                    const illust = (await getIllustDetail(illustId, token)).data.illust;
                    const images = pixivUtils.getImgs(illust).map((img) => img.match(/src="([^"]+)"/)?.[1] || '');

                    const imageUrl = images[Number(pageNum) || 0];
                    if (imageUrl) {
                        imageIdToUrl.set(pageNum ? `${illustId}-${pageNum}` : illustId, imageUrl);
                    }
                } catch (error) {
                    throw new Error(`Failed to fetch illust detail for ID ${illustId}: ${error instanceof Error ? error.message : String(error)}`);
                }
            })
        );

        // 處理特殊標籤
        content = content
            // 處理作者上傳的圖片
            // Process author uploaded images
            .replaceAll(/\[uploadedimage:(\d+)\]/g, (match, imageId) => {
                const originalUrl = novelDetail?.images?.[imageId]?.urls?.original;
                if (originalUrl) {
                    const imageUrl = originalUrl.replace('https://i.pximg.net', config.pixiv.imgProxy || '');
                    return `<img src="${imageUrl}" alt="novel illustration ${imageId}">`;
                }
                return match;
            })
            // 處理 pixiv 圖片引用
            // Handle pixiv image references
            .replaceAll(/\[pixivimage:(\d+)(?:-(\d+))?\]/g, (match, illustId, pageNum) => {
                const key = pageNum ? `${illustId}-${pageNum}` : illustId;
                const imageUrl = imageIdToUrl.get(key);
                return imageUrl ? `<img src="${imageUrl}" alt="pixiv illustration ${illustId}${pageNum ? ` page ${pageNum}` : ''}">` : match;
            })
            // 基本換行和段落
            // Basic line breaks and paragraphs
            .replaceAll('\n', '<br>')
            .replaceAll(/(<br>){2,}/g, '</p><p>')
            // ruby 標籤處理
            // Process ruby tags
            .replaceAll(/\[\[rb:(.*?)>(.*?)\]\]/g, '<ruby>$1<rt>$2</rt></ruby>')
            // 連結處理
            // Handle links
            .replaceAll(/\[\[jumpuri:(.*?)>(.*?)\]\]/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // 頁面跳轉，但由於 [newpage] 使用 hr 分隔，沒有頁數，沒必要跳轉，所以只顯示文字
            // Page jumps, but since [newpage] uses hr separators, without the page numbers, jumping isn't needed, so just display text
            .replaceAll(/\[jump:(\d+)\]/g, 'Jump to page $1')
            // 章節標題
            // Chapter titles
            .replaceAll(/\[chapter:(.*?)\]/g, '<h2>$1</h2>')
            // 換頁改成分隔線
            // Convert [newpage] tags to <hr> elements
            .replaceAll('[newpage]', '<hr>');

        // 使用 cheerio 進行最後的 HTML 清理
        // Use cheerio for final HTML cleanup
        const $content = load(`<article><p>${content}</p></article>`);

        // 優化嵌套段落處理
        // Optimize nested paragraph handling
        $content('p p').each((_, elem) => {
            const $elem = $content(elem);
            $elem.replaceWith($elem.html() || '');
        });

        // 確保標題標籤位置正確
        // Ensure correct heading tag placement
        $content('p h2').each((_, elem) => {
            const $elem = $content(elem);
            const $parent = $elem.parent('p');
            const html = $elem.prop('outerHTML');
            if ($parent.length && html) {
                $parent.replaceWith(`</p>${html}<p>`);
            }
        });

        return $content.html() || '';
    } catch (error) {
        throw new Error(`Error parsing novel content: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function convertPixivProtocolExtended(caption: string): string {
    const protocolMap = new Map([
        // 小說鏈接 Novel links
        [/pixiv:\/\/novels\/(\d+)/g, 'https://www.pixiv.net/novel/show.php?id=$1'],

        // 插畫鏈接 Illustration links
        [/pixiv:\/\/illusts\/(\d+)/g, 'https://www.pixiv.net/artworks/$1'],

        // 用戶鏈接 User links
        [/pixiv:\/\/users\/(\d+)/g, 'https://www.pixiv.net/users/$1'],

        // 小說系列鏈接 Novel series links
        [/pixiv:\/\/novel\/series\/(\d+)/g, 'https://www.pixiv.net/novel/series/$1'],
    ]);

    let convertedText = caption;

    for (const [pattern, replacement] of protocolMap) {
        convertedText = convertedText.replace(pattern, replacement);
    }

    return convertedText;
}

export async function getR18Novels(id: string, fullContent: boolean) {
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
    const novels = response.data.novels;
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
                const novelDetail = await getNovelDetail(novel.id, token);
                const content = await parseNovelContent(novelDetail, token);

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
