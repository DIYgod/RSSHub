import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.nogizaka46.com';

export const route: Route = {
    path: '/blog/:id?',
    categories: ['new-media'],
    example: '/nogizaka46/blog',
    parameters: { id: 'Member ID, see below, `all` by default' },
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
            source: ['blog.nogizaka46.com/s/n46/diary/MEMBER'],
            target: '/blog',
        },
    ],
    name: 'Nogizaka46 Blog 乃木坂 46 博客',
    maintainers: ['Kasper4649', 'akashigakki'],
    handler,
    url: 'blog.nogizaka46.com/s/n46/diary/MEMBER',
    description: `Member ID

  | Member ID | Name                  |
  | --------- | --------------------- |
  | 55401     | 岡本 姫奈             |
  | 55400     | 川﨑 桜               |
  | 55397     | 池田 瑛紗             |
  | 55396     | 五百城 茉央           |
  | 55395     | 中西 アルノ           |
  | 55394     | 奥田 いろは           |
  | 55393     | 冨里 奈央             |
  | 55392     | 小川 彩               |
  | 55391     | 菅原 咲月             |
  | 55390     | 一ノ瀬 美空           |
  | 55389     | 井上 和               |
  | 55387     | 弓木 奈於             |
  | 55386     | 松尾 美佑             |
  | 55385     | 林 瑠奈               |
  | 55384     | 佐藤 璃果             |
  | 55383     | 黒見 明香             |
  | 48014     | 清宮 レイ             |
  | 48012     | 北川 悠理             |
  | 48010     | 金川 紗耶             |
  | 48019     | 矢久保 美緒           |
  | 48018     | 早川 聖来             |
  | 48009     | 掛橋 沙耶香           |
  | 48008     | 賀喜 遥香             |
  | 48017     | 筒井 あやめ           |
  | 48015     | 田村 真佑             |
  | 48013     | 柴田 柚菜             |
  | 48006     | 遠藤 さくら           |
  | 36760     | 与田 祐希             |
  | 36759     | 吉田 綾乃クリスティー |
  | 36758     | 山下 美月             |
  | 36757     | 向井 葉月             |
  | 36756     | 中村 麗乃             |
  | 36755     | 佐藤 楓               |
  | 36754     | 阪口 珠美             |
  | 36753     | 久保 史緒里           |
  | 36752     | 大園 桃子             |
  | 36751     | 梅澤 美波             |
  | 36750     | 岩本 蓮加             |
  | 36749     | 伊藤 理々杏           |
  | 264       | 齋藤 飛鳥             |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'all';
    const params = id === 'all' ? '' : `?ct=${id}`;
    const currentUrl = `${rootUrl}/s/n46/api/list/blog${params}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = JSON.parse(response.data.slice(4).slice(0, -2)).data;

    return {
        allowEmpty: true,
        title: '乃木坂46 公式ブログ',
        link: 'https://www.nogizaka46.com/s/n46/diary/MEMBER',
        item:
            list &&
            list.map((item) => ({
                title: item.title,
                link: item.link,
                pubDate: parseDate(item.date),
                author: item.name,
                description: item.text,
                guid: rootUrl + new URL(item.link).pathname,
            })),
    };
}
