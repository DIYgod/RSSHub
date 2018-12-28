const axios = require('../../utils/axios');
const config = require('../../config');
const logger = require('../../utils/logger');
const sharp = require('sharp');
const imgur = require('imgur');
const fs = require('fs');

if (config.imgur && config.imgur.clientId) {
    imgur.setClientId(config.imgur.clientId);
}

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const cacheDays = 30;

    const response = await axios({
        method: 'get',
        url: `https://api.telegram.org/bot${config.telegram.token}/getStickerSet?name=${name}`,
    });

    const data = response.data.result;

    const links = await Promise.all(
        data.stickers.map(async (item) => {
            const key = `telegramstickerpack${item.file_id}`;
            const cache = await ctx.cache.get(key);
            if (cache) {
                return Promise.resolve(cache);
            } else {
                const pathResponse = await axios({
                    method: 'get',
                    url: `https://api.telegram.org/bot${config.telegram.token}/getFile?file_id=${item.file_id}`,
                });
                const path = pathResponse.data.result.file_path;

                const fileResponse = await axios({
                    method: 'get',
                    url: `https://api.telegram.org/file/bot${config.telegram.token}/${path}`,
                    responseType: 'arraybuffer',
                });

                const filePath = `tmp/${item.file_id}.png`;

                await sharp(fileResponse.data)
                    .png()
                    .toFile(filePath);

                let imgurResponse;
                try {
                    imgurResponse = await imgur.uploadFile(filePath);
                } catch (e) {
                    logger.error(`Error in imgur upload ${filePath}`, e);
                }
                const link = imgurResponse.data.link;

                fs.unlink(filePath, (e) => {
                    logger.error(`Error in remove ${filePath}`, e);
                });

                ctx.cache.set(key, link, cacheDays * 24 * 60 * 60);
                return Promise.resolve(link);
            }
        })
    );

    ctx.state.data = {
        title: `${data.title} - Telegram Sticker Pack`,
        link: `https://t.me/addstickers/${name}`,
        item: data.stickers.map((item, index) => ({
            title: item.emoji,
            description: `<img referrerpolicy="no-referrer" src="${links[index]}">`,
            guid: item.file_id,
            link: links[index],
        })),
    };
};
