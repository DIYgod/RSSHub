import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

interface RSSItem {
    title: string;
    link: string;
    description: string; // 保持 HTML 格式
    pubDate: Date;
    author: string;
}

export const route: Route = {
    name: 'IEEE Journal Articles',
    maintainers: ['HappyZhu99'],
    categories: ['journal'],
    path: '/journal/:journalID',
    parameters: {
        journalID: 'journal ID, can be found in the URL',
    },
    example: '/ieee/journal/aiaaj',
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('journalID');

    const baseUrl = 'https://arc.aiaa.org';
    const rssUrl = `${baseUrl}/action/showFeed?type=etoc&feed=rss&jc=${id}`;

    const pageResponse = await ofetch(rssUrl);

    const $ = load(pageResponse, {
        xml: {
            xmlMode: true,
        },
    });

    let channelTitle = $('title').first().text();
    channelTitle = channelTitle.replace(': Table of Contents', '');

    const imageUrl = $('image url').text();
    const items: RSSItem[] = [];

    $('item').each((index, element) => {
        const $item = $(element);

        // 提取文章标题
        const title = $item.find(String.raw`dc\:title`).text();

        // 提取文章链接
        const link = $item.find('link').text() || '';

        // 提取文章正文 (description)，保留 HTML 格式
        const description = $item.find('description').text() || '';

        // 提取文章发布日期
        // 优先使用 dc:date，因为它通常更精确
        const pubDate = parseDate($item.find(String.raw`dc\:date`).text() || ''); // 如果都没有，则为空字符串

        // 提取文章作者
        // 可能有多个 dc:creator 标签
        const authors: string[] = [];
        $item.find(String.raw`dc\:creator`).each((i, authorElement) => {
            authors.push($(authorElement).text());
        });
        const author = authors.join(', '); // 将所有作者用逗号和空格连接起来

        items.push({
            title,
            link,
            description,
            pubDate,
            author,
        });
    });

    return {
        title: `${channelTitle} | arc.aiaa.org`,
        description: 'List of articles from both the latest and ahead of print issues.',
        image: imageUrl,
        link: `${baseUrl}/journal/${id}`,
        item: items,
    };
}
