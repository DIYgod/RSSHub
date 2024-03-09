import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
// 来人拯救一下啊( >﹏<。)
// 待做功能：
// 1. 传入和处理
//         [] index.php?c=category&id=12
// 2. 处理其他网站链接
//         [] 其他政府网站
// 3. 添加视频内容
//         [] 示例1: http://www.dianbai.gov.cn/ywdt/dbyw/content/post_1091433.html
// 4. 处理网站功能
//        [] hdjlpt 互动交流

// 使用方法
// import { gdgov } from '../general/general';
//
// export default async (ctx) => {
//     const info = {
//         pathstartat: 1,                                              // 网站放到子目录时使用，默认为0。如 www.yunfu.gov.cn/yfsrmzf/jcxxgk/zcfg/zcjd 为一层子目录则使用 1。
//         defaultPath: 'zwgk/zcjd/',                                   // 默认路径。假设网址是 a.b.gov.cn/c/d/ 则输入 c/d/。访问 gov/b/a/ 时使用默认路径，访问 gov/b/a/c/d/ 则为指定路径。
//         name_element: 'SiteName, ColumnName',                        // 网站名，默认使用网页标题。
//         name_match_type: 'meta',                                     // 网站名类型。可选 meta（从 <meta> 中获取 content 里面的内容）、name（name_element 就是网站名）、element（选择元素从中获取文本）。
//         name_match: '(.*)',                                          // 网站名类型为 element 时使用的匹配内容。
//         name_join: '—',                                             // 网站名为 meta 或 element 时，如有多个选择器找到内容，将这里的字符串放到这些内容之间。
//         list_element: '.news_list li a',                             // 页面列表中选择具体到 a。element 都是填写 CSS 选择器。
//         list_include: 'site',                                        // 筛选列表中的页面，会生成选择器添加到 list_element 中。可选 all（包含全部）、site（仅限本站）。
//         title_element: '.content_title',                             // 正文的标题，默认使用 <meta name="ArticleTitle" content="*">
//         title_match: '(.*)',                                         // 使用正则匹配选择器获取到的文本。match 都是填写正则表达式。
//         description_element: '#zoomcon',                             // 正文。
//         author_element: undefined,                                   // 正文来源，一般是某某网站、某某媒体，默认使用 <meta name="ContentSource" content="*">。
//         author_match: undefined,                                     // 匹配正文来源。
//         authorisme: '茂名市电白区人民政府网',                        // 作者是 本网 等内容时改成这里的文本。
//         pubDate_element: 'publishtime',                              // 发布时间，默认使用 <meta name="PubDate" content="*">。
//         pubDate_match: '(.*)',                                       // 匹配发布时间。
//         pubDate_format: undefined                                    // 发布时间的格式。
//     };
//     await gdgov(info, ctx);
// };

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';
import { finishArticleItem } from '@/utils/wechat-mp';

const gdgov = async (info, ctx) => {
    const path = getSubPath(ctx)
        .split('/')
        .filter((item) => item !== '');
    const [site, branch] = path;

    // 网站
    const pathstartat = info.pathstartat === undefined ? 0 : info.pathstartat;
    let rootUrl = 'http://' + branch + '.' + site + '.gov.cn';
    for (let index = 0; index < pathstartat; index++) {
        const element = path[index + 2];
        rootUrl = rootUrl + '/' + element;
    }

    // 默认路径
    const defaultPath = info.defaultPath;

    // 网站名
    let name_element = info.name_element;
    const name_match_type = info.name_match_type;
    const name_match = info.name_match;
    const name_join = info.name_join;

    // 列表元素
    let list_element = info.list_element;
    let list_include = info.list_include;
    if (list_element === undefined) {
        list_element = 'a[href*="content"]';
        list_include = 'site';
    }
    if (list_include === 'site') {
        list_element = list_element.split(',').filter((item) => item !== '');
        for (let index = 0; index < list_element.length; index++) {
            list_element[index] += '[href*="' + rootUrl.slice(7) + '"]';
        }
        list_element = list_element.join(',');
    }

    // 标题元素
    let title_element = info.title_element;
    let title_match = info.title_match;

    // 作者（来源）元素
    const author_element = info.author_element;
    const author_match = info.author_match;
    const authorisme = info.authorisme;

    // 正文
    let description_element = info.description_element;

    // 发布时间元素
    let pubDate_element = info.pubDate_element;
    let pubDate_match = info.pubDate_match;
    let pubDate_format = info.pubDate_format;

    path.splice(0, 2 + pathstartat);
    let pathname = path.join('/');
    pathname = pathname === '' ? defaultPath : pathname.endsWith('/') ? pathname : pathname + '/';
    const currentUrl = `${rootUrl}/${pathname}`;

    let $ = '';
    let name = '';
    let list = '';
    // 判断是否处于特殊目录
    if (pathname.startsWith('gkmlpt')) {
        title_element = undefined;
        title_match = undefined;
        description_element = 'div[class="article-content"]';
        pubDate_element = undefined;
        pubDate_match = undefined;
        pubDate_format = undefined;

        const res = await got(`${rootUrl}/gkmlpt/api/all/0`);
        name = authorisme + '政府信息公开平台';
        list = res.data.articles.filter((item) => item.url.includes('content'));
    } else {
        const res = await got(currentUrl);
        const dataArray = res.data;
        $ = load(dataArray);
        switch (name_match_type) {
            case 'name':
                name = name_element;
                break;
            case 'meta':
                name_element = name_element.split(',').filter((item) => item !== '');
                for (let index = 0; index < name_element.length; index++) {
                    name_element[index] = $('meta[name="' + name_element[index].trim() + '"]').attr('content');
                }
                name = name_element.join(name_join);
                break;
            case 'element':
                name_element = name_element.split(',').filter((item) => item !== '');
                for (let index = 0; index < name_element.length; index++) {
                    name_element[index] = $(name_element[index].trim()).text().match(name_match)[1];
                }
                name = name_element.join(name_join);
                break;
            default:
                name = $('head title').text();
                break;
        }
        list = $(list_element);
    }

    const lists = list.map((i, item) => {
        let link = '';

        if (pathname.startsWith('gkmlpt')) {
            link = i.url;
        } else {
            link = $(item).attr('href');
            // 判断获取到的链接是否完整，不完整则补全。
            if (!link.startsWith('http')) {
                link.startsWith('/') ? (link = `${rootUrl}${link}`) : (link = `${rootUrl}/${link}`);
            }
        }

        return link;
    });

    const items = await Promise.all(
        lists.map((link) => {
            const idlink = new URL(link);

            if (idlink.pathname === '/zcjdpt') {
                // http://www.dg.gov.cn/zcjdpt?id=4798
                // http://smzj.maoming.gov.cn/zcjdpt?id=4595
                // http://fgj.maoming.gov.cn/zcjdpt?id=4993
                // https://zcjd.cloud.gd.gov.cn/api/home/article?id=4993
                return cache.tryGet(link, async () => {
                    const zcjdlink = 'https://zcjd.cloud.gd.gov.cn/api/home/article' + idlink.search;
                    const response = await got(zcjdlink);
                    const data = response.data.data;
                    for (let index = 0; index < data.jie_du_items.length; index++) {
                        data.jie_du_items[index].jd_content = data.jie_du_items[index].jd_content.replaceAll(/((\n {4})|(\n))/g, '</p><p style="font-size: 16px;line-height: 32px;text-indent: 2em;">');
                    }

                    return {
                        link,
                        title: data.art_title,
                        description: art(__dirname + '/templates/zcjdpt.art', data),
                        pubDate: timezone(parseDate(data.pub_time), +8),
                        author: /(本|本网|本站)/.test(data.pub_unite) ? authorisme : data.pub_unite,
                    };
                });
            } else if (idlink.host === 'mp.weixin.qq.com') {
                return finishArticleItem({ link });
            } else {
                return cache.tryGet(link, async () => {
                    // 获取网页
                    const { data: res } = await got(link);
                    const content = load(res);

                    // 获取来源
                    let author = '';
                    author = author_element === undefined ? content('meta[name="ContentSource"]').attr('content') : content(author_element).text().trim().match(author_match)[1].trim().replaceAll(/(-*$)/g, '');

                    // 获取发布时间
                    let pubDate = '';
                    pubDate = pubDate_element === undefined ? content('meta[name="PubDate"]').attr('content') : content(pubDate_element).text().trim().match(pubDate_match)[1].trim().replaceAll(/(-*$)/g, '');

                    // 获取标题
                    let title = '';
                    title = title_element === undefined ? content('meta[name="ArticleTitle"]').attr('content') : content(title_element).text().trim().match(title_match)[1];
                    // 获取正文
                    const description_content = description_element.split(',').filter((item) => item !== '');
                    for (let index = 0; index < description_content.length; index++) {
                        description_content[index] = content(description_content[index].trim()).html();
                    }
                    const description = description_content.join('');

                    return {
                        link,
                        title,
                        description,
                        pubDate: timezone(parseDate(pubDate, pubDate_format), +8),
                        author: /本|本网|本站/.test(author) ? authorisme : author,
                    };
                });
            }
        })
    );

    return {
        title: name,
        link: currentUrl,
        item: items,
    };
};

export { gdgov };
