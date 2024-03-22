import { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { Context } from 'hono';

export const route: Route = {
    path: '/:category?/:tab?',
    categories: ['game'],
    example: '/2023game/sgame/topicList',
    parameters: {
        category: '分类，见下表',
        tab: '标签, 所有:all;最新:topicList;热门:jhcpb',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '游戏星辰',
    maintainers: ['xzzpig'],
    handler,
    url: 'www.2023game.com/',
    description: `分类

  | PS4游戏 | switch游戏 | 3DS游戏 | PSV游戏 | Xbox360 | PS3游戏 | 世嘉MD/SS | PSP游戏 | PC周边 | 怀旧掌机 | 怀旧主机 | PS4教程 | PS4金手指 | switch金手指 | switch教程 | switch补丁 | switch主题 | switch存档 |
  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
  | ps4 | sgame | 3ds | psv | jiaocheng | ps3yx | zhuji.md | zhangji.psp | pcgame | zhangji | zhuji | ps4.psjc | ps41.ps4pkg | nsaita.cundang | nsaita.pojie | nsaita.buding | nsaita.zhutie | nsaita.zhuti |`,
};

async function handler(ctx?: Context): Promise<Data> {
    const category = (ctx!.req.param('category') ?? 'sgame').replaceAll('.', '/');
    const tab = ctx?.req.param('tab') ?? 'all';

    const currentUrl = `https://www.2023game.com/${category}/`;

    const response = await got(currentUrl);
    const $ = load(response.data as any);

    let selector = `.news`;
    if (tab !== 'all') {
        selector = `#${tab} > ${selector}`;
    }

    const items: DataItem[] = $(selector)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const href = $item.find('a').attr('href');
            return {
                title: $item.text().trim(),
                guid: `2023game:${href}`,
                link: href!,
                pubDate: parseDate($item.find('.time_box').text().trim()),
                description: $item.html() ?? '',
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        allowEmpty: true,
        image: 'https://www.2023game.com/resources/img/logo.png',
        item: items,
    };
}
