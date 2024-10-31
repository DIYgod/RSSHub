import got from '../pixiv-got';
import { maskHeader } from '../constants';
import queryString from 'query-string';
import { config } from '@/config';
import { load } from 'cheerio';
import getIllustDetail from './get-illust-detail';

import pixivUtils from '../utils';

export interface PixivNovel {
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
    };
    series?: {
        id?: number;
        title?: string;
    };
    total_bookmarks: number;
    total_view: number;
    total_comments: number;
}

export interface PixivResponse {
    data: {
        novels: PixivNovel[];
    };
}

export interface NovelData {
    id: string;
    seriesId: string;
    title: string;
    seriesTitle?: string;
    seriesIsWatched: boolean;

    userId: string;
    coverUrl: string;

    tags: string[];
    caption: string;
    text: string;

    cdate: string;

    rating: {
        like: number;
        bookmark: number;
        view: number;
    };

    images?: {
        [key: string]: {
            urls: {
                original: string;
            };
        };
    };

    marker: string | null;
    illusts: any[];

    seriesNavigation: {
        nextNovel?: {
            id: number;
            viewable: boolean;
            contentOrder: string;
            title: string;
            coverUrl: string;
            viewableMessage: string | null;
        };
        prevNovel?: {
            id: number;
            viewable: boolean;
            contentOrder: string;
            title: string;
            coverUrl: string;
            viewableMessage: string | null;
        };
    };

    glossaryItems: any[];
    replaceableItemIds: any[];

    aiType: number;
    isOriginal: boolean;
}
/**
 * 获取用户小说作品
 * @param {string} user_id 目标用户 id
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{novels: Novel[]}>>}
 */
export default function getNovels(user_id: string, token: string) {
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

// https://github.com/mikf/gallery-dl/blob/main/gallery_dl/extractor/pixiv.py
// https://github.com/mikf/gallery-dl/commit/db507e30c7431d4ed7e23c153a044ce1751c2847
export function getNovelContent(novel_id: string, token: string) {
    return got('https://app-api.pixiv.net/webview/v2/novel', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            id: novel_id,
            viewer_version: '20221031_ai',
        }),
    });
}

export async function parseNovelContent(response: string, token: string) {
    try {
        const $ = load(response);

        // 從 script 標籤中提取 pixiv 物件
        // Extract pixiv object from script tag
        let novelData: NovelData | undefined;

        $('script').each((_, script) => {
            const content = $(script).html() || '';
            if (content.includes("Object.defineProperty(window, 'pixiv'")) {
                const match = content.match(/novel:\s*({[\s\S]*?}),\s*isOwnWork/);
                if (match) {
                    try {
                        novelData = JSON.parse(match[1]);
                    } catch (error) {
                        throw new Error(`Failed to parse novel data: ${error instanceof Error ? error.message : String(error)}`);
                    }
                }
            }
        });

        if (!novelData?.text) {
            return '';
        }

        let content = novelData.text;

        // 先收集所有需要處理的圖片 ID 和頁碼
        // First collect all image IDs and page numbers that need processing
        const imageMatches = [...content.matchAll(/\[pixivimage:(\d+)(?:-(\d+))?\]/g)];
        const imageIdToUrl = new Map<string, string>();

        // 批量獲取圖片資訊
        // Batch fetch image information
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

        // https://www.pixiv.help/hc/ja/articles/235584168-小説作品の本文内に使える特殊タグとは
        content = content
            // 處理作者上傳的圖片
            // Process author uploaded images
            .replaceAll(/\[uploadedimage:(\d+)\]/g, (match, imageId) => {
                const originalUrl = novelData?.images?.[imageId]?.urls?.original;
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

        return {
            novelData,
            content: $content.html() || '',
        };
    } catch (error) {
        throw new Error(`Error parsing novel content: ${error instanceof Error ? error.message : String(error)}`);
    }
}
