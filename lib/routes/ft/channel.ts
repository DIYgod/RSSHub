import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/:language/:channel?',
    categories: ['bbs'],
    example: '/ft/chinese/hotstoryby7day',
    parameters: { language: '语言，简体`chinese`，繁体`traditional`', channel: '频道，缺省为每日更新' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'FT 中文网',
    maintainers: ['HenryQW', 'xyqfer'],
    handler,
};

async function handler(ctx) {
    ctx.set(
        'data',
        await utils.getData({
            site: ctx.req.param('language') === 'chinese' ? 'www' : 'big5',
            channel: ctx.req.param('channel'),
            ctx,
        })
    );
}
