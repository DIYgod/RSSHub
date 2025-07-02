import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.mee.gov.cn/';

const columns = {
    wsqtkz: { name: '温室气体控制', order: 1 },
    syqhbh: { name: '适应气候变化', order: 2 },
    qhbhlf: { name: '气候变化国际合作', order: 3 },
};

export const route: Route = {
    path: '/mee/ywgz/ydqhbh/:category?',
    categories: ['government'],
    example: '/gov/mee/ywgz/ydqhbh/wsqtkz',
    parameters: { category: '分类名，预设 `wsqtkz`' },
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
            source: ['www.mee.gov.cn/ywgz/ydqhbh/:category'],
            target: '/mee/ywgz/ydqhbh:category',
        },
    ],
    name: '要闻动态',
    maintainers: ['lijhdev'],
    handler,
    description: `| 温室气体控制 | 适应气候变化 | 气候变化国际合作 |
| :------: | :------: | :------: |
|   wsqtkz   | syqhbh |  qhbhlf  |`,
};
async function handler(ctx) {
    const cate = ctx.req.param('category') ?? 'wsqtkz';
    const url = `${baseUrl}ywgz/ydqhbh/`;
    const title = `${columns[cate].name} -  应对气候变化 - 中华人民共和国生态环境部`;
    const response = await got(url);
    const $ = load(response.data);
    const all = $('.bd');
    const list = all
        .find(`div:nth-child(${columns[cate].order})`)
        .find('li')
        .toArray()
        .map((item) => {
            const title = $(item).find('a').text().trim();
            const href = $(item).find('a').attr('href');
            const link = new URL(href, url).href;
            return {
                title,
                link,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);
                try {
                    item.pubDate = timezone(parseDate(content('meta[name=PubDate]').attr('content')), +8);
                    // 视频新闻规则不一样
                    // if (cate === 'wsqtkz') {
                    //     item.title = content('meta[name=ArticleTitle]').attr('content');
                    //     // 取消视频自动播放
                    //     const video_control = content('.neiright_JPZ_GK_CP video');
                    //     video_control.removeAttr('autoplay');
                    //     // 视频路径转绝对路径
                    //     const video_source = content('.neiright_JPZ_GK_CP source');
                    //     const video_href = video_source.attr('src');
                    //     const _title_href = item.link.split('/').at(-1);
                    //     const _video_src = item.link.replace(_title_href, video_href.slice(2));
                    //     video_source.attr('src', _video_src);
                    // }
                    item.description = content('.neiright_JPZ_GK_CP').html();
                } catch {
                    item.description = '';
                }
                return item;
            })
        )
    );
    return {
        title,
        link: url,
        item: items,
    };
}
