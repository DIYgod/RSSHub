import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://cs.shu.edu.cn';
const image = 'https://www.shu.edu.cn/__local/0/08/C6/1EABE492B0CF228A5564D6E6ABE_779D1EE3_5BF7.png';

const categories = {
    zytz: {
        title: '重要通知',
        path: 'index/zytz.htm',
    },
};

export const route: Route = {
    path: '/cs/:type?',
    categories: ['university'],
    example: '/shu/cs/zytz',
    parameters: { type: '分类，默认为重要通知' },
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
            source: ['cs.shu.edu.cn/', 'cs.shu.edu.cn/index/zytz.htm'],
            target: '/cs/zytz',
        },
    ],
    name: '计算机工程与科学学院',
    maintainers: ['GhhG123', 'linull24'],
    handler,
    url: 'cs.shu.edu.cn/',
    description: `| 重要通知 |
| -------- |
| zytz     |`,
};

export async function handler(ctx) {
    const type = ctx.req.param('type') || 'zytz';
    const category = categories[type] || categories.zytz;
    const link = new URL(category.path, rootUrl).href;

    const response = await got.get(link);
    const $ = load(response.data);
    const list = $('ul li, .only-list li, .list li, .news_list li')
        .toArray()
        .map((element) => {
            const item = $(element);
            const anchor = item.find('a').first();
            const rawLink = anchor.attr('href');
            if (!rawLink || !rawLink.includes('/info/')) {
                return null;
            }

            const title = anchor.attr('title')?.trim() || item.find('h3, h4, .title, .tit, .bt').first().text().trim() || extractTitle(anchor.text());

            if (!title) {
                return null;
            }

            const date = extractDate(item.text());

            return {
                title,
                link: new URL(rawLink, link).href,
                pubDate: timezone(parseDate(date), +8),
            };
        })
        .filter(Boolean)
        .slice(0, 10);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, async () => await getItemDetail(item))));

    return {
        title: `上海大学计算机工程与科学学院 - ${category.title}`,
        description: `上海大学计算机工程与科学学院 - ${category.title}`,
        link,
        image,
        item: items,
    };
}

async function getItemDetail(item) {
    const response = await got.get(item.link);
    const $ = load(response.data);
    const content = $('.v_news_content, .wp_articlecontent, .article-content, #vsb_content, #vsb_content_2').first();

    normalizeContentUrls($, content, item.link);

    const attachments = getAttachments($, item.link);
    const description = renderDescription(content.html() || item.title, attachments);

    item.title = $('[id$=_lblTitle], .arti_title, .article-title, h1').first().text().trim() || item.title;
    item.author = $('[id$=_lblUser], .arti_publisher, .article-author').first().text().trim();
    const pubDate = $('[id$=_lblFB], .arti_update, .article-date').first().text().trim();
    if (pubDate) {
        item.pubDate = timezone(parseDate(pubDate), +8);
    }
    item.description = description;

    if (attachments[0]) {
        item.enclosure_url = attachments[0].link;
        item.enclosure_type = getEnclosureType(attachments[0]);
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

function getAttachments($, baseUrl) {
    return $('form[name="_newscontent_fromname"] ul li a[href], .v_news_content a[href], .wp_articlecontent a[href], .article-content a[href]')
        .toArray()
        .filter((element) => {
            const href = $(element).attr('href') || '';
            return /download|attach|附件|\.pdf|\.docx?|\.xlsx?|\.zip/i.test(href + $(element).text());
        })
        .map((element) => {
            const attachment = $(element);

            return {
                title: attachment.text().trim() || attachment.attr('title') || '附件',
                link: new URL(attachment.attr('href'), baseUrl).href,
            };
        });
}

function extractTitle(text) {
    return text
        .replaceAll(/\s+/g, ' ')
        .replace(/^\d{1,2}\s+\d{4}[-年./]\d{1,2}(?:[-月./]\d{1,2}日?)?\s*/, '')
        .trim();
}

function extractDate(text) {
    const dayFirst = text.match(/(\d{1,2})\s+(\d{4})-(\d{1,2})/);
    if (dayFirst) {
        return `${dayFirst[2]}-${dayFirst[3]}-${dayFirst[1].padStart(2, '0')}`;
    }

    return text.match(/\d{4}[-年./]\d{1,2}[-月./]\d{1,2}/)?.[0] || '';
}

function renderDescription(description, attachments) {
    if (attachments.length === 0) {
        return description;
    }

    const fileList = attachments.map((file) => `<li><a href="${file.link}">${escapeHtml(file.title)}</a></li>`).join('');
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
