import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const rootUrl = 'https://news.163.com';

const config = {
    whole: {
        link: '/special/0001386F/rank_whole.html',
        title: '全站',
    },
    news: {
        link: '/special/0001386F/rank_news.html',
        title: '新闻',
    },
    entertainment: {
        link: '/special/0001386F/rank_ent.html',
        title: '娱乐',
    },
    sports: {
        link: '/special/0001386F/rank_sports.html',
        title: '体育',
    },
    money: {
        link: 'https://money.163.com/special/002526BH/rank.html',
        title: '财经',
    },
    tech: {
        link: '/special/0001386F/rank_tech.html',
        title: '科技',
    },
    auto: {
        link: '/special/0001386F/rank_auto.html',
        title: '汽车',
    },
    lady: {
        link: '/special/0001386F/rank_lady.html',
        title: '女人',
    },
    house: {
        link: '/special/0001386F/rank_house.html',
        title: '房产',
    },
    game: {
        link: '/special/0001386F/game_rank.html',
        title: '游戏',
    },
    travel: {
        link: '/special/0001386F/rank_travel.html',
        title: '旅游',
    },
    edu: {
        link: '/special/0001386F/rank_edu.html',
        title: '教育',
    },
};

const timeRange = {
    hour: {
        index: 0,
        title: '1小时',
    },
    day: {
        index: 1,
        title: '24小时',
    },
    week: {
        index: 2,
        title: '本周',
    },
    month: {
        index: 3,
        title: '本月',
    },
};

export const route: Route = {
    path: '/news/rank/:category?/:type?/:time?',
    categories: ['new-media'],
    example: '/163/news/rank/whole/click/day',
    parameters: {
        category: '新闻分类，参见下表，默认为“全站”',
        type: '排行榜类型，“点击榜”对应`click`，“跟贴榜”对应`follow`，默认为“点击榜”',
        time: '统计时间，“1小时”对应`hour`，“24小时”对应`day`，“本周”对应`week`，“本月”对应`month`，默认为“24小时”',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '排行榜',
    maintainers: ['nczitzk'],
    handler,
    description: `:::tip
  全站新闻 **点击榜** 的统计时间仅包含 “24 小时”、“本周”、“本月”，不包含 “1 小时”。即可用的\`time\`参数为\`day\`、\`week\`、\`month\`。

  其他分类 **点击榜** 的统计时间仅包含 “1 小时”、“24 小时”、“本周”。即可用的\`time\`参数为\`hour\`、\`day\`、\`week\`。

  而所有分类（包括全站）的 **跟贴榜** 的统计时间皆仅包含 “24 小时”、“本周”、“本月”。即可用的\`time\`参数为\`day\`、\`week\`、\`month\`。
  :::

  新闻分类：

  | 全站  | 新闻 | 娱乐          | 体育   | 财经  | 科技 | 汽车 | 女人 | 房产  | 游戏 | 旅游   | 教育 |
  | ----- | ---- | ------------- | ------ | ----- | ---- | ---- | ---- | ----- | ---- | ------ | ---- |
  | whole | news | entertainment | sports | money | tech | auto | lady | house | game | travel | edu  |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') || 'whole';
    const type = ctx.req.param('type') || 'click';
    const time = ctx.req.param('time') || 'day';

    const cfg = config[category];
    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/new-media#wang-yi-xin-wen-pai-hang-bang">docs</a>');
    } else if ((category !== 'whole' && type === 'click' && time === 'month') || (category === 'whole' && type === 'click' && time === 'hour') || (type === 'follow' && time === 'hour')) {
        throw new InvalidParameterError('Bad timeRange range. See <a href="https://docs.rsshub.app/routes/new-media#wang-yi-xin-wen-pai-hang-bang">docs</a>');
    }

    const currentUrl = category === 'money' ? cfg.link : `${rootUrl}${cfg.link}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response.data, 'gbk'));

    const list = $('div.tabContents')
        .eq(timeRange[time].index + (category === 'whole' ? (type === 'click' ? -1 : 2) : type === 'click' ? 0 : 2))
        .find('table tbody tr td a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    let link;
                    if (category === 'auto' || category === 'house' || category === 'travel') {
                        const category = item.link.split('.163.com')[0].split('//').pop().split('.').pop();
                        link = `https://3g.163.com/${category}/article/${item.link.split('/').pop()}`;
                    } else {
                        const pathname = new URL(item.link).pathname;
                        link = `https://3g.163.com${pathname}`;
                    }

                    const detailResponse = await got({
                        method: 'get',
                        url: link,
                    });
                    const content = load(detailResponse.data);

                    content('.bot_word, .js-open-app, .s-img').remove();
                    content('video').each(function () {
                        content(this).attr('src', content(this).attr('data-src'));
                    });
                    content('.article-body .image-lazy').each((_, elem) => {
                        elem.attribs.src = elem.attribs['data-src'] ?? elem.attribs.src;
                    });

                    item.title = content('meta[property="og:title"]').attr('content').replace('_手机网易网', '');
                    item.pubDate = parseDate(content('meta[property="og:release_date"]').attr('content'));
                    item.description = content('.article-body').html();
                } catch {
                    return '';
                }

                return item;
            })
        )
    );

    return {
        title: `网易新闻${timeRange[time].title}${type === 'click' ? '点击' : '跟帖'}榜 - ${cfg.title}`,
        link: currentUrl,
        item: items.filter(Boolean),
    };
}
