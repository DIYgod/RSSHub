import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import randUserAgent from '@/utils/rand-user-agent';

const UA = randUserAgent({ browser: 'chrome', os: 'android', device: 'mobile' });

// const chromeMobileUserAgent = 'Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/67.0.3396.87 Mobile Safari/537.36';
const parseArticle = (item) =>
    cache.tryGet(item.link, async () => {
        // Fetch the AMP version
        const url = item.link.replace(/(?<=^https:\/\/\w+\.wsj\.com)/, '/amp');
        const response = await got({
            url,
            method: 'get',
            headers: {
                'User-Agent': UA,
            },
        });
        const html = response.data;
        const $ = load(html);

        // Summary
        const summary = $('head > meta[name="description"]').attr('content');

        // Metadata (categories & updatedAt)
        const updatedAt = $('meta[itemprop="dateModified"]').attr('content');
        const publishedAt = $('meta[itemprop="datePublished"]').attr('content');
        const author = $('.author > a[rel="author"]').text();

        const categories = $('meta[name="keywords"]')
            .attr('content')
            .split(',')
            .map((c) => c.trim());

        const article = $('article');
        item.subTitle = $('h2.sub-head').html();

        // Remove podcast
        article.find('.media-object-podcast').remove();

        // Authors
        article.find('.bylineWrap').each((i, e) => {
            $(e)
                .find('p')
                .each(function () {
                    $(this).replaceWith($(this).html());
                });
        });

        // Images
        article.find('.bigTop-hero').each((i, e) => {
            // console.log($(e).html());
            const imgSrc = $(e).find('amp-img').attr('src');
            const imgAlt = $(e).find('amp-img').attr('alt');
            const figCaption = $(e).find('.imageCaption').text().trim();
            const figCredit = $(e).find('.imageCredit').text().trim();
            const fig = $(`<figure><img src="${imgSrc}" alt="${imgAlt}"><figcaption>${figCaption} <span>${figCredit}</span></figcaption></figure>`);
            $(fig).insertBefore(e);
            $(e).remove();
        });
        article.find('amp-img').each((i, e) => {
            const img = $(`<img width="${e.attribs.width}" height="${e.attribs.height}" src="${e.attribs.src}" alt="${e.attribs.alt}">`);

            // Caption follows, no need to handle caption
            $(img).insertBefore(e);
            $(e).remove();
        });

        // iframes (youtube videos and interactive elements)
        article.find('amp-iframe').each((i, e) => {
            const iframe = $(`<iframe width="${e.attribs.width}" height="${e.attribs.height}" src="${e.attribs.src}">`);
            $(iframe).insertBefore(e);
            $(e).remove();
        });

        // Remove unwanted DOMs
        const unwanted_element_selectors = ['amp-ad', '.wsj-ad', 'h1', 'h2', '.zonedModule', '.snippet', '.newsletter-inset'];
        for (const selector of unwanted_element_selectors) {
            article.find(selector).each((i, e) => {
                $(e).remove();
            });
        }

        // Paywall
        article.find('.paywall').each((i, e) => {
            // Caption follows, no need to handle caption
            $(e.childNodes).insertBefore(e);
            $(e).remove();
        });
        item.article = article.html();
        item.description = art(path.join(__dirname, 'templates/article-description.art'), {
            item,
        });

        return {
            title: item.title,
            pubDate: parseDate(publishedAt),
            updated: parseDate(updatedAt),
            author,
            link: item.link,
            summary,
            description: item.description,
            category: categories,
            icon: 'https://s.wsj.net/media/wsj_launcher-icon-4x.png',
            logo: 'https://vir.wsj.net/fp/assets/webpack4/img/wsj-logo-big-black.165e51cc.svg',
        };
    });

export { parseArticle };
