import { Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/stickerpack/:name',
    categories: ['social-media'],
    view: ViewType.Pictures,
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
        throw new ConfigNotFoundError('Telegram Sticker Pack RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const name = ctx.req.param('name');

    const response = await ofetch(`https://api.telegram.org/bot${config.telegram.token}/getStickerSet?name=${name}`, {
        method: 'get',
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
