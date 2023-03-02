const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const categories = {
    1: '同人誌 漢化',
    2: '同人誌 CG畫集',
    3: '同人誌 Cosplay',
    5: '同人誌',
    6: '單行本',
    7: '雜誌&短篇',
    9: '單行本 漢化',
    10: '雜誌&短篇 漢化',
    12: '同人誌 日語',
    13: '單行本 日語',
    14: '雜誌&短篇 日語',
    16: '同人誌 English',
    17: '單行本 English',
    19: '韓漫',
    20: '韓漫 漢化',
    21: '韓漫 生肉',
};

const baseUrl = 'https://wnacg.org';

module.exports = async (ctx) => {
    const { cid, tag } = ctx.params;
    if (cid && !Object.keys(categories).includes(cid)) {
        throw Error('此分类不存在');
    }

    const url = `${baseUrl}/albums${cid ? `-index-cate-${cid}` : ''}${tag ? `-index-tag-${tag}` : ''}.html`;
    const { data } = await got(url);
    const $ = cheerio.load(data);

    const list = $('.gallary_item')
        .toArray()
        .map((item) => {
            item = $(item);
            const href = item.find('a').attr('href');
            const aid = href.match(/^\/photos-index-aid-(\d+)\.html$/)[1];
            return {
                title: item.find('a').attr('title'),
                link: `${baseUrl}${href}`,
                pubDate: parseDate(
                    item
                        .find('.info_col')
                        .text()
                        .replace(/\d+張照片，\n創建於/, ''),
                    'YYYY-MM-DD'
                ),
                aid,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: descRes } = await got(item.link, {
                    headers: {
                        referer: encodeURI(url),
                    },
                });
                let $ = cheerio.load(descRes);
                const author = $('.uwuinfo p').first().text();
                const category = $('.tagshow')
                    .toArray()
                    .map((item) => $(item).text());
                $('.addtags').remove();
                const description = $('.uwconn').html();

                const { data } = await got(`${baseUrl}/photos-gallery-aid-${item.aid}.html`, {
                    headers: {
                        referer: `${baseUrl}/photos-slide-aid-${item.aid}.html`,
                    },
                });
                $ = cheerio.load(data);

                const imgListMatch = $('script')
                    .text()
                    .match(/var imglist = (\[.*\]);"\);/)[1];

                const imgList = JSON.parse(
                    imgListMatch
                        .replace(/url:/g, '"url":')
                        .replace(/caption:/g, '"caption":')
                        .replace(/fast_img_host\+\\/g, '')
                        .replace(/\\/g, '')
                );

                item.author = author;
                item.category = category;
                item.description = art(path.join(__dirname, 'templates/manga.art'), {
                    description,
                    imgList,
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link: url,
        item: items,
    };
};
