// @ts-nocheck
import got from '@/utils/got';
import { config } from '@/config';

export default async (ctx) => {
    if (!config.telegram || !config.telegram.token) {
        throw new Error('Telegram Sticker Pack RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const name = ctx.req.param('name');

    const response = await got({
        method: 'get',
        url: `https://api.telegram.org/bot${config.telegram.token}/getStickerSet?name=${name}`,
    });

    const data = response.data.result;

    ctx.set('data', {
        title: `${data.title} - Telegram Sticker Pack`,
        link: `https://t.me/addstickers/${name}`,
        item: data.stickers.map((item) => ({
            title: item.emoji,
            description: item.file_id,
            guid: item.file_id,
        })),
    });
};
