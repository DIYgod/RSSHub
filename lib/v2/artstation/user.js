const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const path = require('path');
const { art } = require('@/utils/render');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const { handle } = ctx.params;

    const headers = {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        'user-agent': config.trueUA,
    };

    const csrfToken = await ctx.cache.tryGet('artstation:csrfToken', async () => {
        const tokenResponse = await got.post('https://www.artstation.com/api/v2/csrf_protection/token.json', {
            headers,
        });
        return tokenResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
    });

    const { data: userData } = await got(`https://www.artstation.com/users/${handle}/quick.json`, {
        headers: {
            ...headers,
            cookie: `PRIVATE-CSRF-TOKEN=${csrfToken}`,
        },
    });
    const { data: projects } = await got(`https://www.artstation.com/users/${handle}/projects.json`, {
        headers: {
            ...headers,
            cookie: `PRIVATE-CSRF-TOKEN=${csrfToken}`,
        },
        searchParams: {
            user_id: userData.id,
            page: 1,
        },
    });

    const resolveImageUrl = (url) => url.replace(/\/\d{14}\/small_square\//, '/large/');

    const list = projects.data.map((item) => ({
        title: item.title,
        description: art(path.join(__dirname, 'templates/description.art'), {
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

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.assetsCount > 1 || !item.icons.image) {
                    const { data } = await got(`https://www.artstation.com/projects/${item.hashId}.json`, {
                        headers: {
                            ...headers,
                            cookie: `PRIVATE-CSRF-TOKEN=${csrfToken}`,
                        },
                    });

                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        description: data.description,
                        assets: data.assets,
                    });

                    for (const a of data.assets) {
                        if (a.asset_type !== 'video' && a.asset_type !== 'image' && a.asset_type !== 'video_clip' && a.asset_type !== 'cover') {
                            throw new Error(`Unhandle asset type: ${a.asset_type}`); // model3d, marmoset, pano
                        }
                    }
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${userData.full_name} - ArtStation`,
        description: userData.headline,
        link: userData.permalink,
        logo: userData.large_avatar_url,
        icon: userData.large_avatar_url,
        image: userData.default_cover_url,
        item: items,
    };
};
