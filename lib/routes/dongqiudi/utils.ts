import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const processVideo = ($, scope) => {
    scope.find('div.video').each((i, v) => {
        let link = new URL(v.attribs.src);
        if (link.host === 'm.miguvideo.com') {
            $(`<a href="${link.href}"> ▶️ 观看视频 </a><br>`).insertAfter(v);
            $(v).remove();
        } else {
            link = v.attribs.src;
            switch (v.attribs.site) {
                case 'qiniu':
                    $(`<video width="100%" controls="controls"> <source src="${link}" type="video/mp4"> Your RSS reader does not support video playback. </video>`).insertAfter(v);
                    $(v).remove();
                    break;
                case 'youku':
                    $(`<iframe height='100%' width='100%' src='${link}' frameborder=0 scrolling=no webkitallowfullscreen=true allowfullscreen=true></iframe>`).insertAfter(v);
                    $(v).remove();
                    break;
                default:
                    break;
            }
        }
    });

    // Process iframes
    scope.find('iframe.media-iframe, .edui-faked-video').each((i, v) => {
        const link = v.attribs.src;
        if (link.startsWith('http://ssports.iqiyi.com/')) {
            $(`<a href="${link.link}"> ▶️ 观看视频 </a><br>`).insertAfter(v);
        }

        $(v).remove();
    });
};

const processHref = (content) => {
    content.each((j, y) => {
        if (y.attribs.href) {
            y.attribs.href = y.attribs.href.replace('dongqiudi:///news', 'https://www.dongqiudi.com/article');
        }
    });
};

const processImg = (content) => {
    content.each((_, img) => {
        if (img.attribs['data-gif-src'] && img.attribs['data-gif-src'].length) {
            img.attribs = { src: img.attribs['data-gif-src'] };
        }
        if (img.attribs['orig-src'] && img.attribs['orig-src'].length) {
            img.attribs.src = img.attribs['orig-src'];
            delete img.attribs['orig-src'];
            delete img.attribs['data-src'];
        }
        img.attribs.src = img.attribs.src.includes('?watermark') ? img.attribs.src.split('?watermark', 1)[0] : img.attribs.src;
    });
};

export const processFeed = async (type, id) => {
    const link = `https://www.dongqiudi.com/${type}/${id}.html`;
    const apiUrl = 'https://api.dongqiudi.com/v3/archive/app/channel/feeds';
    const { data: response } = await got(link);
    const $ = load(response);

    let name;
    let image;
    if (type === 'team') {
        name = $('h1.tp-hero__name').text();
        image = $('.tp-hero__logo').attr('src');
    } else {
        name = $('h1.pp-hero__name').text().trim();
        image = $('.pp-hero__avatar').attr('src');
    }

    const { data } = await got(apiUrl, {
        searchParams: {
            id,
            type,
            size: 20,
            platform: 'web',
            version: '',
        },
    });

    let list = data.data.articles.map((article) => ({
        title: article.title,
        link: `https://www.dongqiudi.com/articles/${article.id}.html`,
        category: [article.category, ...(article.secondary_category ?? [])],
        pubDate: parseDate(article.show_time, 'X'),
    }));

    if (type === 'team' && list.length === 0) {
        list = $('.tp-news-item')
            .toArray()
            .map((element) => {
                const news = $(element);
                return {
                    title: news.find('.tp-news-item__title').text(),
                    link: new URL(news.attr('href')!, link).href,
                    category: [news.find('.tp-news-item__tag').text()],
                    pubDate: timezone(parseDate(news.find('.tp-news-item__time').text(), 'YYYY-MM-DD HH:mm'), 8),
                };
            });
    }

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);

                await processFeedType2(item, response);

                return item;
            })
        )
    );

    return {
        title: `${name} - 相关新闻`,
        link,
        image,
        item: out,
    };
};

export const processFeedType2 = (item, response) => {
    const $ = load(response);
    const articleBody = $('.article-body');
    if (!articleBody.length) {
        return;
    }

    processVideo($, articleBody);
    processHref(articleBody.find('a'));
    processImg(articleBody.find('img'));
    item.description = articleBody.html();
    const author = $('.article-head__author-name').text();
    if (author) {
        item.author = author;
    }
};
