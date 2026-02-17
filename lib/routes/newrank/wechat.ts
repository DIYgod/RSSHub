import { load } from 'cheerio';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import got from '@/utils/got';
import { finishArticleItem } from '@/utils/wechat-mp';

import utils from './utils';

export const route: Route = {
    path: '/wechat/:wxid',
    categories: ['social-media'],
    example: '/newrank/wechat/chijiread',
    parameters: { wxid: '微信号，若微信号与新榜信息不一致，以新榜为准' },
    features: {
        requireConfig: [
            {
                name: 'NEWRANK_COOKIE',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '微信公众号',
    maintainers: ['lessmoe', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    if (!config.newrank || !config.newrank.cookie) {
        throw new ConfigNotFoundError('newrank RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const uid = ctx.req.param('wxid');
    const nonce = utils.random_nonce(9);
    const { data: summaryHTML } = await got({
        method: 'get',
        url: `https://www.newrank.cn/new/readDetial?account=${uid}`,
        headers: {
            Connection: 'keep-alive',
            Cookie: config.newrank.cookie,
        },
    });
    const summary$ = load(summaryHTML);
    const mainsrc = summary$('script')
        .toArray()
        .find((item) => (item.attribs.src || '').startsWith('/new/static/js/main.')).attribs.src;
    const { data: mainScript } = await got({
        method: 'get',
        url: `https://www.newrank.cn${mainsrc}`,
    });
    const N_TOKEN_match = mainScript.match(/"N-Token":"([^"]+)/);
    if (!N_TOKEN_match) {
        throw new Error('Cannot find n-token');
    }
    const N_TOKEN = N_TOKEN_match[1];
    const response = await got({
        method: 'post',
        url: 'https://gw.newrank.cn/api/wechat/xdnphb/detail/v1/rank/article/lists',
        headers: {
            Connection: 'keep-alive',
            Cookie: config.newrank.cookie,
            'n-token': N_TOKEN,
        },
        form: {
            account: uid,
            nonce,
            xyz: utils.decrypt_wechat_detail_xyz(uid, nonce),
        },
    });

    const name = response.data.value.user.name;
    const realTimeArticles = utils.flatten(response.data.value.realTimeArticles);
    const articles = utils.flatten(response.data.value.articles);
    const newArticles = [...realTimeArticles, ...articles];

    const items = newArticles.map((item) => ({
        id: item.id,
        title: item.title,
        description: '',
        link: item.url,
        pubDate: item.publicTime,
    }));

    // TODO: link is empty
    await Promise.all(items.map((item) => finishArticleItem(item)));

    return {
        title: name + ' - 微信公众号',
        link: `https://www.newrank.cn/new/readDetial?account=${uid}`,
        item: items,
    };
}
