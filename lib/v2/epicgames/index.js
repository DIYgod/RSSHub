const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const locale = ctx.params.locale ?? 'en-US';
    const country = ctx.params.country ?? 'US';

    const rootUrl = 'https://store.epicgames.com';
    const currentUrl = `${rootUrl}/${locale}/free-games?lang=${locale}`;
    const apiUrl = `https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=${locale}&country=${country}&allowCountries=${country}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const now = dayjs();
    const items = response.data.data.Catalog.searchStore.elements
        .filter(
            (item) =>
                item.promotions &&
                item.promotions.promotionalOffers &&
                item.promotions.promotionalOffers[0] &&
                dayjs(item.promotions.promotionalOffers[0].promotionalOffers[0].startDate) <= now &&
                dayjs(item.promotions.promotionalOffers[0].promotionalOffers[0].endDate) > now
        )
        .map((item) => ({
            title: item.title,
            author: item.seller.name,
            link: `${rootUrl}/${locale}/p/${item.catalogNs.mappings.length > 0 ? item.catalogNs.mappings[0].pageSlug : item.offerMappings.length > 0 ? item.offerMappings[0].pageSlug : item.urlSlug}`,
            description: art(path.join(__dirname, 'templates/description.art'), {
                description: item.description,
                image: item.keyImages[0].url,
            }),
            pubDate: parseDate(item.promotions.promotionalOffers[0].promotionalOffers[0].startDate),
        }));

    ctx.state.data = {
        title: 'Epic Games Store - Free Games',
        link: currentUrl,
        item: items,
    };
};
