// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const url = `https://www.acfun.cn/bangumi/aa${id}`;

    const bangumiPage = await got(url, {
        headers: {
            Referer: 'https://www.acfun.cn',
        },
    });
    const bangumiData = JSON.parse(bangumiPage.data.match(/window.bangumiData = (.*?);\n/)[1]);
    const bangumiList = JSON.parse(bangumiPage.data.match(/window.bangumiList = (.*?);\n/)[1]);

    ctx.set('data', {
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
    });
};
