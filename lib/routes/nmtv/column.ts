import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/column/:id?',
    categories: ['traditional-media'],
    example: '/nmtv/column/877',
    parameters: { id: '栏目 id，可在对应栏目 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '点播',
    maintainers: ['nczitzk'],
    handler,
    description: `:::tip
  如 [蒙古语卫视新闻联播](http://www.nmtv.cn/folder292/folder663/folder301/folder830/folder877) 的 URL 为 \`http://www.nmtv.cn/folder292/folder663/folder301/folder830/folder877\`，其栏目 id 为末尾数字编号，即 \`877\`。可以得到其对应路由为 [\`/nmtv/column/877\`](https://rsshub.app/nmtv/column/877)
  :::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '877';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100;

    const hostUrl = 'https://vod.m2oplus.nmtv.cn';
    const apiRootUrl = 'https://mapi.m2oplus.nmtv.cn';
    const apiUrl = `${apiRootUrl}/api/v1/contents.php?offset=0&count=${limit}&column_id=${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const data = response.data;

    const items = data.map((item) => {
        const enclosure_url = `${hostUrl}/${item.target_path}${item.target_filename}`;
        const enclosure_type = `${item.type}/${enclosure_url.match(/\.(\w+)$/)[1]}`;

        return {
            title: item.title,
            link: item.content_url,
            author: item.column_name,
            pubDate: timezone(parseDate(item.publish_time), +8),
            description: art(path.join(__dirname, 'templates/description.art'), {
                type: item.type,
                image: item.index_pic,
                file: enclosure_url,
            }),
            enclosure_url,
            enclosure_type,
            itunes_duration: item.video.duration,
            itunes_item_image: item.index_pic,
        };
    });

    const author = data[0].column_name;
    const imageUrl = data[0].column_info.indexpic;

    return {
        title: `内蒙古广播电视台 - ${author}`,
        link: items[0].link.split(/\/\d{4}-\d{2}-\d{2}\//)[0],
        item: items,
        image: `${imageUrl.host}${imageUrl.filepath}${imageUrl.filename}`,
        itunes_author: author,
    };
}
