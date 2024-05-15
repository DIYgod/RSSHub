import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate, parseDate } from '@/utils/parse-date';

const baseUrl = 'https://bbs.kanxue.com/';
const categoryId = {
    iot: [128, '智能设备'],
    android: [161, 'Android安全'],
    ios: [166, 'iOS安全'],
    harmonyos: [178, 'HarmonyOS安全'],
    re: [4, '软件逆向'],
    coding: [41, '编程技术'],
    unpack: [88, '加壳脱壳'],
    crypto: [132, '密码应用'],
    vuln: [150, '二进制漏洞'],
    ctf: [37, 'CTF对抗'],
    pwn: [171, 'Pwn'],
    web: [151, 'WEB安全'],
    chat: [45, '茶余饭后'],
    geekzone: [172, '极客空间'],
    translate: [32, '外文翻译'],
};

export const route: Route = {
    path: '/topic/:category?/:type?',
    categories: ['bbs'],
    example: '/kanxue/topic/android/digest',
    parameters: { category: '版块, 缺省为`all`', type: '类型, 缺省为`latest`' },
    name: '论坛',
    maintainers: ['renzhexigua'],
    handler,
    description: `| 版块           | category  |
    | -------------- | --------- |
    | 智能设备       | iot       |
    | Android 安全   | android   |
    | iOS 安全       | ios       |
    | HarmonyOS 安全 | harmonyos |
    | 软件逆向       | re        |
    | 编程技术       | coding    |
    | 加壳脱壳       | unpack    |
    | 密码应用       | crypto    |
    | 二进制漏洞     | vuln      |
    | CTF 对抗       | ctf       |
    | Pwn            | pwn       |
    | WEB 安全       | web       |
    | 茶余饭后       | chat      |
    | 极客空间       | geekzone  |
    | 外文翻译       | translate |
    | 全站           | all       |
    
    | 类型     | type   |
    | -------- | ------ |
    | 最新主题 | latest |
    | 精华主题 | digest |`,
};

const timeDiff = 1000 * 60 * 60 * 24 * 3;

async function handler(ctx) {
    const category = ctx.req.param('category') || 'all';
    const type = ctx.req.param('type') || 'latest';
    let path;
    let title;
    if (Object.hasOwn(categoryId, category)) {
        if (type === 'digest') {
            // type为digest时只获取精华帖
            path = `forum-${categoryId[category][0]}-1.htm?digest=1`;
            title = `看雪论坛精华主题 - ${categoryId[category][1]}`;
        } else {
            // type为空/非法/latest时则只获取最新帖
            path = `forum-${categoryId[category][0]}.html`;
            title = `看雪论坛最新主题 - ${categoryId[category][1]}`;
        }
    } else {
        // category未知时则获取全站最新帖
        if (category === 'digest') {
            path = 'new-digest.htm';
            title = '看雪论坛精华主题';
        } else {
            path = 'new-tid.htm';
            title = '看雪论坛最新主题';
        }
    }

    const response = await got({
        method: 'get',
        url: baseUrl + path,
        headers: {
            Referer: baseUrl,
        },
    });

    const $ = load(response.data);
    const list = $('.thread');

    const resultItem = await Promise.all(
        list
            ? list
                  // fix .thread .top_3
                  .filter((_, elem) => {
                      const timeStr = $('.date', elem).eq(0).text();
                      const pubDate = timeStr.endsWith('前') ? parseRelativeDate(timeStr) : parseDate(timeStr.substring(1));
                      return !elem.attribs.class.includes('top') || Date.now() - pubDate.valueOf() < timeDiff;
                  })
                  .map((_, elem) => {
                      const subject = $('.subject a', elem).eq(1);
                      const timeStr = $('.date', elem).eq(0).text();
                      const pubDate = timeStr.endsWith('前') ? parseRelativeDate(timeStr) : parseDate(timeStr.substring(1));

                      const link = `${baseUrl}${subject.attr('href')}`;
                      const key = `kanxue: ${link}`;

                      return cache.tryGet(key, async () => {
                          const postDetail = await got({
                              method: 'get',
                              url: link,
                          });
                          const $ = load(postDetail.data);
                          $('.card')
                              .eq(0)
                              .find('.message img')
                              .each((_, item) => {
                                  item = $(item);

                                  const src = item.attr('src');
                                  if (src !== undefined && !src.startsWith('https://') && !src.startsWith('http://')) {
                                      item.attr('src', `https://bbs.kanxue.com/${src}`);
                                  }
                              });

                          const description = $('.card').eq(0).find('.message').html();

                          return {
                              title: subject.text(),
                              link,
                              pubDate,
                              description,
                          };
                      });
                  })
                  .get()
            : []
    );

    return {
        title,
        link: baseUrl + path,
        item: resultItem,
        allowEmpty: true,
    };
}
