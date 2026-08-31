import { load } from 'cheerio';
import { JSDOM } from 'jsdom';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const processVideo = (content) => {
    content('div.video').each((i, v) => {
        let link = new URL(v.attribs.src);
        if (link.host === 'm.miguvideo.com') {
            content(`<a href="${link.href}"> ▶️ 观看视频 </a><br>`).insertAfter(v);
            content(v).remove();
        } else {
            link = v.attribs.src;
            switch (v.attribs.site) {
                case 'qiniu':
                    content(`<video width="100%" controls="controls"> <source src="${link}" type="video/mp4"> Your RSS reader does not support video playback. </video>`).insertAfter(v);
                    content(v).remove();
                    break;
                case 'youku':
                    content(`<iframe height='100%' width='100%' src='${link}' frameborder=0 scrolling=no webkitallowfullscreen=true allowfullscreen=true></iframe>`).insertAfter(v);
                    content(v).remove();
                    break;
                default:
                    break;
            }
        }
    });

    // Process iframes
    content('iframe.media-iframe, .edui-faked-video').each((i, v) => {
        const link = v.attribs.src;
        if (link.startsWith('http://ssports.iqiyi.com/')) {
            content(`<a href="${link.link}"> ▶️ 观看视频 </a><br>`).insertAfter(v);
        }

        content(v).remove();
    });

    return content;
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

    const { window } = new JSDOM(response, {
        runScripts: 'dangerously',
    });

    const nuxtData = window.__NUXT__.data[0];
    let name;
    let image;
    if (type === 'team') {
        name = nuxtData.teamInfo.name;
        image = nuxtData.teamInfo.logo;
    } else {
        name = nuxtData.detail.base_info.person_name;
        image = nuxtData.detail.base_info.person_logo;
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
        list = nuxtData.newsList.map((news) => ({
            title: news.title,
            link: `https://www.dongqiudi.com/articles/${news.id}.html`,
            category: [news.category],
            pubDate: timezone(parseDate(news.time), 8),
        }));
    }

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);

                processFeedType2(item, response);

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
    const dom = new JSDOM(response, {
        runScripts: 'dangerously',
    });

    const data = dom.window.__NUXT__?.data?.[0]?.article;

    // filter out undefined item
    if (!data) {
        return;
    }

    const body = processVideo(load(data.rawBody, null, false));
    processHref(body('a'));
    processImg(body('img'));
    item.description = body.html();
    item.author = data.author;
};
