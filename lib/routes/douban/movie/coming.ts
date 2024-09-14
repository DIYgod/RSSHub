import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/movie/coming',
    categories: ['social-media'],
    example: '/douban/coming',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '电影即将上映',
    maintainers: ['reonokiy'],
    handler,
};

async function handler(ctx) {
    const url = 'https://m.douban.com/rexxar/api/v2/movie/coming_soon';

    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: 'https://m.douban.com/movie/',
        },
    });

    ctx.set('json', { response });

    return {
        title: '豆瓣电影-即将上映',
        link: 'https://movie.douban.com/coming',
        item: response.data?.subjects?.map((item) => {
            const description = `<img src="${item?.cover_url}" alt="${item?.title}" referrerpolicy="no-referrer"><br>
              <h2>电影信息</h2>
              <ul>
              <li>导演：${item?.directors?.map((d) => d?.name).join(', ')}</li>
              <li>演员：${item?.actors?.map((a) => a?.name).join(', ')}</li>
              <li>类型：${item?.genres?.join(' / ')}</li>
              <li>上映日期：${item?.pubdate?.join(' / ')}</li>
              <li>想看：${item?.wish_count}</li>
              </ul>
              <h2>剧情简介</h2>
              <p>${item?.intro}</p>
              `;

            return {
                title: item?.title,
                link: item?.url,
                guid: item?.url,
                description,
                category: item?.genres,
                itunes_item_image: item?.cover_url,
                upvotes: item?.wish_count,
            };
        }),
    };
}
