import { load } from 'cheerio';

import logger from '@/utils/logger';

import getIllustDetail from '../../api/get-illust-detail';
import pixivUtils from '../../utils';

export function convertPixivProtocolExtended(caption: string): string {
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

// docs: https://www.pixiv.help/hc/ja/articles/235584168-小説作品の本文内に使える特殊タグとは
export async function parseNovelContent(content: string, images: Record<string, string>, token?: string): Promise<string> {
    try {
        // 如果有 token，處理 pixiv 圖片引用
        // If token exists, process pixiv image references
        if (token) {
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
                        const pixivimages = pixivUtils.getImgs(illust).map((img) => img.match(/src="([^"]+)"/)?.[1] || '');

                        const imageUrl = pixivimages[Number(pageNum) || 0];
                        if (imageUrl) {
                            imageIdToUrl.set(pageNum ? `${illustId}-${pageNum}` : illustId, imageUrl);
                        }
                    } catch (error) {
                        // 記錄錯誤但不中斷處理
                        // Log error but don't interrupt processing
                        logger.warn(`Failed to fetch illust detail for ID ${illustId}: ${error instanceof Error ? error.message : String(error)}`);
                    }
                })
            );

            // 替換 pixiv 圖片引用為 img 標籤
            // Replace pixiv image references with img tags
            content = content.replaceAll(/\[pixivimage:(\d+)(?:-(\d+))?\]/g, (match, illustId, pageNum) => {
                const key = pageNum ? `${illustId}-${pageNum}` : illustId;
                const imageUrl = imageIdToUrl.get(key);
                return imageUrl ? `<img src="${imageUrl}" alt="pixiv illustration ${illustId}${pageNum ? ` page ${pageNum}` : ''}">` : match;
            });
        } else {
            /*
             * 處理 get-novels-sfw 的情況
             * 當沒有 PIXIV_REFRESHTOKEN 時，將 [pixivimage:(\d+)] 格式轉換為 artwork 連結
             * 因無法獲取 Pixiv 作品詳情，改為提供直接連結到原始作品頁面
             *
             * Handle get-novels-sfw case
             * When PIXIV_REFRESHTOKEN is not available, convert [pixivimage:(\d+)] format to artwork link
             * Provide direct link to original artwork page since artwork details cannot be retrieved
             */
            content = content.replaceAll(/\[pixivimage:(\d+)(?:-(\d+))?\]/g, (_, illustId) => `<a href="https://www.pixiv.net/artworks/${illustId}" target="_blank" rel="noopener noreferrer">Pixiv Artwork #${illustId}</a>`);
        }

        // 處理作者上傳的圖片
        // Process author uploaded images
        content = content.replaceAll(/\[uploadedimage:(\d+)\]/g, (match, imageId) => {
            if (images[imageId]) {
                return `<img src="${pixivUtils.getProxiedImageUrl(images[imageId])}" alt="novel illustration ${imageId}">`;
            }
            return match;
        });

        // 基本格式處理
        // Basic formatting
        content = content
            // 換行轉換為 HTML 換行
            // Convert newlines to HTML breaks
            .replaceAll('\n', '<br>')
            // 連續換行轉換為段落
            // Convert consecutive breaks to paragraphs
            .replaceAll(/(<br>){2,}/g, '</p><p>')
            // ruby 標籤（為日文漢字標註讀音）
            // ruby tags (for Japanese kanji readings)
            .replaceAll(/\[\[rb:(.*?)>(.*?)\]\]/g, '<ruby>$1<rt>$2</rt></ruby>')
            // 外部連結
            // external links
            .replaceAll(/\[\[jumpuri:(.*?)>(.*?)\]\]/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // 頁面跳轉，但由於 [newpage] 使用 hr 分隔，沒有頁數，沒必要跳轉，所以只顯示文字
            // Page jumps, but since [newpage] uses hr separators, without the page numbers, jumping isn't needed, so just display text
            .replaceAll(/\[jump:(\d+)\]/g, 'Jump to page $1')
            // 章節標題
            // chapter titles
            .replaceAll(/\[chapter:(.*?)\]/g, '<h2>$1</h2>')
            // 分頁符
            // page breaks
            .replaceAll('[newpage]', '<hr>');

        // 使用 cheerio 進行 HTML 清理和優化
        // Use cheerio for HTML cleanup and optimization
        const $content = load(`<article><p>${content}</p></article>`);

        // 處理嵌套段落：移除多餘的嵌套
        // Handle nested paragraphs: remove unnecessary nesting
        $content('p p').each((_, elem) => {
            const $elem = $content(elem);
            $elem.replaceWith($elem.html() || '');
        });

        // 處理段落中的標題：確保正確的 HTML 結構
        // Handle headings in paragraphs: ensure correct HTML structure
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
        throw new Error(`Error parsing novel content: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
}
