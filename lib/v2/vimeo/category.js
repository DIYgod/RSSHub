const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { category, staffpicks } = ctx.params;

    const categoryparams = category;
    let sortparams = '&direction=desc&sort=date';
    let feedtitle = category;
    if (staffpicks && staffpicks !== 'staffpicks') {
        return;
    }

    if (staffpicks) {
        sortparams += '&filter=conditional_featured';
        feedtitle += `: ${category} staffpicks`;
    }

    const url = `https://api.vimeo.com/categories/${categoryparams}/videos?page=1&per_page=18${sortparams}`;
    const tokenresponse = await got({
        method: 'get',
        url: 'https://vimeo.com/_rv/viewer',
    });
    const VimeoAuthorization = tokenresponse.data.jwt;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Authorization: `jwt ${VimeoAuthorization}`,
        },
    });

    const vimeojs = response.data.data;

    const feedlink = `https://vimeo.com/categories/${category}/videos/sort:latest`;
    const feedlinkstaffpicks = '?staffpicked=ture';
    const feedDescription = await ctx.cache.tryGet(feedlink + (staffpicks ? feedlinkstaffpicks : ''), async () => {
        const response = await got({
            url: feedlink + (staffpicks ? feedlinkstaffpicks : ''),
        });
        const description = cheerio.load(response.data);
        return description('meta[name="description"]').attr('content');
    });

    ctx.state.data = {
        title: `${feedtitle} | Vimeo category`,
        link: feedlink + (staffpicks ? feedlinkstaffpicks : ''),
        description: feedDescription,
        item: vimeojs.map((item) => ({
            title: item.name,
            description: art(path.join(__dirname, 'templates/description.art'), {
                videoUrl: item.uri.replace(`/videos`, ''),
                vdescription: item.description ? item.description : '',
            }),
            pubDate: parseDate(item.created_time),
            link: item.link,
            author: item.user.name,
        })),
    };
};
