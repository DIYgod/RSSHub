import got from '~/utils/got.js';
import cheerio from 'cheerio';
import iconv from 'iconv-lite';
import {parseDate} from '~/utils/parse-date';

export default async (ctx) => {
    const {
        query,
        params
    } = ctx;

    const { id } = params;
    const {
        limit = 5
    } = query;
    const url = `https://www.163.com/dy/media/${id}.html`;

    const response = await got(url, { responseType: 'buffer' });

    const charset = response.headers['content-type'].split('=')[1];
    const data = iconv.decode(response.data, charset);
    const $ = cheerio.load(data, { decodeEntities: false });

    const list = $('.media_articles ul li')
        .slice(0, limit)
        .map((_, item) => {
            item = $(item);
            const a = item.find('h2.media_article_title a');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(item.find('.media_article_date').text()),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(async (item) => {
            const itemData = await ctx.cache.tryGet(item.link, () =>
                got(item.link, {
                    responseType: 'buffer',
                }).then((it) => it.data)
            );
            const content = cheerio.load(itemData, { decodeEntities: false });
            const postBody = content('.post_body');
            postBody.find('p, br, section').each((_, elem) => (function() {
                let _ret;

                for (const attr of Object.keys(elem.attribs))
                    {_ret = content(elem).removeAttr(attr);}

                return _ret;
            })());
            postBody
                .parent()
                .find('*')
                .contents()
                .filter((_, elem) => elem.type === 'comment')
                .remove();
            return {
                title: item.title,
                link: item.link,
                description: postBody.html(),
                pubDate: item.pubDate,
            };
        })
    );

    ctx.state.data = {
        title: $('.media_info h1').text(),
        link: url,
        description: $('.media_degist').text(),
        item: items,
        author: $('.media_name').text(),
    };
};
