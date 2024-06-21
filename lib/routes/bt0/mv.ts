import { Route } from '@/types';
import { load } from 'cheerio';
import puppeteer from '@/utils/puppeteer';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/mv/:number/:domain?',
    categories: ['multimedia'],
    example: '/mv/35575567/2',
    parameters: { domain: '1-9,默认 2', number: '影视详情id' },
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
            source: ['2bt0.com/mv/'],
        },
    ],
    name: '影视资源下载列表',
    maintainers: ['miemieYaho'],
    handler,
    description: `:::tip
  (1-9)bt0.com 都能访问, 就拿 2bt0.com 为默认了
  影视详情id 是\`https://www.2bt0.com/mv/{id}.html\`其中的 id 的值
  可选参数\`domain\` 是 \`https://www.{domain}bt0.com\` 其中的 domain 的值,可以是 1-9,访问的都是同一个东西
  :::`,
};

async function handler(ctx) {
    const domain = ctx.req.param('domain') ?? '2';
    const number = ctx.req.param('number');
    if (!/^[1-9]$/.test(domain)) {
        throw new InvalidParameterError('Invalid domain');
    }
    const regex = /^\d{6,}$/;
    if (!regex.test(number)) {
        throw new InvalidParameterError('Invalid number');
    }

    const host = `https://www.${domain}bt0.com`;
    const _link = host + `/mv/${number}.html`;

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    await page.goto(_link, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    page.close();
    const $ = load(response);
    const name = $('span.info-title.lh32').text();
    const items = $('div.container .container .col-md-10.tex_l')
        .toArray()
        .map((item) => {
            item = $(item);
            const torrent_info = item.find('.torrent-title').first();
            const _title = torrent_info.text();
            const len = item.find('.tag-sm.tag-size.text-center').first().text();
            return {
                title: _title,
                guid: _title,
                description: `${_title}[${len}]`,
                link: host + torrent_info.attr('href'),
                pubDate: item.find('.tag-sm.tag-download.text-center').eq(1).text(),
                enclosure_type: 'application/x-bittorrent',
                enclosure_url: item.find('.col-md-3 a').first().attr('href'),
                enclosure_length: convertToBytes(len),
            };
        });
    browser.close();
    return {
        title: name,
        link: _link,
        item: items,
    };
}

function convertToBytes(sizeStr) {
    // 正则表达式，用于匹配数字和单位 GB 或 MB
    const regex = /^(\d+(\.\d+)?)\s*(gb|mb)$/i;
    const match = sizeStr.match(regex);

    if (!match) {
        throw new Error('Invalid size format');
    }

    const value = Number.parseFloat(match[1]);
    const unit = match[3].toUpperCase();

    let bytes;
    switch (unit) {
        case 'GB':
            bytes = Math.floor(value * 1024 * 1024 * 1024);
            break;
        case 'MB':
            bytes = Math.floor(value * 1024 * 1024);
            break;
        default:
            bytes = 0;
    }
    return bytes;
}
