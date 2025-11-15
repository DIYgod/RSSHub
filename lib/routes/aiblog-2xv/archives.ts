import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    path: '/archives',
    categories: ['blog'],
    example: '/aiblog-2xv/archives',
    parameters: {},
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
            source: ['aiblog-2xv.pages.dev/archives'],
            target: '/archives',
        },
    ],
    name: '归档-全部文章',
    maintainers: ['Liao-Ke'],
    handler,
};

async function handler() {
    const baseUrl = 'https://aiblog-2xv.pages.dev';
    const response = await ofetch(`${baseUrl}/archives`);
    const $ = load(response);
    const list: any[] = [];

    // 遍历每个月份分组
    $('#top > main > div > div.archive-month').each((_, monthItem) => {
        // 遍历分组内的每篇文章
        $(monthItem)
            .find('.archive-posts .archive-entry')
            .each((_, postItem) => {
                const $post = $(postItem);
                const $link = $post.find('a').first();
                const $title = $post.find('h3').first();
                const $dateMeta = $post.find('.archive-meta span');

                list.push({
                    title: $title.text().trim(), // 去除首尾空格
                    link: $link.attr('href'),
                    // 解析发布时间和更新时间（根据页面结构调整选择器，若存在则启用）
                    pubDate: parseDate($dateMeta.eq(0).attr('title') || ''),
                    // updated: $dateMeta.eq(1).attr('title') ? parseDate($dateMeta.eq(1).attr('title')) : undefined,
                    // 若页面有作者信息，可添加：author: $post.find('.author').text().trim()
                });
            });
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                // 选择类名为“comment-body”的第一个元素
                // $('main').first().html()
                const $main = $('main').first();
                item.description = `<article>
                    <header>
                        ${$main.find('header h1').first().html()}
                        <div class="post-description">
                        ${$main.find('header .post-description').first().html()}
                        </div>

                        <div class="post-meta">
                        ${$main.find('header .post-meta').first().html()}
                        </div>
                    </header>

                    <figure class="entry-cover">
                        ${$main.find('figure').first().html()}
                    </figure>
                    
                    <div class="post-content">
                        ${$main.find('.post-content').first().html()}
                    </div>
                    </article>`;

                // 上面每个列表项的每个属性都在此重用，
                // 并增加了一个新属性“description”
                return item;
            })
        )
    );

    return {
        title: '归档-全部文章 | AI Blog', // 优化标题，增加站点标识
        link: `${baseUrl}/archives`,
        item: items.filter((item) => item.title && item.link), // 过滤无效数据
    };
}
