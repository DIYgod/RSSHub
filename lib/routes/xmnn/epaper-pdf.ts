import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { AMUCSITE_ROOT, paperNames, resolveHxcbNodeUrl } from './utils';

export const route: Route = {
    path: '/pdf/:id?',
    categories: ['traditional-media'],
    example: '/xmnn/pdf/xmrb',
    parameters: {
        id: {
            description: '报纸 id，见下表，默认为 `xmrb`，即厦门日报',
            default: 'xmrb',
            options: [
                { value: 'xmrb', label: '厦门日报' },
                { value: 'xmwb', label: '厦门晚报' },
                { value: 'csjb', label: '城市捷报' },
                { value: 'syzk', label: '双语周刊' },
                { value: 'hxcb', label: '海西晨报' },
            ],
        },
    },
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
            source: ['epaper.xmrb.com/:id/pc/col/index.html'],
            target: '/pdf/:id',
        },
        {
            source: ['dzb.sunnews.cn/'],
            target: '/pdf/hxcb',
        },
    ],
    name: '数字报 PDF',
    maintainers: ['nczitzk'],
    handler,
    description: `订阅各报纸版面 PDF。每个 item 对应一个版面，\`enclosure_url\` 指向该版面 PDF 直链。

| 厦门日报 | 厦门晚报 | 城市捷报 | 双语周刊 | 海西晨报 |
| -------- | -------- | -------- | -------- | -------- |
| xmrb     | xmwb     | csjb     | syzk     | hxcb     |`,
};

function handler(ctx): Promise<Data> {
    const id = ctx.req.param('id') ?? 'xmrb';

    if (id === 'hxcb') {
        return fetchHxcbPdfs();
    }
    if (['xmrb', 'xmwb', 'csjb', 'syzk'].includes(id)) {
        return fetchAmucsitePdfs(id);
    }
    throw new Error(`Unsupported paper id: ${id}. Supported ids: xmrb, xmwb, csjb, syzk, hxcb`);
}

// Amucsite PDFs: fetch each version page to get both the PDF link and the full-page preview image
async function fetchAmucsitePdfs(id: string): Promise<Data> {
    const listUrl = `${AMUCSITE_ROOT}/${id}/pc/col/index.html`;
    const listHtml = await ofetch(listUrl, { responseType: 'text' });
    const $list = load(listHtml);

    // Collect all version page URLs from the list page
    const versionUrls: string[] = [];
    $list('ul#list > li > a').each((_, el) => {
        const href = $list(el).attr('href');
        if (href) {
            versionUrls.push(new URL(href, listUrl).href);
        }
    });

    if (versionUrls.length === 0) {
        throw new Error(`No version links found on ${listUrl}`);
    }

    // Fetch all version pages in parallel to extract name, PDF, and preview image
    const versionPages = await Promise.all(
        versionUrls.map(async (url) => {
            const html = await ofetch(url, { responseType: 'text' });
            const $v = load(html);

            const versionName = $v('span#layout')
                .text()
                .trim()
                .replace(/：\s*$/, '');
            const pdfHref = $v('a[href$=".pdf"]').first().attr('href');
            const previewSrc = $v('img.preview').attr('src');

            return {
                versionUrl: url,
                versionName,
                pdfUrl: pdfHref ? new URL(pdfHref, url).href : undefined,
                imageUrl: previewSrc ? new URL(previewSrc.replaceAll(/\.2$/g, ''), url).href : undefined,
                pubDateText: $v('span#paperdate').text().trim(),
            };
        })
    );

    const pubDate = versionPages[0]?.pubDateText ? timezone(parseDate(versionPages[0].pubDateText, 'YYYY-MM-DD'), 8) : undefined;

    const items: DataItem[] = [];
    for (const page of versionPages) {
        if (!page.versionName || !page.pdfUrl) {
            continue;
        }
        const descriptionParts: string[] = [];
        if (page.imageUrl) {
            descriptionParts.push(`<img src="${page.imageUrl}" alt="${page.versionName}">`);
        }
        descriptionParts.push(`<a href="${page.pdfUrl}">下载 ${page.versionName} PDF</a>`);

        const item: DataItem = {
            title: page.versionName,
            description: descriptionParts.join('<br>'),
            link: page.versionUrl,
            enclosure_url: page.pdfUrl,
            enclosure_type: 'application/pdf',
            enclosure_title: page.versionName,
        };
        if (pubDate) {
            item.pubDate = pubDate;
        }
        items.push(item);
    }

    const paperName = paperNames[id] ?? id;
    return {
        title: `${paperName}数字报 PDF`,
        link: listUrl,
        item: items,
    };
}

// Hxcb PDFs: fetch each version page to get the full-page preview image alongside the PDF link
async function fetchHxcbPdfs(): Promise<Data> {
    const nodeUrl = await resolveHxcbNodeUrl();
    const nodeHtml = await ofetch(nodeUrl, { responseType: 'text' });
    const $node = load(nodeHtml);

    const todayText = $node('li.today').text().trim();
    const dateMatch = todayText.match(/(\d{4}年\d{2}月\d{2}日)/);
    const pubDate = dateMatch ? timezone(parseDate(dateMatch[1], 'YYYY年MM月DD日'), 8) : undefined;

    // Collect version URLs from the 版面导航 table
    const versionUrls: string[] = [];
    const versionNames: string[] = [];
    const pdfUrls: string[] = [];
    $node('#bmdh table tbody tr').each((_, el) => {
        const $row = $node(el);
        const $link = $row.find('a#pageLink');
        const versionName = $link.text().trim();
        const versionHref = $link.attr('href');
        const $pdfLink = $row.find('a[href*=".pdf"]');
        const pdfHref = $pdfLink.attr('href');
        if (!versionName || !versionHref || !pdfHref) {
            return;
        }
        versionUrls.push(new URL(versionHref, nodeUrl).href);
        versionNames.push(versionName);
        pdfUrls.push(new URL(pdfHref, nodeUrl).href);
    });

    // Fetch each version page in parallel to extract the full-page preview image
    const imageUrls = await Promise.all(
        versionUrls.map(async (url) => {
            try {
                const html = await ofetch(url, { responseType: 'text' });
                const $v = load(html);
                const previewSrc = $v('img[usemap*="PagePicMap"]').attr('src') ?? $v('img[USEMAP*="PagePicMap"]').attr('src');
                return previewSrc ? new URL(previewSrc, url).href : '';
            } catch {
                return '';
            }
        })
    );

    const items: DataItem[] = [];
    for (let i = 0; i < versionUrls.length; i++) {
        const descriptionParts: string[] = [];
        if (imageUrls[i] !== '') {
            descriptionParts.push(`<img src="${imageUrls[i]}" alt="${versionNames[i]}">`);
        }
        descriptionParts.push(`<a href="${pdfUrls[i]}">下载 ${versionNames[i]} PDF</a>`);

        const item: DataItem = {
            title: versionNames[i],
            description: descriptionParts.join('<br>'),
            link: versionUrls[i],
            enclosure_url: pdfUrls[i],
            enclosure_type: 'application/pdf',
            enclosure_title: versionNames[i],
        };
        if (pubDate) {
            item.pubDate = pubDate;
        }
        items.push(item);
    }

    return {
        title: '海西晨报数字报 PDF',
        link: nodeUrl,
        item: items,
    };
}
