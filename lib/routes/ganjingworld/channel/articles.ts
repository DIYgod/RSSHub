// RSSHub route for fetching articles from Ganjing World.
// Returns a list of articles in a channel.
// Source: https://www.ganjingworld.com

import { Route } from '@/types';
import { ApiResponse } from '../interfaces/api';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/channel/articles/:id',
    categories: ['social-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    example: 'www.ganjingworld.com/channel/1fcahpcut9t3gz4zIvYSJR7qd1cs0c?tab=articles',
    parameters: { id: 'Channel ID, can be found in channel url' },
    radar: [
        {
            source: ['ganjingworld.com'],
            target: '/:lang?/channel/:id?tab=articles*',
        },
    ],
    url: 'www.ganjingworld.com',
    name: 'Articles in a channel',
    maintainers: ['yixiangli2001'],

    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const url = `https://www.ganjingworld.com/channel/${id}?tab=articles`;
    const apiUrl = `https://gw.ganjingworld.com/v1.1/content/get-by-channel?channel_id=${id}&content_type=News`;

    const parsed: ApiResponse = await ofetch<ApiResponse>(apiUrl);
    if (parsed.data.list.length === 0) {
        throw new Error('No articles found for this channel. Please make sure the channel ID is correct and that the channel contains shorts.');
    }
    const title = parsed.data.list[0].channel.name;
    const items = await Promise.all(
        parsed.data.list.map(async (item) => {
            const pubDate = new Date(item.time_scheduled);
            const fetchArticleUrl = `https://gw.ganjingworld.com/v1.1/content/query?lang=zh-TW&query=basic%2Cfull%2Ctranslations%2Clike%2Cshare%2Csave%2Cview%2Ctag_list&ids=${item.id}`;
            const parsedArticle: ApiResponse = await ofetch<ApiResponse>(fetchArticleUrl);
            const description = parsedArticle.data.list[0].text || '';
            return {
                title: item.title,
                link: `https://www.ganjingworld.com/news/${item.id}`,
                pubDate,
                description,
            };
        })
    );

    return {
        title,
        link: url,
        description: `Articles from Ganjing World Channel ${title}`,
        item: items,
    };
}
