import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        fid
    } = ctx.params;

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
                [, result.enclosure_url] = magnet_url;
                result.enclosure_type = 'application/x-bittorrent';
            }
        }

        return result;
    };

    const out = await Promise.all(
        list.slice(0, 30).map(async (item) => {
            const $ = cheerio.load(item);

            if (!$('td > a').first().attr('title')) {
                return '';
            }

            if ($(`img[title='置顶帖标志']`).length !== 0) {
                return '';
            }

            const title = $('a.subject');
            const author = $('a.bl');
            const path = title.attr('href');

            const key = `/2048/${path}`;
            const link = `${base}/2048/${path}`;

            const cache = await ctx.cache.get(key);
            if (cache) {
                return JSON.parse(cache);
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
            } catch {
                return '';
            }
            ctx.cache.set(key, JSON.stringify(rssitem));
            return rssitem;
        })
    );

    ctx.state.data = {
        title: forum_name,
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
