import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import Zaobao from './zaobao';

const baseUrl = 'https://www.zaobao.com';
export const logo = 'https://www.zaobao.com.sg/favicon.ico';

/**
 * 通用解析页面类似 https://www.zaobao.com/realtime/china 的网站
 *
 * @param {string} sectionUrl 形如 /realtime/china 的字符串
 * @returns 新闻标题以及新闻列表
 */
export const parseList = async (
    sectionUrl: string
): Promise<{
    title: string;
    resultList: Array<{
        title: string;
        description?: string;
        pubDate: Date;
        updated?: Date;
        link: string;
        category?: string[];
        author?: Array<{ name: string; url?: string }>;
    }>;
}> => {
    const pageResponse = await ofetch.raw(baseUrl + sectionUrl);
    const $ = load(pageResponse._data);
    let data = $('.card-listing .card .content-header a');
    if (data.length === 0) {
        // for HK version
        data = $('[data-testid="article-list"] article div div a.article-link');
    }
    const origin = new URL(pageResponse.url).origin;

    const title = $('meta[property="og:title"]').attr('content');
    if (!title) {
        throw new Error(`zaobao: no og:title on ${sectionUrl}`);
    }

    const resultList = await Promise.all(
        data.toArray().map((item) => {
            const $item = $(item);
            const href = $item.attr('href');
            if (!href) {
                throw new Error(`zaobao: article link without href on ${sectionUrl}`);
            }
            const link = new URL(href, origin).href;

            return cache.tryGet(`zaobao:article:v4:${link}`, async () => {
                if (href.includes('https://')) {
                    const isSingapore = pageResponse.url.startsWith('https://www.zaobao.com.sg/');
                    return {
                        title: isSingapore ? $item.text().trim() : ($item.attr('title')?.trim() as string),
                        link: href,
                        pubDate: timezone($item.next().text().trim().includes(':') ? parseDate($item.next().text().trim(), 'HH:mm') : parseDate($item.next().text().trim(), 'MM月DD日'), 8),
                    };
                }
                const response = await ofetch.raw(new URL(href, origin).href);
                let $1 = load(response._data);

                let category, images;
                const jsonText = $1('script[type="application/ld+json"]:contains("NewsArticle")')
                    .text()
                    .replaceAll(/\p{Cc}/gu, '');
                const ldJson = JSON.parse(jsonText);

                const title = ldJson.headline;
                const pubDate = parseDate(ldJson.datePublished);
                const updated = ldJson.dateModified ? parseDate(ldJson.dateModified) : undefined;
                const author = ldJson.author?.name ? [{ name: ldJson.author.name, url: ldJson.author.url }] : undefined;

                const isSingapore = response.url.startsWith('https://www.zaobao.com.sg/');
                if (isSingapore) {
                    category = $1('meta[name="keywords"]')
                        .attr('content')
                        ?.split(',')
                        .map((s) => s.trim());
                    $1 = load($1('.articleBody').html()!, null, false);
                    images = [{ url: ldJson.image[0].url }];
                } else {
                    category = ldJson.keywords?.split(',');
                }

                // $1('.overlay-microtransaction').remove();
                // $1('#video-freemium-player').remove();
                $1('.bff-google-ad, .bff-recommend-article').remove(); // SG
                $1('button.cursor-pointer').remove(); // SG
                $1('.bff-inline-image-expand-icon').remove(); // SG
                $1('img[alt="expend icon"]').remove(); // HK

                let articleBodyNode;
                if (isSingapore) {
                    articleBodyNode = $1;
                } else {
                    // for HK version
                    $1('astro-island, .further-reading, .read-on-app-cover').remove();
                    articleBodyNode = $1('.article-body');
                }

                const articleBody = articleBodyNode.html();
                const imageDataArray = processImageData(isSingapore, images, $1);

                // use JSX as template
                const dom = <Zaobao imageDataArray={imageDataArray} articleBody={articleBody}></Zaobao>;
                const description = renderToString(dom);

                return {
                    title,
                    description,
                    pubDate,
                    updated,
                    link,
                    category,
                    author,
                };
            });
        })
    );
    return {
        title,
        resultList,
    };
};

export interface ImageData {
    type: string;
    html: string;
    src?: string;
    title?: string;
}

const processImageData = (isSg, images, $1): ImageData[] => {
    if (isSg && images) {
        return images.map((img) => ({
            type: 'data',
            html: '',
            src: img.url,
            title: img.caption,
        }));
    }

    const hkImg = $1('[data-testid="article-banner"] img');
    if (hkImg.length) {
        return [
            {
                type: 'data',
                html: hkImg.prop('outerHTML'),
                src: hkImg.attr('src'),
                title: hkImg.attr('title'),
            },
        ];
    }

    return [];
};
