const got = require('@/utils/got');
const cheerio = require('cheerio');
module.exports = async (ctx) => {
    const { category, subcategory, staffpicks } = ctx.params;

    const categoryparams = `&filter_category=${category}`;
    let subcategoryparams = `&filter_subcategory=${subcategory}`;
    let sortparams = `&direction=desc&sort=latest`;
    let feedtitle = category;
    if (staffpicks && staffpicks !== `staffpicks`) {
        return;
    }

    if (staffpicks) {
        sortparams = `&direction=desc&sort=latest&filter_staffpicked=1`;
        feedtitle += `: ${subcategory} staffpicks`;
    }
    if (!staffpicks && subcategory === `staffpicks`) {
        subcategoryparams = '';
        sortparams = `&direction=desc&sort=latest&filter_staffpicked=1`;
        feedtitle += ` staffpicks`;
    }
    if (!staffpicks && subcategory !== `staffpicks`) {
        subcategoryparams = `&filter_subcategory=${subcategory}`;
        feedtitle += `: ${subcategory}`;
    }
    if (!subcategory) {
        subcategoryparams = '';
        feedtitle = `${category}`;
    }

    const url = `https://api.vimeo.com/search?${categoryparams}${subcategoryparams}&container_fields=effects&page=1&per_page=18&fields=search_web&filter_type=clip${sortparams}`;
    const tokenresponse = await got({
        method: 'get',
        url: `https://vimeo.com/_rv/viewer`,
    });
    const VimeoAuthorization = tokenresponse.data.jwt;

    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Authorization: `jwt ${VimeoAuthorization}`,
        },
    });

    const vimeojs = response.data.data;
    const categoryinfo = response.data.effects.bullocks[0];

    const feedlink = `https://vimeo.com${categoryinfo.link.indexOf('/videos') !== -1 ? categoryinfo.link : `${categoryinfo.link}/videos`}/sort:latest`;
    const feedlinkstaffpicks = `?staffpicked=ture`;

    const description = await Promise.all(
        vimeojs.map(async (item) => {
            const link = item.clip.uri.replace('/videos', '');
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response2 = await got({
                method: 'get',
                url: `https://vimeo.com${link}/description?breeze=1`,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X)  ',
                },
            });
            const articledata = response2.data;
            const $2 = cheerio.load(articledata);
            $2('span').remove();
            const description = $2.html();

            ctx.cache.set(link, JSON.stringify(description));
            return Promise.resolve(description);
        })
    );
    ctx.state.data = {
        title: `${feedtitle} | Vimeo category`,
        link: `${feedlink}${staffpicks ? feedlinkstaffpicks : ''}`,
        description: `${categoryinfo.text}`,
        item: vimeojs.map((item, index) => ({
            title: `${item.clip.name}`,
            description: `<iframe width="640" height="360" src='https://player.vimeo.com${item.clip.uri.replace(`videos`, 'video')}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>${
                description[index] ? description[index] : ''
            }`,
            pubDate: `${item.clip.created_time}`,
            link: `${item.clip.link}`,
            author: `${item.clip.user.name}`,
        })),
    };
};
