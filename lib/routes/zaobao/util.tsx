import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { renderToString } from 'hono/jsx/dom/server';
import { base32 } from 'rfc4648';
import Zaobao from './zaobao';

const baseUrl = 'https://www.zaobao.com';
export const logo = 'https://dss0.zbstatic5.com/web2/_astro/apple-touch-icon-57x57.zXViMIi5.png';

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
        description: string;
        pubDate: string;
        link: string;
    }[];
}> => {
    const response = await ofetch(baseUrl + sectionUrl);
    const $ = load(response);
    let data = $('.card-listing .card .content-header a');
    if (data.length === 0) {
        // for HK version
        data = $('[data-testid="article-list"] article div div a.article-link');
    }

    const title = $('meta[property="og:title"]').attr('content');

    const resultList = await Promise.all(
        data.toArray().map((item) => {
            const $item = $(item);
            const link = baseUrl + $item.attr('href');

            return cache.tryGet(link, async () => {
                const article = await ofetch(link);
                const $1 = load(article);

                let title, pubDate, category;
                if ($1('#seo-article-page').text() === '') {
                    // HK
                    title = $1('h1.article-title').text();
                    const jsonText = $1('head script[type="application/ld+json"]')
                        .text()
                        .replaceAll(/[\u0000-\u001F\u007F-\u009F]/g, '');
                    const ldJson = JSON.parse(jsonText);
                    pubDate = parseDate(ldJson.datePublished);
                    category = ldJson.keywords.split(',');
                } else {
                    // SG
                    const jsonText = $1('#seo-article-page')
                        .text()
                        .replaceAll(/[\u0000-\u001F\u007F-\u009F]/g, '');
                    const json = JSON.parse(jsonText);
                    title = json['@graph'][0]?.headline;
                    pubDate = parseDate(json['@graph'][0]?.datePublished);
                }

                // $1('.overlay-microtransaction').remove();
                // $1('#video-freemium-player').remove();
                // $1('.bff-google-ad, .bff-recommend-article').remove();
                $1('img[alt="expend icon"]').remove();

                let articleBodyNode = $1('.articleBody');
                if (articleBodyNode.length === 0) {
                    // for HK version
                    $1('astro-island, .further-reading, .read-on-app-cover').remove();
                    articleBodyNode = $1('.article-body');
                }

                const articleBody = articleBodyNode.html();
                const imageDataArray = processImageData($1);

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
        .sort((a, b) => {
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

const processImageData = ($1) => {
    const imageDataArray: ImageData[] = [];

    // const imageSelectors = [
    //     '.inline-figure-img', // for SG version
    //     '.body-content .loadme picture img', // Unused?
    //     '.inline-figure-gallery', // for SG version
    //     '#carousel-article', // for HK version, HK version of multi images use same selector as single image, so g is needed for all pages
    // ];

    // for (const selector of imageSelectors) {
    //     if ($1(selector).length) {
    //         let html = $1(selector === '#carousel-article' ? '#carousel-article .carousel-inner' : selector).html();

    //         if (html) {
    //             html = html.replaceAll(/\/\/.*\.com\/s3fs-public/g, '//static.zaobao.com/s3fs-public').replaceAll('s3/files', 's3fs-public');

    //             imageDataArray.push({
    //                 type: selector === '.body-content .loadme picture img' ? 'data' : 'normalHTML',
    //                 html,
    //                 ...(selector === '.body-content .loadme picture img' && {
    //                     src: $1('.body-content .loadme picture source').attr('data-srcset'),
    //                     title: $1(selector).attr('title'),
    //                 }),
    //             });
    //         }
    //     }
    // }

    const img = $1('[data-testid="article-banner"] img');
    if (img.length) {
        imageDataArray.push({
            type: 'data',
            html: img.prop('outerHTML'),
            src: img
                .attr('src')
                .replaceAll(/\/\/.*\.com\/s3fs-public/g, '//static.zaobao.com/s3fs-public')
                .replaceAll('s3/files', 's3fs-public'),
            title: img.attr('title'),
        });
    }

    return imageDataArray;
};
