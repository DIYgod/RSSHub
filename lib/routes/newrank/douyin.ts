// @ts-nocheck
import got from '@/utils/got';
const utils = require('./utils');
import { config } from '@/config';

export default async (ctx) => {
    if (!config.newrank || !config.newrank.cookie) {
        throw new Error('newrank RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
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

    ctx.set('data', {
        title: name + ' - 抖音',
        description,
        link: 'https://xd.newrank.cn/data/d/account/workList/' + uid,
        item: items,
    });
};
