import { Route } from '@/types';
import buildData from '@/utils/common-config';
import weiboUtils from '../utils';

export const route: Route = {
    path: '/oasis/user/:userid',
    categories: ['social-media'],
    example: '/weibo/oasis/user/1990895721',
    parameters: { userid: '用户 id, 可在用户主页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['m.weibo.cn/u/:uid', 'm.weibo.cn/profile/:uid'],
            target: '/user/:uid',
        },
    ],
    name: '绿洲用户',
    maintainers: ['kt286'],
    handler,
};

async function handler(ctx) {
    const userid = ctx.req.param('userid');
    const link = `https://oasis.weibo.cn/v1/h5/share?uid=${userid}`;
    return weiboUtils.sinaimgTvax(
        await buildData({
            link,
            url: link,
            title: `$('.name-main').text().trim() + ' - 用户 - 绿洲'`,
            description: `$('.desc').text().trim()`,
            item: {
                item: '.container .status-item',
                title: `$('.status-item-title').clone().children().remove().end().text()`,
                description: `$('.status-item-title').clone().children().remove().end().text() + '<br>' + $('.status-img').html()`,
                link: `'https://oasis.weibo.cn/v1/h5/share?sid=' + $('.status-item-title').parent().data('id')`,
            },
        })
    );
}
