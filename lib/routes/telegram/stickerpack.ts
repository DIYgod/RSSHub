import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/stickerpack/:name',
    categories: ['social-media'],
    view: ViewType.Pictures,
    example: '/telegram/stickerpack/DIYgod',
    parameters: { name: 'Sticker Pack name, available in the sharing URL' },
    features: {
        requireConfig: [
            {
                name: 'TELEGRAM_TOKEN',
                optional: false,
                description: 'Telegram Bot API token',
            },
        ],
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
    let response;
    try {
        response = await ofetch(`https://api.telegram.org/bot${token}/getStickerSet`, { query: { name }, ignoreResponseError: true });
    } catch (error) {
        // ofetch quotes the request URL, token included, in its error message, which ends up on the error page
        throw new Error(String(error instanceof Error ? error.message : error).replaceAll(token, '<TELEGRAM_TOKEN>'), { cause: error });
    }
    if (!response.ok) {
        throw new Error(`Telegram Bot API getStickerSet failed: ${response.description}`);
    }

    return {
        title: `${response.result.title} - Telegram Sticker Pack`,
        link: `https://t.me/addstickers/${name}`,
        // Bot API file URLs (https://api.telegram.org/file/bot<token>/<file_path>) contain the bot token
        // and must never be written into the feed, so there is no image preview.
        item: response.result.stickers.map((item) => ({
            title: item.emoji,
            description: item.file_id,
            guid: item.file_id,
        })),
    };
}
