import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:community/:category?',
    categories: ['bbs'],
    example: '/learnku/laravel/qa',
    parameters: { community: '社区 标识，可在 <https://learnku.com/communities> 找到', category: '分类，如果不传 `category` 则获取全部分类' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['learnku.com/:community'],
            target: '/:community',
        },
    ],
    name: '社区',
    maintainers: ['kayw-geek'],
    handler,
    description: `| 招聘 | 翻译         | 问答 | 链接  |
| ---- | ------------ | ---- | ----- |
| jobs | translations | qa   | links |`,
};

async function handler(ctx) {
    const community = ctx.req.param('community');
    const category = ctx.req.param('category') || '';

    let url = `https://learnku.com/${community}`;
    if (category !== '') {
        url = `https://learnku.com/${community}/c/${category}`;
    }

    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = load(data);
    const list = $('.simple-topic').toArray();
    const item = await Promise.all(
        list.map(async (item) => {
            const $ = load(item);
            const categoryName = $('.category-name span').text().trim();
            if (['置顶', '广告'].includes(categoryName)) {
                return '';
            }
            $('.topic-title i').remove();
            const itemLink = $('.topic-title-wrap').attr('href');

            const title = $('.topic-title').text().trim();
            const content = await cache.tryGet(itemLink, async () => {
                const result = await got.get(itemLink);

                return load(result.data);
            });
            const article = content('.article-content .content-body').html();
            const comment = content('#all-comments').html();

            return {
                title,
                description: art(path.join(__dirname, 'templates/topic.art'), {
                    article,
                    comment,
                }),
                category: categoryName,
                link: itemLink,
                pubDate: parseDate($('.timeago').attr('title'), 'YYYY/MM/DD'),
            };
        })
    );

    const title = $('.sidebar .community-details .header span').text();
    $('.sidebar .community-details .main div div a').remove();
    const description = $('.sidebar .community-details .main div div').text();
    const categoryTitle = new Map([
        ['translations', { name: '翻译' }],
        ['jobs', { name: '招聘' }],
        ['qa', { name: '问答' }],
        ['links', { name: '链接' }],
        ['', { name: '最新' }],
    ]);
    return {
        title: `LearnKu - ${title} - ${categoryTitle.get(category).name}`,
        link: url,
        description,
        item: item.filter((item) => item !== ''),
    };
}
