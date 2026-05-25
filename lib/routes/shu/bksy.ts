import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://bksy.shu.edu.cn';
const image = 'https://www.shu.edu.cn/__local/0/08/C6/1EABE492B0CF228A5564D6E6ABE_779D1EE3_5BF7.png';

const categories = {
    notice: {
        title: '通知公告',
        path: 'tzgg',
    },
    news: {
        title: '新闻',
        path: 'xw',
    },
};

const alias = new Map([
    ['tzgg', 'notice'],
    ['xw', 'news'],
]);

export const route: Route = {
    path: '/bksy/:type?',
    categories: ['university'],
    example: '/shu/bksy/notice',
    parameters: { type: '分类，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['bksy.shu.edu.cn/', 'bksy.shu.edu.cn/index/tzgg.htm', 'bksy.shu.edu.cn/index/xw.htm'],
            target: '/bksy',
        },
    ],
    name: '本科生院',
    maintainers: ['tuxinghuan', 'GhhG123'],
    handler,
    url: 'bksy.shu.edu.cn/',
    description: `上海大学教务部已更名为本科生院，旧路由 \`/shu/jwb/:type?\` 会重定向至本路由。

| 通知公告 | 新闻 |
| -------- | ---- |
| notice   | news |`,
};

async function handler(ctx) {
    const routeType = ctx.req.param('type') || 'notice';
    const type = alias.get(routeType) || routeType;
    const category = categories[type] || categories.notice;
    const link = new URL(`index/${category.path}.htm`, rootUrl).href;

    const response = await got.get(link);
    const $ = load(response.data);

    const list = $('.only-list li')
        .slice(0, 10)
        .toArray()
        .map((element) => {
            const item = $(element);
            const rawLink = item.find('a').attr('href');

            return {
                title: item.find('a').text().trim(),
                link: rawLink ? new URL(rawLink, link).href : link,
                pubDate: timezone(parseDate(item.find('span').text().trim(), 'YYYY年MM月DD日'), +8),
            };
        });

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, async () => await getItemDetail(item))));

    return {
        title: `上海大学本科生院 - ${category.title}`,
        description: `上海大学本科生院 - ${category.title}`,
        link,
        image,
        item: items,
    };
}

async function getItemDetail(item) {
    const response = await got.get(item.link);
    const $ = load(response.data);
    const content = $('.v_news_content').first();

    normalizeContentUrls($, content, item.link);

    const embeddedFiles = getEmbeddedFiles($, content, item.link);
    content.find('script').remove();
    const attachments = getAttachments($, item.link);
    const description = renderDescription(content.html() || item.title, embeddedFiles, attachments);
    const enclosure = attachments[0] || embeddedFiles[0];

    item.title = $('[id$=_lblTitle]').first().text().trim() || item.title;
    item.author = $('[id$=_lblUser]').first().text().trim();
    const pubDate = $('[id$=_lblFB]').first().text().trim();
    if (pubDate) {
        item.pubDate = timezone(parseDate(pubDate), +8);
    }
    item.description = description;

    if (enclosure) {
        item.enclosure_url = enclosure.link;
        item.enclosure_type = getEnclosureType(enclosure);
    }

    return item;
}

function normalizeContentUrls($, content, baseUrl) {
    content.find('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
            $(element).attr('href', new URL(href, baseUrl).href);
        }
    });

    content.find('img[src]').each((_, element) => {
        const src = $(element).attr('src');
        if (src) {
            $(element).attr('src', new URL(src, baseUrl).href);
        }
    });
}

function getEmbeddedFiles($, content, baseUrl) {
    return content
        .find('script')
        .toArray()
        .flatMap((element) => {
            const script = $(element).html() || '';
            return [...script.matchAll(/showVsbpdfIframe\(["']([^"']+)["']/g)].map((match, index) => ({
                title: index === 0 ? '正文 PDF' : `正文 PDF ${index + 1}`,
                link: new URL(match[1], baseUrl).href,
            }));
        });
}

function getAttachments($, baseUrl) {
    return $('form[name="_newscontent_fromname"] ul li a[href]')
        .toArray()
        .map((element) => {
            const attachment = $(element);

            return {
                title: attachment.text().trim() || attachment.attr('title') || '附件',
                link: new URL(attachment.attr('href'), baseUrl).href,
            };
        });
}

function renderDescription(description, embeddedFiles, attachments) {
    const files = [...embeddedFiles, ...attachments];
    if (files.length === 0) {
        return description;
    }

    const fileList = files.map((file) => `<li><a href="${file.link}">${escapeHtml(file.title)}</a></li>`).join('');
    return `${description}<hr><p><strong>附件</strong></p><ul>${fileList}</ul>`;
}

function getEnclosureType(file) {
    const extension = (file.title.split('.').pop() || new URL(file.link).pathname.split('.').pop() || '').toLowerCase();
    const mimeTypes = {
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        pdf: 'application/pdf',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        zip: 'application/zip',
    };

    return mimeTypes[extension] || 'application/octet-stream';
}

function escapeHtml(text) {
    return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
