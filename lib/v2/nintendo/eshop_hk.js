const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const response = await got('https://www.nintendo.com.hk/data/json/switch_software.json');
    const data = response.data.filter(({ link }) => link.startsWith('https://')).slice(0, ctx.query.limit ? Number(ctx.query.limit) : 30);

    // 获取游戏描述
    const result = await Promise.all(
        data.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                let description;
                if (item.link.startsWith('https://store.nintendo.com.hk/')) {
                    const attributes = {
                        platform: $('.platform .product-attribute-val').text(),
                        game_category: $('.game_category .product-attribute-val').text(),
                        release_date: $('.release_date .product-attribute-val').text(),
                        publisher: $('.publisher .product-attribute-val').text(),
                        no_of_players: $('.no_of_players .product-attribute-val').text(),
                        supported_languages: $('.supported_languages .product-attribute-val').text(),
                        required_space: $('.required_space .product-attribute-val').text(),
                        supported_controllers: $('.supported_controllers .product-attribute-val').text(),
                        supported_play_modes: $('.supported_play_modes .product-attribute-val').text(),
                        disclaimer: $('.disclaimer .product-attribute-val p').text(),
                        price: $('meta[property="product:price:amount"]').attr('content'),
                        currency: $('meta[property="product:price:currency"]').attr('content'),
                    };
                    const gallery = JSON.parse(
                        $('[type=text/x-magento-init]')
                            .text()
                            .match(/{\n\s+"\[data-gallery-role=gallery-placeholder\]": {\n\s+"mage\/gallery\/gallery".*?}}}}\s+}\n\s+}\n\s+}\n/s)
                    );

                    description = art(path.join(__dirname, 'templates/eshop_hk.art'), {
                        attributes,
                        description: $('.description').html(),
                        gallery: gallery['[data-gallery-role=gallery-placeholder]']['mage/gallery/gallery'].data,
                        host: 'store.nintendo.com.hk',
                    });
                } else if (item.link.startsWith('https://ec.nintendo.com/')) {
                    const jsonData = JSON.parse(response.match(/NXSTORE\.titleDetail\.jsonData = ({.*?});/)[1]);
                    const { data: priceData } = await got('https://ec.nintendo.com/api/HK/zh/guest_prices', {
                        searchParams: {
                            ns_uids: jsonData.id,
                        },
                    });

                    description = art(path.join(__dirname, 'templates/eshop_hk.art'), {
                        host: 'ec.nintendo.com',
                        jsonData,
                        priceData: priceData[0],
                    });
                } else {
                    // not implemented
                }

                return {
                    title: item.title,
                    description,
                    link: item.link,
                    pubDate: parseDate(item.release_date, 'YYYY.M.D'),
                };
            })
        )
    );

    ctx.state.data = {
        title: 'Nintendo eShop（港服）新游戏',
        link: 'https://www.nintendo.com.hk/software/switch/',
        description: 'Nintendo eShop（港服）新上架的游戏',
        item: result,
    };
};
