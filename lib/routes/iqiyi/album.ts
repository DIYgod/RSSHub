import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/album/:id',
    categories: ['multimedia'],
    example: '/iqiyi/album/神武天尊-2020-1b4lufwxd7h',
    parameters: { id: '剧集 id, 可在该主页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '剧集',
    maintainers: ['TonyRL'],
    handler,
    description: `::: tip
  可抓取內容根据服务器所在地区而定
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const { data: response } = await got(`https://www.iq.com/album/${id}`);

    const $ = load(response);
    const nextData = JSON.parse($('#__NEXT_DATA__').text());
    const { album } = nextData.props.initialState;

    const {
        data: { data: baseInfo },
    } = await got(`https://pcw-api.iqiyi.com/album/album/baseinfo/${album.videoAlbumInfo.albumId}`);

    if (Object.keys(album.cacheAlbumList).length === 0) {
        throw new InvalidParameterError(`${baseInfo.name} is not available in this server region.`);
    }

    let pos = 1;
    let hasMore = false;
    let epgs = [];
    do {
        const {
            data: { data },
            // eslint-disable-next-line no-await-in-loop
        } = await got(`https://pcw-api.iq.com/api/v2/episodeListSource/${album.videoAlbumInfo.albumId}`, {
            searchParams: {
                platformId: 3,
                modeCode: 'intl',
                langCode: 'zh_cn',
                endOrder: album.videoAlbumInfo.maxOrder,
                startOrder: pos,
            },
        });
        epgs = [...epgs, ...data.epg];
        pos = data.pos;
        hasMore = data.hasMore;
    } while (hasMore);

    const items = epgs.map((item) => ({
        title: item.name,
        description: art(path.join(__dirname, 'templates/album.art'), {
            item,
        }),
        link: `https://www.iq.com/play/${item.playLocSuffix}`,
        pubDate: parseDate(item.initIssueTime),
    }));

    return {
        title: baseInfo.name,
        description: baseInfo.description,
        image: album.videoAlbumInfo.albumFocus1024,
        link: `https://www.iq.com/album/${album.videoAlbumInfo.albumLocSuffix}`,
        item: items,
        allowEmpty: true,
    };
}
