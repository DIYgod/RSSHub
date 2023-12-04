const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;
const allowDomain = ['2btjia.com', '88btbtt.com', 'btbtt15.com', 'btbtt20.com'];

module.exports = async (ctx) => {
    let category = ctx.params.category ?? '';
    let domain = ctx.query.domain ?? 'btbtt15.com';
    if (!config.feature.allow_user_supply_unsafe_domain && !allowDomain.includes(new URL(`http://${domain}/`).hostname)) {
        ctx.throw(403, `This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    if (category === 'base') {
        category = '';
        domain = '88btbtt.com';
    } else if (category === 'govern') {
        category = '';
        domain = '2btjia.com';
    }

    const rootUrl = `https://www.${domain}`;
    const currentUrl = `${rootUrl}${category ? `/${category}.htm` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.bg2').prevAll('table').remove();

    let items = $('#threadlist table')
        .toArray()
        .map((item) => {
            const a = $(item).find('.subject_link');

            return {
                title: a.text(),
                link: `${rootUrl}/${a.attr('href')}`,
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

                content('h2, .message').remove();

                content('.attachlist')
                    .find('a')
                    .each(function () {
                        content(this)
                            .children('img')
                            .attr('src', `${rootUrl}${content(this).children('img').attr('src')}`);
                        content(this).attr(
                            'href',
                            `${rootUrl}/${content(this)
                                .attr('href')
                                .replace(/^attach-dialog/, 'attach-download')}`
                        );
                    });

                const torrents = content('.attachlist').find('a');

                item.description = content('.post').html();
                item.author = content('.purple, .grey').first().prev().text();
                item.pubDate = timezone(parseDate(content('.bg2 b').first().text()), +8);

                if (torrents.length > 0) {
                    item.description += art(path.join(__dirname, 'templates/torrents.art'), {
                        torrents: torrents.toArray().map((t) => content(t).parent().html()),
                    });
                    item.enclosure_type = 'application/x-bittorrent';
                    item.enclosure_url = torrents.first().attr('href');
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('#menu, #threadtype')
            .find('.checked')
            .toArray()
            .map((c) => $(c).text())
            .filter((c) => c !== '全部')
            .join('|')} - BT之家`,
        link: currentUrl,
        item: items,
    };
};
