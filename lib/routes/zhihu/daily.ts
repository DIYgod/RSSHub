// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const utils = require('./utils');
import { parseDate } from '@/utils/parse-date';

// 参考：https://github.com/izzyleung/ZhihuDailyPurify/wiki/%E7%9F%A5%E4%B9%8E%E6%97%A5%E6%8A%A5-API-%E5%88%86%E6%9E%90
// 文章给出了v4版 api的信息，包含全文api

async function dohResolve(name) {
    const response = await got('https://223.5.5.5/resolve', {
        searchParams: {
            name,
            type: 'A',
            edns_client_subnet: '223.5.5.5', // 使用国内的ip地址
        },
        headers: {
            accept: 'application/dns-json',
        },
    });
    return response.data.Answer.map((item) => item.data);
}

export default async (ctx) => {
    const api = 'https://news-at.zhihu.com/api/4/news';
    const HOST = 'news-at.zhihu.com';
    let address = HOST;
    try {
        await got(`${api}/latest`);
    } catch {
        address = (await dohResolve(HOST)).pop(); // 国外ip证书配置有误，解析到国内地址
    }
    const listRes = await got({
        method: 'get',
        url: `${api}/latest`,
        headers: {
            ...utils.header,
            Referer: `${api}/latest`,
            Host: HOST,
        },
        host: address,
    });
    // 根据api的说明，过滤掉极个别站外链接
    const storyList = listRes.data.stories.filter((el) => el.type === 0);
    const date = listRes.data.date;

    const articleList = storyList.map((item) => ({
        title: item.title,
        pubDate: parseDate(date, 'YYYYMMDD'),
        link: item.url,
        guid: item.url,
        storyId: item.id,
    }));

    const items = await Promise.all(
        articleList.map(async (item) => {
            const url = `${api}/${item.storyId}`;
            const description = await cache.tryGet(item.link, async () => {
                const storyDetail = await got({
                    method: 'get',
                    url,
                    headers: {
                        Referer: url,
                        Host: HOST,
                    },
                    host: address,
                });
                return utils.ProcessImage(storyDetail.data.body.replaceAll(/<div class="meta">([\S\s]*?)<\/div>/g, '<strong>$1</strong>').replaceAll(/<\/?h2.*?>/g, ''));
            });
            item.description = description;
            return item;
        })
    );

    ctx.set('data', {
        title: '知乎日报',
        link: 'https://daily.zhihu.com',
        description: '每天3次，每次7分钟',
        image: 'http://static.daily.zhihu.com/img/new_home_v3/mobile_top_logo.png',
        item: items,
    });
};
