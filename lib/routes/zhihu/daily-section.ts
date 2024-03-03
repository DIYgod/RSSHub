// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const utils = require('./utils');
import { parseDate } from '@/utils/parse-date';

// 参考：https://github.com/izzyleung/ZhihuDailyPurify/wiki/%E7%9F%A5%E4%B9%8E%E6%97%A5%E6%8A%A5-API-%E5%88%86%E6%9E%90
// 文章给出了v7版 api的信息，包含全文api

export default async (ctx) => {
    const sectionId = ctx.req.param('sectionId');
    const listRes = await got({
        method: 'get',
        url: `https://news-at.zhihu.com/api/7/section/${sectionId}`,
        headers: {
            ...utils.header,
            Referer: `https://news-at.zhihu.com/api/7/section/${sectionId}`,
        },
    });
    // 根据api的说明，过滤掉极个别站外链接
    const storyList = listRes.data.stories.filter((el) => el.url.startsWith('https://daily.zhihu.com/'));
    const resultItem = await Promise.all(
        storyList.map((story) => {
            const url = 'https://news-at.zhihu.com/api/7/news/' + story.id;
            const item = {
                title: story.title,
                pubDate: parseDate(story.date, 'YYYYMMDD'),
                description: '',
                link: 'https://daily.zhihu.com/story/' + story.id,
            };
            return cache.tryGet(`https://daily.zhihu.com/story/${story.id}`, async () => {
                const storyDetail = await got({
                    method: 'get',
                    url,
                    headers: {
                        Referer: url,
                    },
                });
                item.description = utils.ProcessImage(storyDetail.data.body.replaceAll(/<div class="meta">([\S\s]*?)<\/div>/g, '<strong>$1</strong>').replaceAll(/<\/?h2.*?>/g, ''));

                return item;
            });
        })
    );

    ctx.set('data', {
        title: `${listRes.data.name} - 知乎日报`,
        link: 'https://daily.zhihu.com',
        description: '每天3次，每次7分钟',
        image: 'http://static.daily.zhihu.com/img/new_home_v3/mobile_top_logo.png',
        item: resultItem,
    });
};
