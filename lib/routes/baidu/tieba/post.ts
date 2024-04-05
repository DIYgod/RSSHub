import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';
import path from 'node:path';

/**
 * 获取最新的帖子回复（倒序查看）
 *
 * @param {*} id 帖子ID
 * @param {number} [lz=0] 是否只看楼主（0: 查看全部, 1: 只看楼主）
 * @param {number} [pn=7e6] 帖子最大页码（默认假设为 7e6，如果超出假设则根据返回的最大页码再请求一次，否则可以节省一次请求）
 * 这个默认值我测试下来 7e6 是比较接近最大值了，因为当我输入 8e6 就会返回第一页的数据而不是最后一页了
 * @returns
 */
async function getPost(id, lz = 0, pn = 7e6) {
    const { data } = await got(`https://tieba.baidu.com/p/${id}?see_lz=${lz}&pn=${pn}&ajax=1`, {
        headers: {
            Referer: 'https://tieba.baidu.com/',
        },
    });
    const $ = load(data);
    const max = Number.parseInt($('[max-page]').attr('max-page'));
    if (max > pn) {
        return getPost(id, max);
    }
    return data;
}

export const route: Route = {
    path: ['/tieba/post/:id', '/tieba/post/lz/:id'],
    categories: ['bbs'],
    example: '/baidu/tieba/post/686961453',
    parameters: { id: '帖子 ID' },
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
            source: ['tieba.baidu.com/p/:id'],
        },
    ],
    name: '帖子动态',
    maintainers: ['u3u'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const lz = ctx.req.path.includes('lz') ? 1 : 0;
    const html = await getPost(id, lz);
    const $ = load(html);
    const title = $('.core_title_txt').attr('title');
    // .substr(3);
    const list = $('.p_postlist > [data-field]:not(:has(.ad_bottom_view))');

    return {
        title: lz ? `【只看楼主】${title}` : title,
        link: `https://tieba.baidu.com/p/${id}?see_lz=${lz}`,
        description: `${title}的最新回复`,
        item:
            list &&
            list
                .map((_, element) => {
                    const item = $(element);
                    const { author, content } = item.data('field');
                    const tempList = item
                        .find('.post-tail-wrap > .tail-info')
                        .toArray()
                        .map((element) => $(element).text());
                    let [pubContent, from, num, time] = ['', '', '', ''];
                    if (0 === tempList.length && 'date' in content) {
                        num = `${content.post_no}楼`;
                        time = content.date;
                        pubContent = item.find('.j_d_post_content').html();
                    } else if (2 === tempList.length) {
                        [num, time] = tempList;
                        pubContent = content.content;
                    } else if (3 === tempList.length) {
                        [from, num, time] = tempList;
                        pubContent = content.content;
                    }
                    return {
                        title: `${author.user_name}回复了帖子《${title}》`,
                        description: art(path.join(__dirname, '../templates/post.art'), {
                            pubContent,
                            author: author.user_name,
                            num,
                            from,
                        }),
                        pubDate: timezone(parseDate(time, 'YYYY-MM-DD hh:mm'), +8),
                        link: `https://tieba.baidu.com/p/${id}?pid=${content.post_id}#${content.post_id}`,
                    };
                })
                .get(),
    };
}
