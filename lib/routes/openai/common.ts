import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { DataItem } from '@/types';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';

export const BASE_URL = new URL('https://openai.com');

/** Fetch the details of an article. */
export const fetchArticleDetails = async (url: string) => {
    const page = await ofetch(url);
    const $ = load(page);

    const $article = $('#main article');

    const categories = $('h1')
        .prev()
        .find('a[href]')
        .toArray()
        .map((element) => $(element).text());

    // Article header (title, sub title and categories)
    $($article.find('h1').parents().get(4)).remove();
    // Related articles (can be the #citations section in some cases, so the last child needs to be removed first)
    $article.children().last().remove();
    // Article authors and tags
    $article.find('#citations').remove();

    return {
        content: $article.html() ?? undefined,
        // Categories can be found on https://openai.com/news/ and https://openai.com/research/index/
        categories,
        image: $('meta[property="og:image"]').attr('content'),
    };
};

/** Fetch all articles from OpenAI's RSS feed. */
export const fetchArticles = async (limit: number): Promise<DataItem[]> => {
    const page = await ofetch('https://openai.com/news/rss.xml', {
        responseType: 'text',
        headers: { 'User-Agent': config.ua },
    });

    const $ = load(page, { xml: true });

    return Promise.all(
        $('item')
            .toArray()
            .slice(0, limit)
            .map<Promise<DataItem>>((element) => {
                const id = $(element).find('guid').text();

                return cache.tryGet(`openai:news:${id}`, async () => {
                    const title = $(element).find('title').text();
                    const pubDate = $(element).find('pubDate').text();
                    const link = $(element).find('link').text();

                    const { content, categories } = await fetchArticleDetails(link);

                    return {
                        guid: id,
                        title,
                        link,
                        pubDate,
                        description: content,
                        category: categories,
                    } as DataItem;
                }) as Promise<DataItem>;
            })
    );
};

const getApiUrl = async () => {
    const blogRootUrl = 'https://openai.com/blog';

    // Find API base URL
    const initResponse = await got({
        method: 'get',
        url: blogRootUrl,
    });

    const apiBaseUrl = initResponse.data
        .toString()
        .match(/(?<=TWILL_API_BASE:").+?(?=")/)[0]
        .replaceAll(String.raw`\u002F`, '/');

    return new URL(apiBaseUrl);
};

const parseArticle = (ctx, rootUrl, attributes) =>
    cache.tryGet(attributes.slug, async () => {
        const textUrl = `${rootUrl}/${attributes.slug}`;
        const detailResponse = await got({
            method: 'get',
            url: textUrl,
        });
        let content = load(detailResponse.data);

        const authors = content('[aria-labelledby="metaAuthorsHeading"] > li > a > span > span')
            .toArray()
            .map((entry) => content(entry).text())
            .join(', ');

        // Leave out comments
        const comments = content('*')
            .contents()
            .filter(function () {
                return this.nodeType === 8;
            });
        comments.remove();

        content = content('#content');

        const imageSrc = attributes.seo.ogImageSrc;
        const imageAlt = attributes.seo.ogImageAlt;

        const article = art(path.join(__dirname, 'templates/article.art'), {
            content,
            imageSrc,
            imageAlt,
        });

        // Not all article has tags
        attributes.tags = attributes.tags || [];

        return {
            title: attributes.title,
            author: authors,
            description: article,
            pubDate: attributes.createdAt,
            category: attributes.tags.map((tag) => tag.title),
            link: textUrl,
        };
    });

export { getApiUrl, parseArticle };
