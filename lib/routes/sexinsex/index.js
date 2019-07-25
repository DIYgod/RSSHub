const cheerio = require('cheerio');
const got = require('@/utils/got');
const iconv = require('iconv-lite');
const url = require('url');

const base = 'http://sexinsex.net';
const section = '/bbs/forumdisplay.php?fid=';
const got_ins = got.extend({
    headers: {
        Referer: base,
    },
    responseType: 'buffer',
});

const sourceTimezoneOffset = -8;
module.exports = async (ctx) => {
    const typefilter = ctx.params.type ? `&filter=type&typeid=${ctx.params.type}` : '';
    const location = `${section}${ctx.params.id}${typefilter}`;
    let title = '';

    let out = [];
    const parseContent = (htmlString) => {
        htmlString = iconv.decode(htmlString, 'gbk');
        let $ = cheerio.load(htmlString, { decodeEntities: false });
        const author = $('#wrapper > div:nth-child(1) > form > div:nth-child(2) > table > tbody > tr:nth-child(1) > td.postauthor > cite > a').text();
        let time = $('.postinfo').text();
        const regex = /\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}/;
        const regRes = regex.exec(time);
        time = regRes.length === 0 ? new Date() : new Date(regRes[0]);
        time.setTime(time.getTime() + (sourceTimezoneOffset - time.getTimezoneOffset() / 60) * 60 * 60 * 1000);

        const content = $('.postmessage').html();
        $ = cheerio.load(content, { decodeEntities: false });
        $('.postratings').remove();
        $('div.quote').remove();

        return {
            author: author,
            description: $('body').html(),
            pubDate: time.toUTCString(),
        };
    };
    const fetch = async (pageindex) => {
        const pageUrl = url.resolve(base, `${location}&page=${pageindex}`);
        const res = await got_ins.get(pageUrl);
        const data = iconv.decode(res.data, 'gbk');
        const $ = cheerio.load(data);
        title = (ctx.params.type ? `[${$('.threadlist .headactions strong').text()}]` : '') + $('title').text();
        const list = $(`#forum_${ctx.params.id}:last-child tbody tr th`).get();

        const result = await Promise.all(
            list.map(async (item) => {
                const $ = cheerio.load(item);
                const guid = $('span').attr('id'); // thread_7836473
                let title = $('span a');
                const catalog = $('em').text(); // http://sexinsex.net/bbs/thread-7988706-1-1.html
                title = title.text();
                const link = url.resolve(base, `/bbs/${guid.replace('_', '-')}-1-1.html`);

                // Check cache
                const cache = await ctx.cache.get(link);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const single = {
                    title: `${catalog} ${title}`,
                    link: link,
                    guid: guid,
                };

                try {
                    const response = await got_ins.get(link, {
                        headers: {
                            Referer: pageUrl,
                        },
                    });
                    const result = parseContent(response.data);

                    single.author = result.author;
                    single.description = result.description;
                    single.pubDate = result.pubDate;
                } catch (err) {
                    return Promise.resolve('');
                }
                ctx.cache.set(link, JSON.stringify(single));
                return Promise.resolve(single);
            })
        );
        out = out.concat(result);
    };

    // 一次读取两页的内容
    await Promise.all([1, 2].map(async (value) => await fetch(value)));

    ctx.state.data = {
        title: title,
        link: url.resolve(base, `${section}${ctx.params.id}${typefilter}`),
        item: out,
    };
};
