const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const fid = ctx.params.fid;

    const base = 'https://hjd2048.com';

    const url = `${base}/2048/thread.php?fid-${fid}-page-1.html`;

    const list_response = await got.get(url);
    const $ = cheerio.load(list_response.data);

    const list = $('.tr3.t_one').toArray();
    $('#breadCrumb span.fr').remove();
    const forum_name = $('#breadCrumb').text().replace(/»/g, '-');

    const parseContent = async (htmlString) => {
        const $ = cheerio.load(htmlString);

        const time = $('.tiptop.cc > .fl.gray').attr('title');
        const content = $('.tpc_content');

        const result = {
            description: content.html(),
            pubDate: time ? new Date(time) : new Date(),
        };

        const test_external_torrent = content.find('a').filter(function () {
            return $(this)
                .attr('href')
                .match(/\/list\.php\?name=\w{32}/);
        });

        if (test_external_torrent.length !== 0) {
            const torrent_url = test_external_torrent[0].attribs.href;
            const response = await got.get(torrent_url);
            const magnet_url = response.data.match(/"(magnet:\?.*?)"/);
            if (magnet_url) {
                result.enclosure_url = magnet_url[1];
                result.enclosure_type = 'application/x-bittorrent';
            }
        }

        return result;
    };

    const out = await Promise.all(
        list.slice(0, 30).map(async (item) => {
            const $ = cheerio.load(item);

            if (!$('td > a').first().attr('title')) {
                return Promise.resolve('');
            }

            if ($("img[title='置顶帖标志']").length !== 0) {
                return Promise.resolve('');
            }

            const title = $('a.subject');
            const author = $('a.bl');
            const path = title.attr('href');

            const key = `/2048/${path}`;
            const link = `${base}/2048/${path}`;

            const cache = await ctx.cache.get(key);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const rssitem = {
                title: title.text().trim(),
                author: author.text().trim(),
                link,
                guid: key,
            };

            try {
                const response = await got.get(link);
                const result = await parseContent(response.data);

                rssitem.description = result.description;
                rssitem.pubDate = result.pubDate;
                rssitem.enclosure_url = result.enclosure_url;
                rssitem.enclosure_type = result.enclosure_type;
            } catch (err) {
                return Promise.resolve('');
            }
            ctx.cache.set(key, JSON.stringify(rssitem));
            return Promise.resolve(rssitem);
        })
    );

    ctx.state.data = {
        title: forum_name,
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
