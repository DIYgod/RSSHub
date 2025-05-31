import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id',
    categories: ['multimedia'],
    view: ViewType.Audios,
    example: '/ajmide/10603594',
    parameters: { id: '播客 id，可以从播客页面 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '播客',
    maintainers: ['Fatpandac'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.param('limit') ?? 25;
    const playListAPI = `https://a.ajmide.com/v3/getBrandContentList.php?brandId=${id}&c=${limit}&i=0`;
    const response = await got.get(playListAPI);
    const data = response.data.data.filter((item) => !item.contentType);

    const items = data.map((item) => ({
        title: item.subject,
        author: item.author_info.nick,
        link: item.shareInfo.link,
        pubDate: parseDate(item.postTime, 'YYYY-MM-DD HH:mm:ss'),
        itunes_item_image: item.brandImgPath,
        enclosure_url: item.audioAttach[0].liveUrl,
        itunes_duration: item.audioAttach[0].audioTime,
        enclosure_type: 'audio/x-m4a',
    }));

    return {
        title: data[0].brandName,
        link: `https://m.ajmide.com/m/brand?id=${id}`,
        itunes_author: data[0].author_info.nick,
        image: data[0].brandImgPath,
        item: items,
    };
}
