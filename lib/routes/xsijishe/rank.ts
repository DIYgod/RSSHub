import InvalidParameterError from '@/errors/types/invalid-parameter';
import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';
import { puppeteerGet } from './utils';
import puppeteer from '@/utils/puppeteer';

const baseUrl = 'https://xsijishe.com';

export const route: Route = {
    path: '/rank/:type',
    categories: ['bbs', 'popular'],
    example: '/xsijishe/rank/weekly',
    parameters: {
        type: {
            description: '排行榜类型',
            options: [
                { value: 'weekly', label: '周榜' },
                { value: 'monthly', label: '月榜' },
            ],
        },
    },
    features: {
        requireConfig: [
            {
                name: 'XSIJISHE_COOKIE',
                description: '',
            },
            {
                name: 'XSIJISHE_USER_AGENT',
                description: '',
            },
        ],
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '排行榜',
    maintainers: ['akynazh', 'AiraNadih'],
    handler,
};

async function handler(ctx) {
    const rankType = ctx.req.param('type');
    let title;
    let index; // 用于选择第几个 li

    if (rankType === 'weekly') {
        title = '司机社综合周排行榜';
        index = 0; // 第一个 li 是周榜
    } else if (rankType === 'monthly') {
        title = '司机社综合月排行榜';
        index = 1; // 第二个 li 是月榜
    } else {
        throw new InvalidParameterError('Invalid rank type');
    }

    const browser = await puppeteer();
    let usePuppeteer = false;

    const url = `${baseUrl}/portal.php`;
    const headers = {
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        Cookie: config.xsijishe.cookie,
        'User-Agent': config.xsijishe.userAgent,
    };

    const resp = await got(url, {
        headers,
    });

    const redirectMatch = resp.data.match(/window\.location\.href\s*=\s*"([^"]+)"/);
    if (redirectMatch) {
        const redirectUrl = `${baseUrl}${redirectMatch[1]}`;
        // 使用提取到的地址重新请求
        const realResp = await got(redirectUrl, {
            headers,
        });
        resp.data = realResp.data;
    }

    const $ = load(resp.data);
    // 根据 index 选择对应的 li，然后获取其中的 dd 元素
    let items = $('.nex_recon_lists ul li')
        .eq(index)
        .find('.nex_recons_demens dl dd')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('h5').text().trim();
            const link = item.find('a').attr('href');
            const description = item.find('img').prop('outerHTML');
            return {
                title,
                link: `${baseUrl}/${link}`,
                description,
            };
        });

    if (items.length > 0) {
        const firstItem = items[0];
        const resp = await got(firstItem.link, {
            headers,
        });
        const $ = load(resp.data);
        const firstViewBox = $('.t_f').first();
        if (firstViewBox.length === 0) {
            usePuppeteer = true;
        }
    }

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                let data;
                if (usePuppeteer) {
                    data = await puppeteerGet(item.link, browser);
                } else {
                    const resp = await got(item.link, {
                        headers,
                    });
                    data = resp.data;
                }
                const $ = load(data);
                const firstViewBox = $('.t_f').first();

                if (firstViewBox.length === 1) {
                    firstViewBox.find('img').each((_, img) => {
                        img = $(img);
                        if (img.attr('zoomfile')) {
                            img.attr('src', img.attr('zoomfile'));
                            img.removeAttr('zoomfile');
                            img.removeAttr('file');
                        }
                        img.removeAttr('onmouseover');
                    });

                    item.description = firstViewBox.html();
                }

                return item;
            })
        )
    );

    await browser.close();

    return {
        title,
        link: url,
        description: title,
        item: items,
    };
}
