import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/bangumi/:id/:embed?',
    categories: ['anime'],
    view: ViewType.Videos,
    example: '/acfun/bangumi/6000617',
    parameters: { id: '番剧 id', embed: '默认为开启内嵌视频, 任意值为关闭' },
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
例如：\`https://www.acfun.cn/bangumi/aa6000617\` 的番剧 id 是 6000617，不包括开头的 aa。
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const embed = !ctx.req.param('embed');
    const link = `https://www.acfun.cn/bangumi/aa${id}`;

    const bangumiPage = await ofetch(link);
    const bangumiData = JSON.parse(bangumiPage.match(/window.bangumiData = (.*?);\n/)[1]);
    const bangumiList = JSON.parse(bangumiPage.match(/window.bangumiList = (.*?);\n/)[1]);

    return {
        title: bangumiData.bangumiTitle,
        link,
        description: bangumiData.bangumiIntro,
        image: bangumiData.belongResource.coverImageV,
        item: bangumiList.items.map((item) => ({
            title: `${item.episodeName}${item.title ? ` - ${item.title}` : ''}`,
            description: renderDescription({ embed, aid: `ac${item.itemId}`, img: item.imgInfo.thumbnailImage.cdnUrls[0].url.split('?')[0] }),
            link: `https://www.acfun.cn/bangumi/aa${id}_36188_${item.itemId}`,
            pubDate: parseDate(item.updateTime, 'x'),
        })),
    };
}
