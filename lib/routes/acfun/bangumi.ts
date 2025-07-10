import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/bangumi/:id',
    categories: ['anime'],
    view: ViewType.Videos,
    example: '/acfun/bangumi/5022158',
    parameters: { id: '番剧 id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '番剧',
    maintainers: ['xyqfer'],
    handler,
    description: `::: tip
番剧 id 不包含开头的 aa。
例如：\`https://www.acfun.cn/bangumi/aa5022158\` 的番剧 id 是 5022158，不包括开头的 aa。
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const url = `https://www.acfun.cn/bangumi/aa${id}`;

    const bangumiPage = await got(url, {
        headers: {
            Referer: 'https://www.acfun.cn',
        },
    });
    const bangumiData = JSON.parse(bangumiPage.data.match(/window.bangumiData = (.*?);\n/)[1]);
    const bangumiList = JSON.parse(bangumiPage.data.match(/window.bangumiList = (.*?);\n/)[1]);

    return {
        title: bangumiData.bangumiTitle,
        link: url,
        description: bangumiData.bangumiIntro,
        image: bangumiData.belongResource.coverImageV,
        item: bangumiList.items.map((item) => ({
            title: `${item.episodeName} - ${item.title}`,
            description: `<img src="${item.imgInfo.thumbnailImage.cdnUrls[0].url.split('?')[0]}">`,
            link: `http://www.acfun.cn/bangumi/aa${id}_36188_${item.itemId}`,
            pubDate: parseDate(item.updateTime, 'x'),
        })),
    };
}
