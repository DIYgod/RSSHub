import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
const host = 'https://weixin.sogou.com';
import { finishArticleItem } from '@/utils/wechat-mp';
export const route: Route = {
    path: '/sogou/:id',
    categories: ['new-media'],
    example: '/wechat/sogou/qimao0908',
    parameters: { id: '公众号 id, 打开 weixin.sogou.com 并搜索相应公众号， 在 URL 中找到 id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '公众号（搜狗来源）',
    maintainers: ['EthanWng97'],
    handler,
};

async function handler(ctx) {
    const wechatId = ctx.req.param('id');
    let url = `${host}/weixin`;
    let response = await got({
        method: 'get',
        url,
        searchParams: {
            query: wechatId,
        },
    });

    let $ = load(response.data);
    const href = $('a[uigs="account_article_0"]').attr('href');
    const title = $('a[uigs="account_name_0"]').text();
    url = `${host}${href}`;
    response = await got({
        url,
        method: 'get',
        headers: {
            Cookie: 'SNUID=78725B470A0EF2C3F97AA5EB0BBF95C1; ABTEST=0|1680917938|v1; SUID=8F7B1C682B83A20A000000006430C5B2; PHPSESSID=le2lak0vghad5c98ijd3t51ls4; IPLOC=USUS5',
        },
    });
    $ = load(response.data);
    const jsCode = $('script').text();
    const regex = /url \+= '([^']+)';/g;
    const matches = [];
    let match;

    while ((match = regex.exec(jsCode)) !== null) {
        matches.push(match[1]);
    }

    let link = '';
    if (matches.length > 0) {
        link = matches
            .join('')
            .replaceAll(/(\r\n|\n|\r)/gm, '') // remove newlines
            .replaceAll(' ', ''); // remove spaces
        url = url.replace('@', '');
    }
    const item = {
        link,
        guid: link,
    };

    await finishArticleItem(item);

    return {
        title: `${title} 的微信公众号`,
        link: url,
        description: `${title} 的微信公众号`,
        item: [item],
    };
}
