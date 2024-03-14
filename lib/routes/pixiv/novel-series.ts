import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import cache from '@/utils/cache';
import { getToken } from './token';
import getNovelSeries from './api/get-novel-series';
import getNovelContent from './api/get-novel-content';

const novelTextRe = /"text":"(.+?[^\\])"/;

export const route: Route = {
    path: '/novel/series/:id',
    categories: ['social-media'],
    example: '/pixiv/user/novels/1394738',
    parameters: { id: "Novel series id, available in novel series' homepage URL" },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['www.pixiv.net/novel/series/:id'],
    },
    name: 'Novel Series',
    maintainers: ['keocheung'],
    handler,
};

async function handler(ctx) {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new Error('pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }

    const id = ctx.req.param('id');
    let limit = Number.parseInt(ctx.req.query('limit')) || 10;
    if (limit > 30) {
        limit = 30;
    }
    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new Error('pixiv not login');
    }

    let novelSeriesResponse = await getNovelSeries(id, 0, token);
    const contentCount = Number.parseInt(novelSeriesResponse.data.novel_series_detail.content_count);
    if (contentCount > limit) {
        novelSeriesResponse = await getNovelSeries(id, contentCount - limit, token);
    }

    const novels = novelSeriesResponse.data.novels.reverse().map((novel) => ({
        novelId: novel.id,
        title: novel.title,
        author: novel.user.name,
        pubDate: parseDate(novel.create_date),
        link: `https://www.pixiv.net/novel/show.php?id=${novel.id}`,
    }));

    const items = await Promise.all(
        novels.map((novel) =>
            cache.tryGet(novel.link, async () => {
                const content = await getNovelContent(novel.novelId, token);
                const rawText = novelTextRe.exec(content.data)[1];
                novel.description = `<p>${unescape(rawText.replaceAll('\\u', '%u'))}</p>`
                    .replaceAll('\\n', '</p><p>')
                    .replaceAll('\\t', '\t')
                    .replaceAll('\\', '')
                    .replaceAll(/\[\[rb:(.+?) > (.+?)]]/g, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>')
                    .replaceAll(/\[pixivimage:(\d+-\d+)]/g, `<p><img src="${config.pixiv.imgProxy}/$1.jpg"></p>`);
                return novel;
            })
        )
    );

    return {
        title: novelSeriesResponse.data.novel_series_detail.title,
        link: `https://www.pixiv.net/novel/series/${id}`,
        description: novelSeriesResponse.data.novel_series_detail.caption,
        item: items,
    };
}
