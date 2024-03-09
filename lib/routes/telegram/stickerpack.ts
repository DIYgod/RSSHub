import { Route } from '@/types';
import got from '@/utils/got';
import { config } from '@/config';

export const route: Route = {
    path: '/stickerpack/:name',
    categories: ['social-media'],
    example: '/telegram/stickerpack/DIYgod',
    parameters: { name: 'Sticker Pack name, available in the sharing URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Sticker Pack',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    if (!config.telegram || !config.telegram.token) {
        throw new Error('Telegram Sticker Pack RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const name = ctx.req.param('name');

    const response = await got({
        method: 'get',
        url: `https://api.telegram.org/bot${config.telegram.token}/getStickerSet?name=${name}`,
    });

    const data = response.data.result;

    return {
        title: `${data.title} - Telegram Sticker Pack`,
        link: `https://t.me/addstickers/${name}`,
        item: data.stickers.map((item) => ({
            title: item.emoji,
            description: item.file_id,
            guid: item.file_id,
        })),
    };
}
