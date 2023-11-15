const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { join } = require('path');
const { art } = require('@/utils/render');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const { handle } = ctx.params;

    const csrfToken = await ctx.cache.tryGet('artstation:csrfToken', async () => {
        const tokenResponse = await got.post('https://www.artstation.com/api/v2/csrf_protection/token.json');
        return tokenResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
    });

    const { data: userData } = await got(`https://www.artstation.com/users/${handle}/quick.json`, {
        headers: {
            cookie: `PRIVATE-CSRF-TOKEN=${csrfToken}`,
            // accept: 'application/json, text/plain, */*',
            'user-agent': config.trueUA,
        },
    });
    const { data: projects } = await got(`https://www.artstation.com/users/${handle}/projects.json`, {
        headers: {
            cookie: `PRIVATE-CSRF-TOKEN=${csrfToken}`,
            // accept: 'application/json, text/plain, */*',
            'user-agent': config.trueUA,
        },
        searchParams: {
            user_id: userData.id,
            page: 1,
        },
    });

    const resolveImageUrl = (url) =>
        // converts https://cdnb.artstation.com/p/assets/images/images/068/573/381/20231024090646/small_square/wlop-1se.jpg?1698156406
        // to https://cdnb.artstation.com/p/assets/images/images/068/573/381/large/wlop-1se.jpg?1698156406
        url.replace(/\/\d{14}\/small_square\//, '/large/');

    const list = projects.data.map((item) => ({
        title: item.title,
        description: art(join(__dirname, 'templates/description.art'), {
            description: item.description,
            image: {
                src: resolveImageUrl(item.cover.small_square_url),
                title: item.title,
            },
        }),
        pubDate: parseDate(item.published_at),
        updated: parseDate(item.updated_at),
        link: item.permalink,
        author: userData.full_name,
        assetsCount: item.assets_count,
        hashId: item.hash_id,
        icons: item.icons,
    }));

    // const items = await Promise.all(
    //     list.map((item) =>
    //         ctx.cache.tryGet(item.link, async () => {
    //             //
    //             if (item.assetsCount > 1 || !item.icons.image) {
    //                 const { data } = await got(`https://www.artstation.com/projects/${item.hashId}.json`);
    //                 item.description = data.description;
    //             }

    //             return item;
    //         })
    //     )
    // );

    ctx.state.data = {
        title: `${userData.full_name} - ArtStation`,
        description: userData.headline,
        link: userData.permalink,
        logo: userData.large_avatar_url,
        icon: userData.large_avatar_url,
        image: userData.default_cover_url,
        // item: items,
        item: list,
    };
};
