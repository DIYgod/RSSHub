import { Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import cache from '@/utils/cache';

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
    const token = config.telegram.token;
    const response = await ofetch(`https://api.telegram.org/bot${token}/getStickerSet?name=${name}`);

    const list = response.result.stickers.map((item) => ({
        title: item.emoji,
        description: item.file_id,
        guid: item.file_id,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(`telegram:stickerpack:${item.guid}`, async () => {
                const response = await ofetch(`https://api.telegram.org/bot${token}/getFile?file_id=${item.guid}`);
                item.description = `<img src="https://api.telegram.org/file/bot${token}/${response.result.file_path}" />`;
                return item;
            })
        )
    );

    return {
        title: `${response.result.title} - Telegram Sticker Pack`,
        link: `https://t.me/addstickers/${name}`,
        item: items,
    };
}
