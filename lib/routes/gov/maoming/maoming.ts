import type { Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';

import { gdgov } from '../general/general';

export const route: Route = {
    path: '/:path{.+}',
    name: '门户网站',
    example: '/gov/maoming/www/zwgk/zcjd/jd',
    parameters: { path: '路径' },
    maintainers: ['ShuiHuo'],
    handler,
    description: `::: tip

路径处填写对应页面 URL 中茂名有关政府网站的域名最前面的部分和域名后的字段。下面是一个例子。

若订阅 [茂名市人民政府门户网站 > 政务公开 > 政策解读](http://www.maoming.gov.cn/zwgk/zcjd/jd/) 则将对应页面 URL <http://www.maoming.gov.cn/zwgk/zcjd/jd/> 中 \`http://www.maoming.gov.cn/\` 的字段 \`www\` 和 \`/zwgk/zcjd/jd/\` 作为路径填入。此时路由为 [\`/gov/maoming/www/zwgk/zcjd/jd/\`](https://rsshub.app/gov/maoming/www/zwgk/zcjd/jd/)

若订阅 [茂名市农业农村局网站 > 政务区 > 政务公开 > 通知公告](http://mmny.maoming.gov.cn/zwq/zwgk/tzgg/) 则将对应页面 URL <http://mmny.maoming.gov.cn/zwq/zwgk/tzgg/> 中 \`http://mmny.maoming.gov.cn/\` 的字段 \`mmny\` 和 \`/zwq/zwgk/tzgg/\` 作为路径填入。此时路由为 [\`/gov/maoming/mmny/zwq/zwgk/tzgg/\`](https://rsshub.app/gov/maoming/mmny/zwq/zwgk/tzgg/)

:::`,
};

async function handler(ctx) {
    const path = getSubPath(ctx)
        .split('/')
        .filter((item) => item !== '');
    let pathStartAt = 0;
    let defaultPath = '';
    let listElement: string;
    let listInclude = 'site';
    let titleElement: string;
    let titleMatch = '(.*)';
    let descriptionElement: string;
    let authorIsMe: string;
    let pubDateElement: string;
    let pubDateMatch: string;
    switch (path[1]) {
        case 'www':
            listElement = '.GsTL5 a';
            authorIsMe = '茂名市人民政府网';
            switch (path[2]) {
                case undefined:
                    listElement = 'h1 a, #d11_li ul a[href*="content"], .two-o ul a[href*="content"], .thr-o ul a[href*="content"]';
                    break;
                case 'jtysj':
                    pathStartAt = 1;
                    defaultPath = 'gkmlpt/';
                    authorIsMe = '茂名市交通运输局';
                    break;
                case 'mmtyjrswj':
                    pathStartAt = 1;
                    defaultPath = 'gkmlpt/';
                    authorIsMe = '茂名市退役军人事务局';
                    break;
                case 'mmsjj':
                    pathStartAt = 1;
                    defaultPath = 'gkmlpt/';
                    authorIsMe = '茂名市审计局';
                    break;
                case 'mmgyzc':
                    pathStartAt = 1;
                    defaultPath = 'gkmlpt/';
                    authorIsMe = '茂名市人民政府国有资产监督管理委员会';
                    break;
                case 'mmtjj':
                    pathStartAt = 1;
                    defaultPath = 'gkmlpt/';
                    authorIsMe = '茂名市统计局';
                    break;
                case 'mmylbzj':
                    pathStartAt = 1;
                    defaultPath = 'gkmlpt/';
                    authorIsMe = '茂名市医疗保障局';
                    break;
                case 'mmjrgzj':
                    pathStartAt = 1;
                    defaultPath = 'gkmlpt/';
                    authorIsMe = '茂名市金融工作局';
                    break;
                case 'xfj':
                    pathStartAt = 1;
                    defaultPath = 'gkmlpt/';
                    authorIsMe = '茂名市信访局';
                    break;
                case 'mmzfgjj':
                    pathStartAt = 1;
                    defaultPath = 'gkmlpt/';
                    authorIsMe = '茂名市住房公积金管理中心';
                    break;
                case 'mmgxhzs':
                    pathStartAt = 1;
                    defaultPath = 'gkmlpt/';
                    authorIsMe = '茂名市供销合作联社';
                    break;
                case 'mmdszbgs':
                    pathStartAt = 1;
                    defaultPath = 'gkmlpt/';
                    authorIsMe = '茂名市地志办';
                    break;
                case 'mmjjlyslgc':
                    pathStartAt = 1;
                    defaultPath = 'gkmlpt/';
                    authorIsMe = '茂名市高州水库管理中心';
                    break;
                case 'ywdt':
                    switch (path[3]) {
                        case undefined:
                            listElement = '#d11_li ul a[href*="content"], .two-o ul a[href*="content"]';
                            break;
                        default:
                            break;
                    }
                    break;
                case 'zwgk':
                    switch (path[3]) {
                        case undefined:
                            listElement = '.er-zw-l ul a';
                            break;
                        case 'zcjd':
                            switch (path[4]) {
                                case undefined:
                                    listElement = '.swiper-slide a, .bt a, .zcjdlist a';
                                    break;
                                default:
                                    break;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            titleElement = '#ScDetailTitle';
            descriptionElement = '#zoomcon';
            pubDateElement = '.desc span:nth-child(2)';
            pubDateMatch = '日期：(.*)';
            if (path[2] === 'zwgk' && path[3] === 'zcjd' && path[4] === 'jd') {
                listElement = '.common-list li a';
                titleElement = '.zw-title';
                pubDateElement = '.zw-info .time';
                pubDateMatch = String.raw`时间:\s*(.*)`;
            }
            break;
        case 'fgj':
            listElement = '.list a';
            switch (path[2]) {
                case undefined:
                    listElement = '.item a, .index-news-list a';
                    break;
                case 'zwgk':
                    switch (path[3]) {
                        case undefined:
                            listElement = '.zw-news-list a';
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            titleElement = '.title';
            descriptionElement = '.content';
            authorIsMe = '茂名市发展和改革局';
            pubDateElement = '.info';
            pubDateMatch = '发布时间：(.*)';
            break;
        case 'jxj':
            listElement = path[2] === undefined ? '.lanse_16, .hei_14, .NoticeInfo li a, #con_two_2 a, #con_two_3 a, .hei[href*="content"], .main2lr_main a' : '#main21l_main_dk > table > tbody > tr > td:nth-child(2) a';
            titleElement = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(2)';
            descriptionElement = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(4)';
            authorIsMe = '茂名市工业和信息化局';
            pubDateElement = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(3) > td > table > tbody > tr > td';
            pubDateMatch = '发表时间：\n(.*)';
            break;
        case 'mmjyj':
            listElement = '.news_title a';
            if (path[3] === undefined) {
                switch (path[2]) {
                    case undefined:
                        listElement = '.title0_ a, .content0 a';
                        break;
                    case 'xwzx':
                        listElement = '.news_title li a, .news_title_ li a';
                        break;
                    default:
                        break;
                }
            }
            titleElement = '.article_title';
            descriptionElement = '.article_body';
            authorIsMe = '茂名市教育局';
            pubDateElement = '.op_ span:nth-child(2)';
            pubDateMatch = '发布时间：(.*)';
            break;
        case 'kjj':
            listElement = path[2] === undefined ? '.hover-content-item ul li a[href*="kjj.maoming.gov.cn"][href*="content"]' : '.list-right-content a[href*="kjj.maoming.gov.cn"], .list-right-content a[href*="mp.weixin.qq.com"]';
            listInclude = 'all';
            titleElement = '.article-detail-title';
            descriptionElement = '.article-detail-content';
            authorIsMe = '茂名市科学技术局';
            pubDateElement = '.article-detail-time span:nth-child(2)';
            pubDateMatch = '发布时间：(.*)';
            break;
        case 'mmga':
            listElement = path[3] === undefined ? '.lnewsc a[href*="content"]' : '.new_list a';
            titleElement = '.top h2';
            descriptionElement = '.mid.text';
            authorIsMe = '茂名市公安局';
            pubDateElement = '.top td:nth-child(1)';
            pubDateMatch = '时间：(.*)';
            break;
        case 'smzj':
            defaultPath = 'zwgk/xxgkml/zcjd/';
            listElement = '.HK_List_ul_5 a';
            titleElement = '.HTitle';
            descriptionElement = '#mmhygs';
            authorIsMe = '茂名市民政局';
            pubDateElement = '.HTime';
            pubDateMatch = '日期：(.*)';
            break;
        case 'sfj':
            listElement = path[2] === undefined ? '.bothA a' : '.list a';
            titleElement = '.title';
            descriptionElement = '#context';
            authorIsMe = '茂名市司法局';
            pubDateElement = '.info span:nth-child(1)';
            pubDateMatch = '发布时间：(.*)';
            break;
        case 'czj':
            listElement = path[2] === undefined ? '.tabContent_item a[href*="content"]' : '.newsList_right .clearfix a';
            titleElement = '.newsContainer_title';
            descriptionElement = '.newsContainer_text';
            authorIsMe = '茂名市财政局';
            pubDateElement = '.time';
            pubDateMatch = '(.*)';
            break;
        case 'mmrs':
            listElement = '.g-list a';
            if (path[3] === undefined) {
                switch (path[2]) {
                    case undefined:
                        listElement = '.news-box a, .new_list a, .news-box2 a[href*="content"]';
                        break;
                    case 'xwzx':
                        listElement = '.marqueetop ul li a, .special-clu ul li a, .soc-list ul li a';
                        break;
                    case 'zwxx':
                        listElement = '.marqueetop a, .gud-file ul li a, .dyn-box ul li a, .org-list a';
                        break;
                    default:
                        break;
                }
            }
            titleElement = '.pre-box h3';
            descriptionElement = '.pre-box .clearfix';
            authorIsMe = '茂名市人力资源和社会保障局网站';
            pubDateElement = '.pre-box > *:nth-child(3)';
            pubDateMatch = '发布时间:(.*)\u{A0}';
            break;
        case 'zrzyj':
            listElement = '.ul li a[href*="content"]';
            titleElement = 'header.title h1';
            descriptionElement = 'article.info';
            authorIsMe = '茂名市自然资源局';
            pubDateElement = 'header.title p span:nth-child(1)';
            pubDateMatch = '日期：(.*)';
            break;
        case 'sthjj':
            listElement = path[3] === undefined ? '.item-style1 ul li a[href*="content"], #notice-box ul li a' : '.pull-left';
            titleElement = '.article_top_l p';
            titleMatch = '(.*)\n';
            descriptionElement = '.txt';
            authorIsMe = '茂名市生态环境局';
            pubDateElement = '.article_top_l > p > :nth-child(2)';
            pubDateMatch = '发布时间：(.*)';
            break;
        case 'jianshe':
            defaultPath = 'xwdt/zcjd/';
            listElement = '.listhref a';
            titleElement = '#showtitlediv';
            descriptionElement = '.aleft > *:nth-child(3)';
            authorIsMe = '茂名市住房和城乡建设局';
            pubDateElement = '#showtitlediv + table';
            pubDateMatch = '刊登时间：(.*)，信息';
            break;
        case 'swj':
            defaultPath = 'zcjd/';
            listElement = '#lblListInfo a';
            titleElement = '.HTitle';
            descriptionElement = '#mmhygs';
            authorIsMe = '茂名市水务局';
            pubDateElement = '.HTime';
            pubDateMatch = '日期：(.*)';
            break;
        case 'mmny':
            listElement = '.xw > a';
            switch (path[2]) {
                case undefined:
                    listElement = '.txt li a, .Tabcon ul li a';
                    break;
                case 'zsq':
                    if (path[3] !== undefined) {
                        listElement = '.img a';
                    }
                    break;
                default:
                    break;
            }
            titleElement = '.bt';
            titleMatch = '(.*)\n';
            descriptionElement = '.lien > table > tbody > tr:nth-child(4)';
            authorIsMe = '茂名市农业农村局';
            pubDateElement = '.lien > table > tbody > tr:nth-child(2)';
            pubDateMatch = '日期：(.*)\u{A0}\u{A0}\u{A0}点击数';
            break;
        case 'lyj':
            listElement = path[2] === undefined ? '#main-slide .changeDiv a, .lycneter_all a[href*="content"]' : '.r_text a';
            titleElement = 'h3';
            descriptionElement = '.time_r + div';
            authorIsMe = '茂名市林业局';
            pubDateElement = '.time_r';
            pubDateMatch = '发布时间：(.*)\u{A0}\u{A0}\u{A0}文章来源';
            break;
        case 'mmswj':
            listElement = path[2] === undefined ? 'div[id^="con_three_"] a, .pt6 a[href*="content"]' : '#main21l_main_dk > table a';
            titleElement = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(2)';
            descriptionElement = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(4)';
            authorIsMe = '茂名市商务局';
            pubDateElement = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(3)';
            pubDateMatch = '发表时间：(.*)';
            break;
        case 'wgxj':
            defaultPath = 'zcfg/zcjd/';
            listElement = '.com-news a';
            titleElement = '.text-title h2';
            descriptionElement = '.text-body';
            authorIsMe = '茂名市文化广电旅游体育局';
            pubDateElement = '.text-title p';
            pubDateMatch = '最后更新：\u{2002}(.*)\u{2002}\u{2002}\u{2002}\u{2002}来源';
            break;
        case 'wsjkj':
            listElement = path[2] === undefined ? '.tbv_mn a' : '.news_list a';
            titleElement = 'h1.content_title';
            descriptionElement = '#zoomcon';
            authorIsMe = '茂名市卫生健康局';
            pubDateElement = '.desc span:nth-child(1)';
            pubDateMatch = '发布时间：(.*)';
            break;
        case 'scj':
            listElement = path[2] === undefined ? '.title_content a' : '.news_list > ul > li a';
            titleElement = '.subject_tit';
            descriptionElement = '#zoomcon';
            authorIsMe = '茂名市市场监督管理局';
            pubDateElement = '.subject_litle span:nth-child(1)';
            pubDateMatch = '发布时间:(.*)';
            break;
        case 'ajj':
            listElement = path[2] === undefined ? '.picList a, .title_content a[href*="content"]' : '.newslist ul li a';
            titleElement = '.opinion_result center p:nth-child(1)';
            descriptionElement = '.opinion_result_content';
            authorIsMe = '茂名市应急管理局';
            pubDateElement = '.opinion_result center p:nth-child(2) span:nth-child(1)';
            pubDateMatch = '发布时间：(.*)';
            break;
        case 'cgj':
            listElement =
                path[2] === undefined
                    ? '#con_two_1 a[href*="cgj.maoming.gov.cn"], #con_two_1 a[href*="mp.weixin.qq.com"], .newshotkuan.pt9 .heibti[href*="cgj.maoming.gov.cn"], .newshotkuan.pt9 .heibti[href*="mp.weixin.qq.com"], .qkuan01.mt9 .heibti[href*="cgj.maoming.gov.cn"], .qkuan01.mt9 .heibti[href*="mp.weixin.qq.com"], #demo a[href*="cgj.maoming.gov.cn"], #demo a[href*="mp.weixin.qq.com"], .main3lr_main a[href*="cgj.maoming.gov.cn"], .main3lr_main a[href*="mp.weixin.qq.com"]'
                    : '#main21l_main_dkc .hei[href*="cgj.maoming.gov.cn"], #main21l_main_dkc .hei[href*="mp.weixin.qq.com"]';
            listInclude = 'all';
            titleElement = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(2)';
            descriptionElement = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(4)';
            authorIsMe = '茂名市城市管理和综合执法局';
            pubDateElement = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(3)';
            pubDateMatch = '发表时间：(.*)';
            break;
        case 'xzfw':
            defaultPath = 'zcjd/';
            listElement = '#lblListInfo a';
            titleElement = '.HTitle';
            descriptionElement = '#mmhygs';
            authorIsMe = '茂名市政务服务网';
            pubDateElement = '.HTime';
            pubDateMatch = '发布日期：(.*)\u{A0}\u{A0}\u{A0}点击率';
            break;
        default:
            throw new Error(`Unknown path[1]: ${path[1]}`);
    }
    const info = {
        pathstartat: pathStartAt,
        defaultPath,
        list_element: listElement,
        list_include: listInclude,
        title_element: titleElement,
        title_match: titleMatch,
        description_element: descriptionElement,
        authorisme: authorIsMe,
        pubDate_element: pubDateElement,
        pubDate_match: pubDateMatch,
    };
    return await gdgov(info, ctx);
}
