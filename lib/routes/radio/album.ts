import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import timezone from '@/utils/timezone';

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

::: tip
  部分专辑不适用该路由，此时可以尝试 [节目](#yun-ting-jie-mu) 路由
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://ytweb.radio.cn';
    const currentUrl = `${rootUrl}/share/albumDetail?columnId=${id}`;
    const apiRootUrl = 'https://ytapi.radio.cn';

    const response = await ofetch(`${apiRootUrl}/ytsrv/srv/wifimusicbox/demand/detail`, {
        method: 'POST',
        headers: {
            accept: 'application/json, text/plain, */*',
            'content-type': 'application/x-www-form-urlencoded',
            equipmentSource: 'WEB', // only this header is mandatory
            equipmentType: '3',
            platformCode: 'H5',
            productId: '1605403829833195520',
            providerCode: '25010',
            referer: 'https://ytweb.radio.cn/',
            timestamp: String(Date.now()),
            version: '4.0.0',
        },
        body: new URLSearchParams({
            pageIndex: '0',
            sortType: '',
            mobileId: '',
            providerCode: '25010',
            pid: id,
            paySongFlag: '1',
            richText: '1',
            h5flag: '1',
        }),
        parseResponse: JSON.parse,
    });

    const items = response.con.map((item) => {
        let enclosure_url = item.playUrlHigh ?? item.playUrlMedium ?? item.playUrlLow ?? item.playUrl;
        enclosure_url = /\.m3u8$/.test(enclosure_url) ? item.downloadUrl : enclosure_url;

        const fileExt = new URL(enclosure_url).pathname.split('.').pop();
        const enclosure_type = fileExt ? `audio/${audio_types[fileExt]}` : '';

        return {
            guid: item.id,
            title: item.name,
            link: `${rootUrl}/share/albumPlay?correlateId=${item.id}&columnId=${id}`,
            description: art(path.join(__dirname, 'templates/description.art'), {
                enclosure_url,
                enclosure_type,
            }),
            pubDate: timezone(parseDate(item.createTime), +8),
            enclosure_url,
            enclosure_type,
            enclosure_length: item.fileSize,
            itunes_duration: item.duration,
            itunes_item_image: item.logoUrl,
        };
    });

    return {
        title: `云听 - ${response.columnName}`,
        link: currentUrl,
        item: items,
        image: response.posterInfo.imgUrl,
        logo: response.logoUrl,
        description: response.descriptions ?? response.descriptionSimple,
        itunes_author: response.ownerNickName || 'radio.cn',
    };
}
