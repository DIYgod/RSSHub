const got = require('@/utils/got');
const config = require('@/config').value;
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://zodgame.xyz';

module.exports = async (ctx) => {
    const fid = ctx.params.fid;
    const subUrl = `${rootUrl}/forum.php?mod=forumdisplay&fid=${fid}`;
    const cookie = config.zodgame.cookie;

    if (cookie === undefined) {
        throw Error('Zodgame RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }

    const response = await got({
        method: 'get',
        url: subUrl,
        headers: {
            Cookie: cookie,
        },
    });
    const $ = cheerio.load(response.data);
    const pageTitle = $('title').text();
    const list = $('#threadlisttableid tbody');

    const items = list
        .map((_, item) => {
            const title = $(item).find('tr th a.s.xst').text();
            const author = $(item).find('tr td.by cite a').text();
            const type = $(item).find('tr th em a').text();
            const link = $(item).find('tr th a.s.xst').attr('href');
            return {
                title,
                author,
                link,
                category: type,
                description: art(path.join(__dirname, 'templates/forum.art'), {
                    type,
                    title,
                    author,
                }),
            };
        })
        .get();

    ctx.state.data = {
        title: pageTitle,
        link: rootUrl,
        item: items,
    };
};
