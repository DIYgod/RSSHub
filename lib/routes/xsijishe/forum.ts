import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://xsijishe.com';

export const route: Route = {
    path: '/forum/:fid',
    categories: ['bbs'],
    example: '/xsijishe/forum/51',
    parameters: { fid: '子论坛 id' },
    features: {
        requireConfig: [
            {
                name: 'XSIJISHE_COOKIE',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: '论坛',
    maintainers: ['akynazh'],
    handler,
    description: `::: tip 关于子论坛 id 的获取方法
\`/xsijishe/forum/51\` 对应于论坛 \`https://xsijishe.com/forum-51-1.html\`，这个论坛的 fid 为 51，也就是 \`forum-{fid}-1\` 中的 fid。
:::`,
};

function parseForumDate(value?: string) {
    const text = value?.trim();
    if (!text) {
        return;
    }
    const date = parseDate(text);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function resolveForumLink(value: string | undefined, base: string) {
    if (!value) {
        return;
    }
    try {
        const link = new URL(value, base);
        return link.protocol === 'http:' || link.protocol === 'https:' ? link.href : undefined;
    } catch {
        return;
    }
}

async function fetchArticleContent(link: string, headers: { Cookie: string | undefined }): Promise<Pick<DataItem, 'description'>> {
    const resp = await got(link, { headers });
    const $ = load(resp.data);
    const post = $('[id^="post_"]').first();
    const firstViewBox = post.find('.t_f');

    firstViewBox.find('.jammer, [style*="display:none"]').remove();
    firstViewBox.append(post.find('.pattl img[zoomfile]'));
    firstViewBox.find('img').each((_, img) => {
        const $img = $(img);
        if ($img.attr('zoomfile')) {
            $img.attr('src', $img.attr('zoomfile'));
            $img.removeAttr('zoomfile');
            $img.removeAttr('file');
        }
        $img.removeAttr('onmouseover');
    });

    return { description: firstViewBox.html() };
}

async function handler(ctx) {
    const fid = ctx.req.param('fid');
    const url = `${baseUrl}/forum-${fid}-1.html`;
    const headers = {
        Cookie: config.xsijishe.cookie,
    };
    const resp = await got(url, {
        headers,
    });
    const $ = load(resp.data);
    if ($('#messagelogin').length) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'XSIJISHE_COOKIE' is set.`);
    }
    const forumCategory = $('.nex_bkinterls_top .nex_bkinterls_ls a').text();
    let items = $('[id^="normalthread"]')
        .toArray()
        .flatMap((item): Array<DataItem & { link: string }> => {
            const $item = $(item);
            const nexAuthorBtms = $item.find('.nex_author_btms');
            const nexForumtitTopA = $item.find('.nex_forumtit_top a').first();
            const link = resolveForumLink(nexForumtitTopA.attr('href'), url);
            if (!link) {
                return [];
            }
            const nexFtdate = nexAuthorBtms.find('.nex_ftdate');
            const pubDate = nexFtdate.find('span').length > 0 ? nexFtdate.find('span').attr('title') : nexFtdate.text().replace('发表于', '');
            return [
                {
                    title: nexForumtitTopA.text(),
                    pubDate: parseForumDate(pubDate),
                    category: nexAuthorBtms.find('em a').text().trim(),
                    link,
                    author: $item.find('.nex_threads_author').find('a').text().trim(),
                },
            ];
        });
    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(item.link!, () => fetchArticleContent(item.link!, headers));
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );
    return {
        title: `司机社${forumCategory}论坛`,
        link: url,
        description: `司机社${forumCategory}论坛`,
        item: items,
    };
}
