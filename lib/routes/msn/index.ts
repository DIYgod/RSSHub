import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface MsnCard {
    url: string;
    title: string;
    abstract: string;
    publishedDateTime?: string;
    category?: string;
}

const apiKey = '0QfOX3Vn51YCzitbLaRkTTBadtWpgTN8NZLW0C1SEM';
const fetchedArticleContentHtmlImgRegex = /<img data-reference="image" data-document-id="cms\/api\/amp\/image\/([A-Za-z0-9]+)">/g;

export const route: Route = {
    path: '/:market/:name/:id',
    parameters: {
        market: 'Market code. Find it in MSN url, e.g. zh-tw',
        name: 'Name of the channel. Find it in MSN url, e.g. Bloomberg',
        id: 'ID of the channel (always starts with sr-vid). Find it in MSN url, e.g. sr-vid-08gw7ky4u229xjsjvnf4n6n7v67gxm0pjmv9fr4y2x9jjmwcri4s',
    },
    categories: ['traditional-media'],
    example: '/msn/zh-tw/Bloomberg/sr-vid-08gw7ky4u229xjsjvnf4n6n7v67gxm0pjmv9fr4y2x9jjmwcri4s',
    description: 'MSN News',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.msn.com/:market/channel/source/:name/:id'],
            target: '/:market/:name/:id',
        },
    ],
    name: 'News',
    maintainers: ['KTachibanaM'],
    handler: async (ctx) => {
        const { market, name, id } = ctx.req.param();
        let truncatedId = id;
        if (truncatedId.startsWith('sr-')) {
            truncatedId = truncatedId.slice(3);
        }

        const pageData = await ofetch(`https://www.msn.com/${market}/channel/source/${name}/${id}`);
        const $ = load(pageData);
        const headElement = $('head');
        const dataClientSettings = headElement.attr('data-client-settings') ?? '{}';
        const parsedSettings = JSON.parse(dataClientSettings);
        const requestMuid = parsedSettings.fd_muid;

        const jsonData = await ofetch<{ sections: Array<{ cards: MsnCard[] }> }>(
            `https://assets.msn.com/service/news/feed/pages/providerfullpage?market=${market}&query=newest&CommunityProfileId=${truncatedId}&apikey=${apiKey}&user=m-${requestMuid}`
        );
        if (!jsonData.sections?.[0]?.cards?.length) {
            throw new Error('MSN returned no articles for this channel. Check the market and source ID on its public page.');
        }
        const items = await pMap(
            jsonData.sections[0].cards,
            async (card) => {
                let articleContentHtml = '';

                const articleUrl = card.url;
                const parsedArticleUrl = URL.parse(articleUrl);
                let articleId = parsedArticleUrl?.pathname.split('/').pop();
                if (articleId?.startsWith('ar-')) {
                    articleId = articleId.slice(3);
                    const articleDetailUrl = `https://assets.msn.com/content/view/v2/Detail/${market}/${articleId}`;
                    const fetchedArticleContentHtml = await cache.tryGet(articleDetailUrl, async () => {
                        const articleData = await ofetch<{ body: string }>(articleDetailUrl);
                        return articleData.body;
                    });
                    articleContentHtml = fetchedArticleContentHtml.replaceAll(fetchedArticleContentHtmlImgRegex, '<img src="https://img-s-msn-com.akamaized.net/tenant/amp/entityid/$1.img">');
                }

                return {
                    title: card.title,
                    link: articleUrl,
                    description: card.abstract,
                    content: {
                        html: articleContentHtml,
                    },
                    pubDate: card.publishedDateTime ? parseDate(card.publishedDateTime) : undefined,
                    category: card.category ? [card.category] : undefined,
                };
            },
            { concurrency: 3 }
        );

        const channelLink = `https://www.msn.com/${market}/channel/source/${name}/${id}`;
        return {
            title: name,
            image: 'https://www.msn.com/favicon.ico',
            link: channelLink,
            item: items,
        };
    },
};
