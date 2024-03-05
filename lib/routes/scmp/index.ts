// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { parseItem } = require('./utils');

export default async (ctx) => {
    const categoryId = ctx.req.param('category_id');
    const rssUrl = `https://www.scmp.com/rss/${categoryId}/feed`;
    const { data: response } = await got(rssUrl);
    const $ = load(response, {
        xmlMode: true,
    });

    const list = $('item')
        .toArray()
        .map((item) => {
            item = $(item);
            const enclosure = item.find('enclosure').first();
            const mediaContent = item.find('media\\:content').toArray()[0];
            const thumbnail = item.find('media\\:thumbnail').toArray()[0];
            return {
                title: item.find('title').text(),
                description: item.find('description').text(),
                link: item.find('link').text().split('?utm_source')[0],
                author: item.find('author').text(),
                pubDate: parseDate(item.find('pubDate').text()),
                enclosure_url: enclosure?.attr('url'),
                enclosure_length: enclosure?.attr('length'),
                enclosure_type: enclosure?.attr('type'),
                media: {
                    content: Object.keys(mediaContent.attribs).reduce((data, key) => {
                        data[key] = mediaContent.attribs[key];
                        return data;
                    }, {}),
                    thumbnail: thumbnail?.attribs
                        ? Object.keys(thumbnail.attribs).reduce((data, attr) => {
                              data[attr] = thumbnail.attribs[attr];
                              return data;
                          }, {})
                        : undefined,
                },
            };
        });

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseItem)));

    ctx.set('json', {
        items,
    });

    ctx.set('data', {
        title: $('channel > title').text(),
        link: $('channel > link').text(),
        description: $('channel > description').text(),
        item: items,
        language: 'en-hk',
        icon: 'https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png',
        logo: 'https://customerservice.scmp.com/img/logo_scmp@2x.png',
        image: $('channel > image > url').text(),
    });
};
