// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const baseUrl = 'https://feed.hamibot.com';
    const apiUrl = `${baseUrl}/api/feeds/${id}/json`;

    let response;

    try {
        response = await got(apiUrl);
    } catch (error) {
        if (error.name === 'HTTPError' && error.response.statusCode === 404) {
            throw new Error('该公众号不存在，有关如何获取公众号 id，详见 https://docs.rsshub.app/routes/new-media#wei-xin-gong-zhong-hao-feeddd-lai-yuan');
        }
        throw error;
    }

    let items = response.data.items.map((item) => ({
        title: item.title,
        // the date is when the article was grabbed, not published, `finishArticleItem` will fix this
        pubDate: parseDate(item.date_modified),
        link: item.url,
        guid: item.id,
    }));

    items = await Promise.all(items.map((item) => finishArticleItem(item)));

    ctx.set('data', {
        title: response.data.title,
        link: response.data.feed_url,
        description: response.data.title,
        item: items,
        allowEmpty: true,
    });

    ctx.set('json', {
        title: response.data.title,
        link: response.data.feed_url,
        image: 'https://mp.weixin.qq.com/favicon.ico',
        description: response.data.title,
        item: items,
    });
};
