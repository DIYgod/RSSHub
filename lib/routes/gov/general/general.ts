import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
// Shared scraper for public government article lists and Guangdong policy interpretations.
// Example caller configuration (legacy property names are part of the caller contract):
// const info = {
//     pathstartat: 1,                              // Number of website path segments preceding the list path; defaults to 0.
//     defaultPath: 'zwgk/zcjd/',                   // List path used when only the website branch is supplied.
//     name_element: 'SiteName, ColumnName',       // Site name, metadata names, or selectors; defaults to the page title.
//     name_match_type: 'meta',                    // 'meta', 'name' (literal name), or 'element' (selector text).
//     name_match: '(.*)',                         // Capture expression for element-based site names.
//     name_join: '—',                             // Separator between name components.
//     list_element: '.news_list li a',            // Selectors identifying article anchors.
//     list_include: 'site',                       // 'all' anchors or 'site' anchors belonging to the current website.
//     title_element: '.content_title',            // Defaults to the ArticleTitle meta content.
//     title_match: '(.*)',                        // Capture expression for the article title.
//     description_element: '#zoomcon',            // Selectors containing the article body.
//     author_element: undefined,                 // Defaults to the ContentSource meta content.
//     author_match: undefined,                   // Capture expression for the article source.
//     authorisme: 'Government website',           // Replacement for sources identifying themselves as the current website.
//     pubDate_element: 'publishtime',             // Defaults to the PubDate meta content.
//     pubDate_match: '(.*)',                      // Capture expression for the publication date.
//     pubDate_format: undefined,                  // Optional publication date format.
// };
// return await gdgov(info, ctx);
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { isValidHost } from '@/utils/valid-host';
import { finishArticleItem } from '@/utils/wechat-mp';

import { renderZcjdpt } from './templates/zcjdpt';

const gdgov = async (info, ctx) => {
    const path = getSubPath(ctx)
        .split('/')
        .filter((item) => item !== '');
    const [site, branch] = path;
    if (!isValidHost(site) || !isValidHost(branch)) {
        throw new InvalidParameterError('Invalid site or branch');
    }

    // Website root.
    const pathStartAt = info.pathstartat === undefined ? 0 : info.pathstartat;
    let rootUrl = 'http://' + branch + '.' + site + '.gov.cn';
    for (let index = 0; index < pathStartAt; index++) {
        const element = path[index + 2];
        rootUrl = rootUrl + '/' + element;
    }

    // Default list path.
    const defaultPath = info.defaultPath;

    // Feed name.
    let nameElement = info.name_element;
    const nameMatchType = info.name_match_type;
    const nameMatch = info.name_match;
    const nameJoin = info.name_join;

    // Article list selectors.
    let listElement = info.list_element;
    let listInclude = info.list_include;
    if (listElement === undefined) {
        listElement = 'a[href*="content"]';
        listInclude = 'site';
    }
    if (listInclude === 'site') {
        listElement = listElement.split(',').filter((item) => item !== '');
        for (let index = 0; index < listElement.length; index++) {
            listElement[index] += '[href*="' + rootUrl.slice(7) + '"]';
        }
        listElement = listElement.join(',');
    }

    // Article title selectors.
    let titleElement = info.title_element;
    let titleMatch = info.title_match;

    // Article source selectors.
    const authorElement = info.author_element;
    const authorMatch = info.author_match;
    const authorIsMe = info.authorisme;

    // Article body selectors.
    let descriptionElement = info.description_element;

    // Publication date selectors.
    let pubDateElement = info.pubDate_element;
    let pubDateMatch = info.pubDate_match;
    let pubDateFormat = info.pubDate_format;

    let pathname = path.slice(2 + pathStartAt).join('/');
    pathname = pathname === '' ? defaultPath : pathname.endsWith('/') ? pathname : pathname + '/';
    const currentUrl = `${rootUrl}/${pathname}`;

    let $ = load('');
    let name: string;
    let list: any;
    // Government information disclosure API.
    if (pathname.startsWith('gkmlpt')) {
        titleElement = undefined;
        titleMatch = undefined;
        descriptionElement = 'div[class="article-content"]';
        pubDateElement = undefined;
        pubDateMatch = undefined;
        pubDateFormat = undefined;

        const res = await got(`${rootUrl}/gkmlpt/api/all/0`);
        name = authorIsMe + '政府信息公开平台';
        list = res.data.articles.filter((item) => item.url.includes('content'));
    } else {
        const res = await got(currentUrl);
        const dataArray = res.data;
        $ = load(dataArray);
        switch (nameMatchType) {
            case 'name':
                name = nameElement;
                break;
            case 'meta':
                nameElement = nameElement.split(',').filter((item) => item !== '');
                for (let index = 0; index < nameElement.length; index++) {
                    nameElement[index] = $('meta[name="' + nameElement[index].trim() + '"]').attr('content');
                }
                name = nameElement.join(nameJoin);
                break;
            case 'element':
                nameElement = nameElement.split(',').filter((item) => item !== '');
                for (let index = 0; index < nameElement.length; index++) {
                    nameElement[index] = $(nameElement[index].trim()).text().match(nameMatch)![1];
                }
                name = nameElement.join(nameJoin);
                break;
            default:
                name = $('head title').text();
                break;
        }
        list = $(listElement);
    }

    const lists = list.map((i, item) => {
        let link: string;

        if (pathname.startsWith('gkmlpt')) {
            link = i.url;
        } else {
            link = $(item).attr('href')!;
            // Resolve article links against the website root.
            if (!link.startsWith('http')) {
                link.startsWith('/') ? (link = `${rootUrl}${link}`) : (link = `${rootUrl}/${link}`);
            }
        }

        return link;
    });

    const links = Array.isArray(lists) ? lists : lists.toArray();
    const items = await Promise.all(
        links.map((link) => {
            const idLink = new URL(link);

            if (idLink.pathname === '/zcjdpt') {
                // http://www.dg.gov.cn/zcjdpt?id=4798
                // http://smzj.maoming.gov.cn/zcjdpt?id=4595
                // http://fgj.maoming.gov.cn/zcjdpt?id=4993
                // https://zcjd.cloud.gd.gov.cn/api/home/article?id=4993
                return cache.tryGet(link, async () => {
                    const zcjdLink = 'https://zcjd.cloud.gd.gov.cn/api/home/article' + idLink.search;
                    const response = await got(zcjdLink);
                    const data = response.data.data;
                    if (!data?.art_title?.trim()) {
                        throw new Error(`Policy interpretation title was not found at ${zcjdLink}`);
                    }
                    const interpretations = data.jie_du_items ?? [];
                    for (const item of interpretations) {
                        item.jd_content = item.jd_content?.replaceAll(/((\n {4})|(\n))/g, '</p><p style="font-size: 16px;line-height: 32px;text-indent: 2em;">');
                    }
                    const pubDate = data.pub_time ? parseDate(data.pub_time) : undefined;

                    return {
                        link,
                        title: data.art_title,
                        description: renderZcjdpt(data),
                        pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? timezone(pubDate, 8) : undefined,
                        author: /本/.test(data.pub_unite) ? authorIsMe : data.pub_unite,
                    };
                });
            }
            if (idLink.host === 'mp.weixin.qq.com') {
                return finishArticleItem({ link });
            }
            return cache.tryGet(link, async () => {
                // Fetch the article page.
                const { data: res } = await got(link);
                const content = load(res);

                // Extract the article source.
                const author = authorElement === undefined ? content('meta[name="ContentSource"]').attr('content') : content(authorElement).text().trim().match(authorMatch)?.[1]?.trim().replaceAll(/(-*$)/g, '');

                // Extract the publication date.
                const pubDate = pubDateElement === undefined ? content('meta[name="PubDate"]').attr('content') : content(pubDateElement).text().trim().match(pubDateMatch)?.[1]?.trim().replaceAll(/(-*$)/g, '');
                const parsedDate = pubDate ? parseDate(pubDate, pubDateFormat) : undefined;

                // Extract the article title.
                const title = titleElement === undefined ? content('meta[name="ArticleTitle"]').attr('content') : content(titleElement).text().trim().match(titleMatch)?.[1];
                if (!title?.trim()) {
                    throw new Error(`Article title was not found at ${link}`);
                }
                // Extract the article body.
                const descriptionContent = descriptionElement.split(',').filter((item) => item !== '');
                for (let index = 0; index < descriptionContent.length; index++) {
                    descriptionContent[index] = content(descriptionContent[index].trim()).html();
                }
                const description = descriptionContent.join('');

                return {
                    link,
                    title,
                    description,
                    pubDate: parsedDate && Number.isFinite(parsedDate.getTime()) ? timezone(parsedDate, 8) : undefined,
                    author: /本/.test(author!) ? authorIsMe : author,
                };
            });
        })
    );

    return {
        title: name,
        link: currentUrl,
        item: items,
    };
};

export { gdgov };
