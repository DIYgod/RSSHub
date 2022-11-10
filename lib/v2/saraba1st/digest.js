const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const tid = ctx.params.tid;
    const cookieString = config.saraba1st.cookie ? config.saraba1st.cookie : '';
    const res = await got('https://bbs.saraba1st.com/2b/' + tid + '.html', {
        headers: {
            Cookie: cookieString,
        },
    });
    const $ = cheerio.load(res.data);
    const title = $('head title').text().replace(/-.*/, '');
    const list = $('#threadlisttableid tbody[id^="normalthread_"] tr');
    const count = list
        .slice(0, ctx.query.limit ? Number(ctx.query.limit) : 20)
        .toArray()
        .map((each) => {
            each = $(each);
            const floor = each.find('th.new a.s.xst').text();
            const floorUrl = each.find('th.new a.s.xst').attr('href');
            return {
                title: `${title}:${floor}`,
                link: new URL(floorUrl, 'https://bbs.saraba1st.com/2b/').href,
                author: each.find('td.by cite').text(),
                pubDate: timezone(parseDate(each.find('td.by em').first().text()), +8),
            };
        });

    const resultItems = await Promise.all(
        count.map((i) =>
            ctx.cache.tryGet(i.link, async () => {
                i.description = await fetchContent(i.link);
                return i;
            })
        )
    );

    ctx.state.data = {
        title: `Stage1 论坛 - ${title}`,
        link: `https://bbs.saraba1st.com/2b/${tid}.html`,
        //        item: await resultItems,
        item: resultItems,
    };
};

async function fetchContent(url) {
    // Fetch the subpageinof
    const cookieString = config.saraba1st.cookie ? config.saraba1st.cookie : '';
    const subres = await got(url, {
        headers: {
            Cookie: cookieString,
        },
    });
    const subind = cheerio.load(subres.data);
    const stubS = subind('<div>');
    subind('#postlist')
        .find('div[id*="post_"] ')
        .each(function () {
            if (subind(this).find('td[id*="postmessage_"]').length > 0) {
                const section = art(path.join(__dirname, 'templates/digest.art'), {
                    author: {
                        link: subind(this).find('.pls.favatar div.authi a').attr('href'),
                        name: subind(this).find('.pls.favatar div.authi').text(),
                        postinfo: subind(this).find('div.authi em[id*=authorposton]').text(),
                    },
                    msg: subind(this).find('td[id*="postmessage_"]').html(),
                });
                stubS.append(section);
            }
        });

    return stubS.html();
}
