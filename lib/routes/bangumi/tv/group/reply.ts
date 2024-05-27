import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/tv/topic/:id',
    categories: ['anime'],
    example: '/bangumi/tv/topic/367032',
    parameters: { id: '话题 id, 在话题页面地址栏查看' },
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
            source: ['bgm.tv/group/topic/:id'],
        },
    ],
    name: '小组话题的新回复',
    maintainers: ['ylc395'],
    handler,
};

async function handler(ctx) {
    // bangumi.tv未提供获取小组话题的API，因此仍需要通过抓取网页来获取
    const topicID = ctx.req.param('id');
    const link = `https://bgm.tv/group/topic/${topicID}`;
    const { data: html } = await got(link);
    const $ = load(html);
    const title = $('#pageHeader h1').text();
    const latestReplies = $('.row_reply')
        .toArray()
        .map((el) => {
            const $el = $(el);
            return {
                id: $el.attr('id'),
                author: $el.find('.userInfo .l').text(),
                content: $el.find('.reply_content .message').html(),
                date: $el.children().first().find('small').children().remove().end().text().slice(3),
            };
        });
    const latestSubReplies = $('.sub_reply_bg')
        .toArray()
        .map((el) => {
            const $el = $(el);
            return {
                id: $el.attr('id'),
                author: $el.find('.userName .l').text(),
                content: $el.find('.cmt_sub_content').html(),
                date: $el.children().first().find('small').children().remove().end().text().slice(3),
            };
        });
    const finalLatestReplies = [...latestReplies, ...latestSubReplies].sort((a, b) => (a.id < b.id ? 1 : -1));

    const postTopic = {
        title,
        description: $('.postTopic .topic_content').html(),
        author: $('.postTopic .inner strong a').first().text(),
        pubDate: timezone(parseDate($('.postTopic .re_info small').text().trim().slice(5)), +8),
        link,
    };

    return {
        title: `${title}的最新回复`,
        link,
        item: [
            ...finalLatestReplies.map((c) => ({
                title: `${c.author} 回复了小组话题《${title}》`,
                description: c.content,
                pubDate: timezone(parseDate(c.date), +8),
                author: c.author,
                link: `${link}#${c.id}`,
            })),
            postTopic,
        ],
    };
}
