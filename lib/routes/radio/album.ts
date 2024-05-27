import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import CryptoJS from 'crypto-js';

const audio_types = {
    m3u8: 'x-mpegURL',
    mp3: 'mpeg',
    mp4: 'mp4',
    m4a: 'mp4',
};

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
    const size = ctx.req.query('limit') ?? '100';

    const rootUrl = 'https://www.radio.cn';

    const currentUrl = `${rootUrl}/pc-portal/sanji/detail.html?columnId=${id}`;
    const apiRootUrl = 'https://ytmsout.radio.cn';

    const timestamp = Date.now();
    const id_params = `id=${id}`;
    const detailApiUrl = `${apiRootUrl}/web/appAlbum/detail/${id}?${id_params}`;

    const details = await got({
        method: 'get',
        url: detailApiUrl,
        headers: {
            sign: CryptoJS.MD5(`${id_params}&timestamp=${timestamp}&key=${KEY}`).toString().toUpperCase(),
            timestamp,
            'Content-Type': 'application/json',
            equipmentId: '0000',
            platformCode: 'WEB',
        },
    });

    const params = `albumId=${id}&pageNo=0&pageSize=${size}`;
    const apiUrl = `${apiRootUrl}/web/appSingle/pageByAlbum?${params}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            sign: CryptoJS.MD5(`${params}&timestamp=${timestamp}&key=${KEY}`).toString().toUpperCase(),
            timestamp,
            'Content-Type': 'application/json',
            equipmentId: '0000',
            platformCode: 'WEB',
        },
    });

    const data = response.data.data.data;
    const items = data.map((item) => {
        let enclosure_url = item.playUrlHigh ?? item.playUrlLow;
        enclosure_url = /\.m3u8$/.test(enclosure_url) ? item.downloadUrl : enclosure_url;

        const file_ext = new URL(enclosure_url).pathname.split('.').pop();
        const enclosure_type = file_ext ? `audio/${audio_types[file_ext]}` : '';

        return {
            guid: item.id,
            title: item.name,
            link: enclosure_url,
            description: art(path.join(__dirname, 'templates/description.art'), {
                description: item.des,
                enclosure_url,
                enclosure_type,
            }),
            pubDate: parseDate(item.publishTime),
            enclosure_url,
            enclosure_type,
            enclosure_length: item.fileSize,
            itunes_duration: item.duration,
            itunes_item_image: details.data.data.image,
        };
    });

    return {
        title: `云听 - ${details.data.data.name}`,
        link: currentUrl,
        item: items,
        image: details.data.data.image,
        description: details.data.data.des ?? details.data.data.desSimple,
        itunes_author: details.data.data.ownerNickName || 'radio.cn',
    };
}
