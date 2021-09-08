const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'news';
    const dialect = ctx.params.dialect ?? 'mandarin';
    const category = ctx.params.category ?? 'news';
    const language = ctx.params.language ?? dialect === 'mandarin' ? 'zh-hans' : 'zh-hant';

    const rootUrl = 'https://www.sbs.com.au';
    const currentUrl = `${rootUrl}/language/${dialect}/${category === 'podcast' ? `${language}/podcast/${id}` : `${id}/${language}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.headline, .audio-playlist__item-more')
        .find('a')
        .map((_, item) => {
            item = $(item);

            return {
                link: `${rootUrl}${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('.block__container').remove();

                const audio = content('a[download]')?.attr('href') ?? '';
                const image = content('meta[itemprop="image"]')?.attr('content').split('/crop/')[0] ?? '';

                item.title = content('meta[property="og:title"]').attr('content');
                item.author = content('.article__meta-author').text().trim().replace('By', '');
                item.pubDate = parseDate(content('meta[itemprop="datePublished"]').attr('content'));
                item.description = `${image ? `<img src="${image}"><br>` : ''}${audio ? `<audio src="${audio}" controls></audio><br>` : ''}${content('.text-body').html()}`;

                if (audio) {
                    item.itunes_item_image = image;
                    item.enclosure_url = audio;
                    item.enclosure_type = 'audio/mpeg';
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('meta[property="og:title"]').attr('content')} - SBS中文`,
        link: currentUrl,
        item: items,
        itunes_author: 'SBS中文',
        image: `${rootUrl}/language/img/logos/in-language/logo_chinese.svg`,
    };
};
