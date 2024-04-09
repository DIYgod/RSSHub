import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/douyin/:dyid',
    categories: ['social-media'],
    example: '/newrank/douyin/110266463747',
    parameters: { dyid: '抖音ID，可在新榜账号详情 URL 中找到' },
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
    name: '抖音短视频',
    maintainers: ['lessmoe'],
    handler,
    description: `:::warning
免费版账户抖音每天查询次数 20 次，如需增加次数可购买新榜会员或等待未来多账户支持
:::`,
};

async function handler(ctx) {
    if (!config.newrank || !config.newrank.cookie) {
        throw new ConfigNotFoundError('newrank RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const uid = ctx.req.param('dyid');
    const nonce = utils.random_nonce(9);
    const url_detail = 'https://xd.newrank.cn/xdnphb/nr/cloud/douyin/detail/aweme?xyz=' + utils.decrypt_douyin_detail_xyz(nonce) + '&nonce=' + nonce;
    const cookie = config.newrank.cookie;
    const response_detail = await got({
        method: 'post',
        url: url_detail,
        headers: {
            Connection: 'keep-alive',
            Cookie: cookie,
            'Content-Type': 'application/json',
        },
        data: JSON.stringify({
            create_time_end: '',
            create_time_start: '',
            date_type: '',
            is_promotion: '0',
            is_seed: '0',
            keyword: '',
            size: 20,
            sort: 'create_time',
            start: 1,
            uid,
        }),
    });
    const url_account = 'https://xd.newrank.cn/xdnphb/nr/cloud/douyin/detail/accountInfoAll?nonce=' + nonce + '&xyz=' + utils.decrypt_douyin_account_xyz(nonce);
    const response_account = await got({
        method: 'post',
        url: url_account,
        headers: {
            Connection: 'keep-alive',
            Cookie: cookie,
            'Content-Type': 'application/json',
        },
        data: JSON.stringify({
            uid,
        }),
    });
    const name = response_account.data.data.nickname;
    const description = response_account.data.data.signature;
    const articles = utils.flatten(response_detail.data.data.list);
    const items = articles.map((item) => ({
        title: item.aweme_desc,
        description: '',
        link: item.share_url,
        pubDate: item.create_time,
    }));

    return {
        title: name + ' - 抖音',
        description,
        link: 'https://xd.newrank.cn/data/d/account/workList/' + uid,
        item: items,
    };
}
