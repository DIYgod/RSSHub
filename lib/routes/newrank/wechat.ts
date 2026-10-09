import { load } from 'cheerio';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import got from '@/utils/got';
import { finishArticleItem, WeChatMpError } from '@/utils/wechat-mp';

import utils from './utils';

const hasArticleUrl = (item) => {
    try {
        return ['http:', 'https:'].includes(new URL(item.url).protocol);
    } catch {
        return false;
    }
};

const completeArticle = (item) => (new URL(item.link).hostname === 'mp.weixin.qq.com' ? finishArticleItem(item) : item);

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
        .find((item) => (item.attribs.src || '').startsWith('/new/static/js/main.'))!.attribs.src;
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

    const accessibleArticles = newArticles.filter((item) => hasArticleUrl(item));
    if (newArticles.length && !accessibleArticles.length) {
        throw new Error('Newrank returned articles without usable URLs. Check NEWRANK_COOKIE and whether the account can access article links.');
    }
    let items = accessibleArticles.map((item) => ({
        id: item.id,
        title: item.title,
        description: '',
        link: item.url,
        pubDate: item.publicTime,
    }));

    const results = await Promise.allSettled(items.map((item) => completeArticle(item)));
    items = results.flatMap((result) => {
        if (result.status === 'fulfilled') {
            return [result.value];
        }
        if (result.reason instanceof WeChatMpError && result.reason.message.startsWith('wechat-mp: deleted by author:')) {
            return [];
        }
        throw result.reason;
    });

    return {
        title: name + ' - 微信公众号',
        link: `https://www.newrank.cn/new/readDetial?account=${uid}`,
        item: items,
    };
}
