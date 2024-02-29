const cheerio = require('cheerio');
const got = require('@/utils/got');
const url = require('url');

const base = 'http://www.t66y.com';
const section = 'thread0806.php?fid=';
const got_ins = got.extend({
    headers: {
        Referer: base,
    },
});

function killViidii(originUrl) {
    const decodeStr = /.*\?http/g;
    const decodeSig = /______/g;
    const jsSuffix = '&amp;z';
    const htmlSuffix = '&z';
    const returnSuffix = 'return false';
    return originUrl.includes('viidii') ? originUrl.replaceAll(decodeStr, 'http').replaceAll(decodeSig, '.').replace(jsSuffix, '').replace(htmlSuffix, '').replace(returnSuffix, '') : originUrl;
}

const sourceTimezoneOffset = -8;
const filterReg = /read\.php/;

module.exports = async (ctx) => {
    const typefilter = ctx.params.type ? `&type=${ctx.params.type}` : '';
    const res = await got_ins.get(url.resolve(base, `${section}${ctx.params.id}${typefilter}&search=today`));
    const data = res.data;
    const $ = cheerio.load(data);
    const typeTitle = ctx.params.type ? `[${$('.t .fn b').text()}]` : '';
    let list = $('#ajaxtable > tbody:nth-child(2)');
    list = $('.tr3', list).not('.tr2.tac').nextAll().slice(0, 25).get();

    const parseContent = (htmlString) => {
        let $ = cheerio.load(htmlString);
        let time = $('#main > div:nth-child(4) > table > tbody > tr:nth-child(2) > th > div').text();
        const regex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;
        const regRes = regex.exec(time);
        time = regRes === null ? new Date() : new Date(regRes[0]);
        time.setTime(time.getTime() + (sourceTimezoneOffset - time.getTimezoneOffset() / 60) * 60 * 60 * 1000);

        const author = $('#main > div:nth-child(4) > table > tbody > tr.tr1.do_not_catch > th:nth-child(1) > b').text();
        const content = $('#main > div:nth-child(4) > table > tbody > tr.tr1.do_not_catch > th:nth-child(2) > table > tbody > tr > td > div.tpc_content.do_not_catch').html();

        // Change the image tag to display image in rss reader
        try {
            $ = cheerio.load(content, { decodeEntities: false }); // 修复无发进行filter与filterout的问题
        } catch {
            return null;
        }

        // Handle video
        const video = $('a:nth-of-type(2)');
        if (video) {
            const videoScript = video.attr('onclick');
            const regVideo = /https?:\/\/.*'/;
            const videoRes = regVideo.exec(videoScript);
            if (videoRes && videoRes.length !== 0) {
                let link = videoRes[0];
                link = link.slice(0, -1);
                $('iframe').attr('src', link);
            }
        }
        // Handle img tag
        let images = $('img');
        for (const image of images) {
            $(image).replaceWith(`<img src="${$(image).attr('ess-data')}" />`);
        }
        // Handle input tag
        images = $('input');
        for (const image of images) {
            $(image).replaceWith(`<img src="${$(image).attr('ess-data')}" />`);
        }

        // Handle links
        const links = $('a[href*="viidii"]');
        for (const link of links) {
            $(link).attr('href', killViidii($(link).attr('href')));
        }

        return {
            author,
            description: $('body').html(),
            pubDate: time.toUTCString(),
        };
    };

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            let title = $('.tal h3 a');
            const path = title.attr('href');

            // Filter duplicated or null entries
            if (!path || path.match(filterReg) !== null) {
                return '';
            }
            const link = url.resolve(base, path);

            // Check cache
            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const tnode = $('.tal').contents().get(0);
            const catalog = tnode.type === 'text' ? tnode.data.trim() : '';

            title = cheerio.load(title.html())('font').text() === '' ? title.text() : cheerio.load(title.html())('font').text();

            if (!title) {
                return '';
            }

            const single = {
                title: `${catalog} ${title}`,
                link,
                guid: path,
            };

            try {
                const response = await got_ins.get(url.resolve(base, path));
                const result = parseContent(response.data);

                if (!result) {
                    return '';
                }

                single.author = result.author;
                single.description = result.description;
                single.pubDate = result.pubDate;
            } catch {
                return '';
            }
            ctx.cache.set(link, JSON.stringify(single));
            return single;
        })
    );

    ctx.state.data = {
        title: typeTitle + $('title').text(),
        link: url.resolve(base, `${section}${ctx.params.id}${typefilter}`),
        item: out.filter((item) => item !== ''),
    };
};
