import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import CryptoJS from 'crypto-js';

export const route: Route = {
    path: '/album/:id',
    categories: ['multimedia'],
    example: '/radio/album/15682090498666',
    parameters: { id: '专辑 id，可在对应专辑页面的 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    name: '专辑',
    maintainers: ['nczitzk'],
    handler,
    description: `如果订阅 [中国相声榜](https://www.radio.cn/pc-portal/sanji/detail.html?columnId=15682090498666)，其 URL 为 \`https://www.radio.cn/pc-portal/sanji/detail.html?columnId=15682090498666\`，可以得到 \`columnId\` 为 \`15682090498666\`

  所以对应路由为 [\`/radio/album/15682090498666\`](https://rsshub.app/radio/album/15682090498666)

  :::tip
  部分专辑不适用该路由，此时可以尝试 [节目](#yun-ting-jie-mu) 路由
  :::`,
};

async function handler(ctx) {
    const KEY = 'f0fc4c668392f9f9a447e48584c214ee';

    const id = ctx.req.param('id');
    const size = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100;

    const rootUrl = 'https://www.radio.cn';
    const apiRootUrl = 'https://ytmsout.radio.cn';
    const detailRootUrl = 'https://ytapi.radio.cn';

    const iconUrl = `${rootUrl}/pc-portal/image/icon_32.jpg`;
    const currentUrl = `${rootUrl}/pc-portal/sanji/detail.html?columnId=${id}`;
    const detailUrl = `${detailRootUrl}/ytsrv/srv/wifimusicbox/demand/detail`;

    const detailResponse = await got({
        method: 'post',
        url: detailUrl,
        form: {
            pageIndex: '0',
            sortType: '2',
            mobileId: '',
            providerCode: '25010',
            pid: id,
            paySongFlag: '1',
            richText: '1',
            h5flag: '1',
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            version: '4.0.0',
            providerCode: '25010',
            equipmentSource: 'WEB',
        },
    });

    const data = detailResponse.data;

    const count = data.count;

    let pageNo = 1,
        pageSize = count - size;

    if (pageSize <= 0) {
        pageNo = 0;
        pageSize = count;
    }

    const params = `albumId=${id}&pageNo=${pageNo}&pageSize=${pageSize}`;
    const apiUrl = `${apiRootUrl}/web/appSingle/pageByAlbum?${params}`;

    const timestamp = Date.now();
    const sign = CryptoJS.MD5(`${params}&timestamp=${timestamp}&key=${KEY}`).toString().toUpperCase();

    const response = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            sign,
            timestamp,
            'Content-Type': 'application/json',
            equipmentId: '0000',
            platformCode: 'WEB',
        },
    });

    const items = response.data.data.data.map((item) => {
        let enclosure_url = item.playUrlHigh ?? item.playUrlLow;
        enclosure_url = /\.m3u8$/.test(enclosure_url) ? item.downloadUrl : enclosure_url;

        const enclosure_type = `audio/${enclosure_url.match(/\.(\w+)$/)[1]}`;

        return {
            guid: item.id,
            title: item.name,
            link: enclosure_url,
            description: art(path.join(__dirname, 'templates/description.art'), {
                description: item.des,
                enclosure_url,
                enclosure_type,
            }),
            author: data.anchorpersons,
            pubDate: parseDate(item.publishTime),
            enclosure_url,
            enclosure_type,
            enclosure_length: item.fileSize,
            itunes_duration: item.duration,
            itunes_item_image: iconUrl,
        };
    });

    return {
        title: `云听 - ${data.columnName}`,
        link: currentUrl,
        item: items,
        image: iconUrl,
        itunes_author: data.anchorpersons,
        description: data.descriptions ?? data.descriptionSimple,
        itunes_category: data.atypeInfo.map((c) => c.categoryName).join(','),
    };
}
