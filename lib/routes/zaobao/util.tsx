import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import { base32 } from 'rfc4648';

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
    resultList: {
        title: string;
        description?: string;
        pubDate: Date;
        link: string;
        category?: string[];
    }[];
}> => {
    const pageResponse = await ofetch.raw(baseUrl + sectionUrl);
    const $ = load(pageResponse._data);
    let data = $('.card-listing .card .content-header a');
    if (data.length === 0) {
        // for HK version
        data = $('[data-testid="article-list"] article div div a.article-link');
    }
    const origin = new URL(pageResponse.url).origin;

    const title = $('meta[property="og:title"]').attr('content') as string;

    const resultList = await Promise.all(
        data.toArray().map((item) => {
            const $item = $(item);
            const link = baseUrl + $item.attr('href');

            return cache.tryGet(link, async () => {
                if ($item.attr('href')?.includes('https://')) {
                    const isSingapore = pageResponse.url.startsWith('https://www.zaobao.com.sg/');
                    return {
                        title: isSingapore ? $item.text().trim() : ($item.attr('title')?.trim() as string),
                        link: $item.attr('href') as string,
                        pubDate: timezone($item.next().text().trim().includes(':') ? parseDate($item.next().text().trim(), 'HH:mm') : parseDate($item.next().text().trim(), 'MM月DD日'), +8),
                    };
                }
                const response = await ofetch.raw(new URL($item.attr('href') as string, origin).href);
                let $1 = load(response._data);

                let title, pubDate, category, images;
                const jsonText = $1('head script[type="application/ld+json"]')
                    .text()
                    .replaceAll(/[\u0000-\u001F\u007F-\u009F]/g, '');
                const ldJson = JSON.parse(jsonText);

                const isSingapore = response.url.startsWith('https://www.zaobao.com.sg/');
                if (isSingapore) {
                    const hydrationData = JSON.parse(
                        JSON.parse(
                            `"${
                                $1('script:contains("__staticRouterHydrationData")')
                                    .text()
                                    .match(/__staticRouterHydrationData = JSON.parse\("(.*)"\);/)?.[1]
                            }"`
                        )
                    );
                    const article = hydrationData.loaderData['0-0'].context.payload.article;
                    title = article.headline;
                    pubDate = parseDate(article.create_time, 'X');
                    category = article.tags.map((t) => t.name);
                    $1 = load(article.body_cn, null, false);
                    images = article.images;
                } else {
                    title = ldJson.headline;
                    pubDate = parseDate(ldJson.datePublished);
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
                    link,
                    category,
                };
            });
        })
    );
    return {
        title,
        resultList,
    };
};

export const orderContent = (parent) => {
    for (const [i, e] of parent
        .children()
        .toArray()
        .toSorted((a, b) => {
            const index = Buffer.from(base32.parse('GM======')).toString(); // substring(3)
            a = Buffer.from(
                base32.parse(
                    parent
                        .find((element) => a(element))
                        .data('s')
                        .slice(index)
                )
            ).toString();
            b = Buffer.from(
                base32.parse(
                    parent
                        .find((element) => b(element))
                        .data('s')
                        .slice(index)
                )
            ).toString();
            return a - b;
        })
        .entries()) {
        parent.find((element) => e(element)).attr('s', i);
        parent.append(e);
    }
};

export interface ImageData {
    type: string;
    html: string;
    src?: string;
    title?: string;
}

const processImageData = (isSg, images, $1) => {
    if (isSg && images) {
        return images.map((img) => ({
            type: 'data',
            html: '',
            src: img.url
                .replaceAll(/\/\/.*\.com\/s3fs-public/g, '//static.zaobao.com/s3fs-public')
                .replaceAll('s3/files', 's3fs-public')
                .split('?')[0],
            title: img.caption,
        })) as ImageData[];
    }

    const hkImg = $1('[data-testid="article-banner"] img');
    if (hkImg.length) {
        return [
            {
                type: 'data',
                html: hkImg.prop('outerHTML'),
                src: hkImg
                    .attr('src')
                    .replaceAll(/\/\/.*\.com\/s3fs-public/g, '//static.zaobao.com/s3fs-public')
                    .replaceAll('s3/files', 's3fs-public')
                    .split('?')[0],
                title: hkImg.attr('title'),
            },
        ] as ImageData[];
    }

    return [];
};
