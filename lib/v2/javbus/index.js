const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const isWestern = /^\/western/.test(ctx.path);

    const rootUrl = `https://www.${ctx.query.domain ?? 'javbus.com'}`;
    const westernUrl = `https://www.${ctx.query.western_domain ?? 'javbus.org'}`;
    const currentUrl = `${isWestern ? westernUrl : rootUrl}${ctx.path.replace(/^\/western/, '').replace(/\/home/, '')}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.movie-box')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: item.attr('href'),
                guid: item.find('date').first().text(),
                pubDate: parseDate(item.find('date').last().text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('.genre').last().parent().remove();
                content('input[type="checkbox"], button').remove();

                const stars = content('.avatar-box span')
                    .toArray()
                    .map((s) => content(s).text());

                const cache = {
                    author: stars.join(', '),
                    title: content('h3').text(),
                    category: content('.genre label')
                        .toArray()
                        .map((c) => content(c).text())
                        .concat(stars),
                    info: content('.row.movie').html(),
                    thumbs: content('.sample-box')
                        .toArray()
                        .map((i) => {
                            const thumbSrc = content(i).attr('href');
                            return /^http/.test(thumbSrc) ? thumbSrc : `${rootUrl}${thumbSrc}`;
                        }),
                };

                let magnets, videoSrc, videoPreview;

                // To fetch magnets.

                try {
                    const matches = detailResponse.data.match(/var gid = (\d+);[\s\S]*var uc = (\d+);[\s\S]*var img = '(.*)';/);

                    const magnetResponse = await got({
                        method: 'get',
                        url: `${rootUrl}/ajax/uncledatoolsbyajax.php`,
                        searchParams: {
                            gid: matches[1],
                            lang: 'zh',
                            img: matches[3],
                            uc: matches[2],
                            floor: 800,
                        },
                        headers: {
                            Referer: item.link,
                        },
                    });

                    const content = cheerio.load(`<table>${magnetResponse.data}</table>`);

                    magnets = content('tr')
                        .toArray()
                        .map((tr) => {
                            const td = content(tr).find('a[href]');

                            return {
                                title: td.first().text().trim(),
                                link: td.first().attr('href'),
                                size: td.eq(1).text().trim(),
                                date: td.last().text().trim(),
                            };
                        });

                    if (magnets) {
                        item.enclosure_url = magnets[0].link;
                        item.enclosure_type = 'application/x-bittorrent';
                    }
                } catch (e) {
                    // no-empty
                }

                // If the video is not western, go fetch preview.

                if (!isWestern) {
                    try {
                        const avgleResponse = await got({
                            method: 'get',
                            url: `https://api.avgle.com/v1/jav/${item.guid}/0`,
                        });

                        // full video
                        videoSrc = avgleResponse.data.response.videos[0]?.embedded_url ?? '';
                        // video preview
                        videoPreview = avgleResponse.data.response.videos[0]?.preview_video_url ?? '';
                    } catch (e) {
                        // no-empty
                    }
                }

                item.author = cache.author;
                item.title = cache.title;
                item.category = cache.category;
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    info: cache.info,
                    thumbs: cache.thumbs,
                    magnets,
                    videoSrc,
                    videoPreview,
                });

                return item;
            })
        )
    );

    const title = $('head title').text();

    ctx.state.data = {
        title: `${/^JavBus/.test(title) ? '' : 'JavBus - '}${title.replace(/ - AV磁力連結分享/, '')}`,
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
};
