import { Route } from '@/types';
import { load } from 'cheerio';
import got from '@/utils/got';

import { decodeCipherText, composeMagnetUrl, getUrlType, ensureDomain } from './utils';

// 兼容没有 script 标签的情况，直接解析 dom
function getDomList($, detailUrl) {
    const list = $('.down-list li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').attr('title');
            const downurl = item.find('a').attr('href');
            const urlType = getUrlType(downurl);
            const enclosureUrl = urlType === 'magnet' ? composeMagnetUrl(downurl) : downurl;
            return {
                enclosure_url: enclosureUrl,
                enclosure_length: '',
                enclosure_type: 'application/x-bittorrent',
                title,
                link: detailUrl,
                guid: `${title}-${urlType}`,
            };
        });
    return list;
}

export function getItemList($, detailUrl, second) {
    const encoded = $('.article script[type]')
        .text()
        .match(/return p}\('(.*)',(\d+),(\d+),'(.*)'.split\(/);
    // 若 script 标签没有内容，直接解析 dom
    if (!encoded) {
        return getDomList($, detailUrl);
    }
    const data = JSON.parse(
        decodeCipherText(encoded[1], encoded[2], encoded[3], encoded[4].split('|'), 0, {})
            .match(/var down_urls=\\'(.*)\\'/)[1]
            .replaceAll(String.raw`\\"`, '"')
            .replaceAll(/\\{3}/g, '')
    );
    // support secondary download address
    const { downurls } = second && data.Data.length > 1 ? data.Data[1] : data.Data[0];

    return downurls.map((item) => {
        const [title, downurl] = item.split('$');
        const urlType = getUrlType(downurl);
        // only magnet need compose trackers
        const enclosureUrl = urlType === 'magnet' ? composeMagnetUrl(downurl) : downurl;
        return {
            enclosure_url: enclosureUrl,
            enclosure_length: '',
            enclosure_type: 'application/x-bittorrent',
            title,
            link: detailUrl,
            guid: `${title}-${urlType}`,
        };
    });
}

function getMetaInfo($) {
    const title = $('.article-header .text p').first().find('span').text();
    const cover = $('.article-header .pic img').attr('src');
    const description = $('.article-related.info p').text();
    return {
        title,
        cover,
        description,
    };
}

export const route: Route = {
    path: '/detail/:id',
    categories: ['multimedia'],
    example: '/domp4/detail/LBTANI22222I',
    parameters: { id: '从剧集详情页 URL 处获取，如：`https://www.mp4kan.com/html/LBTANI22222I.html`，取 `.html` 前面部分' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['domp4.cc/detail/:id'],
        },
    ],
    name: '剧集订阅',
    maintainers: ['savokiss'],
    handler,
    description: `:::tip
由于大部分详情页是 \`/html/xxx.html\`，还有部分是 \`/detail/123.html\`，所以此处做了兼容，id 取 \`xxx\` 或者 \`123\` 都可以。

新增 \`second\` 参数，用于选择下载地址二（地址二不可用或者不填都默认地址一），用法: \`/domp4/detail/LBTANI22222I?second=1\`。
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const { domain, second } = ctx.req.query();
    let pureId = id;
    let detailType = 'html';
    // compatible for .html suffix in radar
    if (id.endsWith('.html')) {
        pureId = id.replace('.html', '');
    }
    // compatible for /detail/123.html && /html/xxx.html
    if (/^\d+$/.test(pureId)) {
        detailType = 'detail';
    }
    const detailUrl = `${ensureDomain(ctx, domain)}/${detailType}/${pureId}.html`;

    const res = await got(detailUrl);
    const $ = load(res.data);
    const list = getItemList($, detailUrl, second);
    const meta = getMetaInfo($);

    return {
        link: detailUrl,
        title: meta.title || 'domp4电影 - 详情',
        image: meta.cover,
        description: meta.description,
        item: list,
    };
}
