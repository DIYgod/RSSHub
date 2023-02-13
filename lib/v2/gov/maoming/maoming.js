const { gdgov } = require('../general/general');

module.exports = async (ctx) => {
    const path = ctx.path.split('/').filter((item) => item !== '');
    let pathstartat = 0;
    let defaultPath = '';
    let list_element = '';
    let list_include = 'site';
    let title_element = '';
    let title_match = '(.*)';
    let description_element = '';
    let authorisme = '';
    let pubDate_element = '';
    let pubDate_match = '';
    // let pubDate_format = undefined;
    switch (path[1]) {
        case 'www':
            list_element = '.GsTL5 a';
            authorisme = '茂名市人民政府网';
            switch (path[2]) {
                case undefined:
                    list_element = 'h1 a, #d11_li ul a[href*="content"], .two-o ul a[href*="content"], .thr-o ul a[href*="content"]';
                    break;
                case 'jtysj':
                    pathstartat = 1;
                    defaultPath = 'gkmlpt/';
                    authorisme = '茂名市交通运输局';
                    break;
                case 'mmtyjrswj':
                    pathstartat = 1;
                    defaultPath = 'gkmlpt/';
                    authorisme = '茂名市退役军人事务局';
                    break;
                case 'mmsjj':
                    pathstartat = 1;
                    defaultPath = 'gkmlpt/';
                    authorisme = '茂名市审计局';
                    break;
                case 'mmgyzc':
                    pathstartat = 1;
                    defaultPath = 'gkmlpt/';
                    authorisme = '茂名市人民政府国有资产监督管理委员会';
                    break;
                case 'mmtjj':
                    pathstartat = 1;
                    defaultPath = 'gkmlpt/';
                    authorisme = '茂名市统计局';
                    break;
                case 'mmylbzj':
                    pathstartat = 1;
                    defaultPath = 'gkmlpt/';
                    authorisme = '茂名市医疗保障局';
                    break;
                case 'mmjrgzj':
                    pathstartat = 1;
                    defaultPath = 'gkmlpt/';
                    authorisme = '茂名市金融工作局';
                    break;
                case 'xfj':
                    pathstartat = 1;
                    defaultPath = 'gkmlpt/';
                    authorisme = '茂名市信访局';
                    break;
                case 'mmzfgjj':
                    pathstartat = 1;
                    defaultPath = 'gkmlpt/';
                    authorisme = '茂名市住房公积金管理中心';
                    break;
                case 'mmgxhzs':
                    pathstartat = 1;
                    defaultPath = 'gkmlpt/';
                    authorisme = '茂名市供销合作联社';
                    break;
                case 'mmdszbgs':
                    pathstartat = 1;
                    defaultPath = 'gkmlpt/';
                    authorisme = '茂名市地志办';
                    break;
                case 'mmjjlyslgc':
                    pathstartat = 1;
                    defaultPath = 'gkmlpt/';
                    authorisme = '茂名市高州水库管理中心';
                    break;
                case 'ywdt':
                    switch (path[3]) {
                        case undefined:
                            list_element = '#d11_li ul a[href*="content"], .two-o ul a[href*="content"]';
                            break;
                    }
                    break;
                case 'zwgk':
                    switch (path[3]) {
                        case undefined:
                            list_element = '.er-zw-l ul a';
                            break;
                        case 'zcjd':
                            switch (path[4]) {
                                case undefined:
                                    list_element = '.swiper-slide a, .bt a, .zcjdlist a';
                                    break;
                            }
                            break;
                    }
                    break;
            }
            title_element = '#ScDetailTitle';
            description_element = '#zoomcon';
            pubDate_element = '.desc span:nth-child(2)';
            pubDate_match = '日期：(.*)';
            break;
        // 不知道这种怎么做
        // case 'rd':
        //     defaultPath = 'index.php?c=category&id=12';
        //     list_element = '.news_title ul li \a'';
        //     list_include = 'all';
        //     title_element = '.article_title';
        //     title_match = '(.*)';
        //     description_element = '.article_content > *:not(.article_)';
        //     authorisme = '茂名市人大网';
        //     pubDate_element = '.op_ span:nth-child(1)';
        //     pubDate_match = '发布时间：(.*)';
        //     break;
        case 'fgj':
            list_element = '.list a';
            switch (path[2]) {
                case undefined:
                    list_element = '.item a, .index-news-list a';
                    break;
                case 'zwgk':
                    switch (path[3]) {
                        case undefined:
                            list_element = '.zw-news-list a';
                            break;
                    }
                    break;
            }
            title_element = '.title';
            description_element = '.content';
            authorisme = '茂名市发展和改革局';
            pubDate_element = '.info';
            pubDate_match = '发布时间：(.*)';
            break;
        case 'jxj':
            if (path[2] === undefined) {
                list_element = '.lanse_16, .hei_14, .NoticeInfo li a, #con_two_2 a, #con_two_3 a, .hei[href*="content"], .main2lr_main a';
            } else {
                list_element = '#main21l_main_dk > table > tbody > tr > td:nth-child(2) a';
            }
            title_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(2)';
            description_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(4)';
            authorisme = '茂名市工业和信息化局';
            pubDate_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(3) > td > table > tbody > tr > td';
            pubDate_match = '发表时间：\n(.*)';
            break;
        case 'mmjyj':
            list_element = '.news_title a';
            if (path[3] === undefined) {
                switch (path[2]) {
                    case undefined:
                        list_element = '.title0_ a, .content0 a';
                        break;
                    case 'xwzx':
                        list_element = '.news_title li a, .news_title_ li a';
                        break;
                }
            }
            title_element = '.article_title';
            description_element = '.article_body';
            authorisme = '茂名市教育局';
            pubDate_element = '.op_ span:nth-child(2)';
            pubDate_match = '发布时间：(.*)';
            break;
        case 'kjj':
            if (path[2] === undefined) {
                list_element = '.hover-content-item ul li a[href*="kjj.maoming.gov.cn"][href*="content"]';
            } else {
                list_element = '.list-right-content a[href*="kjj.maoming.gov.cn"], .list-right-content a[href*="mp.weixin.qq.com"]';
            }
            list_include = 'all';
            title_element = '.article-detail-title';
            description_element = '.article-detail-content';
            authorisme = '茂名市科学技术局';
            pubDate_element = '.article-detail-time span:nth-child(2)';
            pubDate_match = '发布时间：(.*)';
            break;
        case 'mmga':
            if (path[3] === undefined) {
                list_element = '.lnewsc a[href*="content"]';
            } else {
                list_element = '.new_list a';
            }
            title_element = '.top h2';
            description_element = '.mid.text';
            authorisme = '茂名市公安局';
            pubDate_element = '.top td:nth-child(1)';
            pubDate_match = '时间：(.*)';
            break;
        case 'smzj':
            defaultPath = 'zwgk/xxgkml/zcjd/';
            list_element = '.HK_List_ul_5 a';
            title_element = '.HTitle';
            description_element = '#mmhygs';
            authorisme = '茂名市民政局';
            pubDate_element = '.HTime';
            pubDate_match = '日期：(.*)';
            break;
        case 'sfj':
            if (path[2] === undefined) {
                list_element = '.bothA a';
            } else {
                list_element = '.list a';
            }
            title_element = '.title';
            description_element = '#context';
            authorisme = '茂名市司法局';
            pubDate_element = '.info span:nth-child(1)';
            pubDate_match = '发布时间：(.*)';
            break;
        case 'czj':
            if (path[2] === undefined) {
                list_element = '.tabContent_item a[href*="content"]';
            } else {
                list_element = '.newsList_right .clearfix a';
            }
            title_element = '.newsContainer_title';
            description_element = '.newsContainer_text';
            authorisme = '茂名市财政局';
            pubDate_element = '.time';
            pubDate_match = '(.*)';
            break;
        case 'mmrs':
            list_element = '.g-list a';
            if (path[3] === undefined) {
                switch (path[2]) {
                    case undefined:
                        list_element = '.news-box a, .new_list a, .news-box2 a[href*="content"]';
                        break;
                    case 'xwzx':
                        list_element = '.marqueetop ul li a, .special-clu ul li a, .soc-list ul li a';
                        break;
                    case 'zwxx':
                        list_element = '.marqueetop a, .gud-file ul li a, .dyn-box ul li a, .org-list a';
                        break;
                }
            }
            title_element = '.pre-box h3';
            description_element = '.pre-box .clearfix';
            authorisme = '茂名市人力资源和社会保障局网站';
            pubDate_element = '.pre-box > *:nth-child(3)';
            pubDate_match = '发布时间:(.*) ';
            break;
        case 'zrzyj':
            list_element = '.ul li a[href*="content"]';
            title_element = 'header.title h1';
            description_element = 'article.info';
            authorisme = '茂名市自然资源局';
            pubDate_element = 'header.title p span:nth-child(1)';
            pubDate_match = '日期：(.*)';
            break;
        case 'sthjj':
            if (path[3] === undefined) {
                list_element = '.item-style1 ul li a[href*="content"], #notice-box ul li a';
            } else {
                list_element = '.pull-left';
            }
            title_element = '.article_top_l p';
            title_match = '(.*)\n';
            description_element = '.txt';
            authorisme = '茂名市生态环境局';
            pubDate_element = '.article_top_l > p > :nth-child(2)';
            pubDate_match = '发布时间：(.*)';
            break;
        case 'jianshe':
            defaultPath = 'xwdt/zcjd/';
            list_element = '.listhref a';
            title_element = '#showtitlediv';
            description_element = '.aleft > *:nth-child(3)';
            authorisme = '茂名市住房和城乡建设局';
            pubDate_element = '#showtitlediv + table';
            pubDate_match = '刊登时间：(.*)，信息';
            break;
        case 'swj':
            defaultPath = 'zcjd/';
            list_element = '#lblListInfo a';
            title_element = '.HTitle';
            description_element = '#mmhygs';
            authorisme = '茂名市水务局';
            pubDate_element = '.HTime';
            pubDate_match = '日期：(.*)';
            break;
        case 'mmny':
            list_element = '.xw > a';
            switch (path[2]) {
                case undefined:
                    list_element = '.txt li a, .Tabcon ul li a';
                    break;
                case 'zsq':
                    if (path[3] !== undefined) {
                        list_element = '.img a';
                    }
                    break;
            }
            title_element = '.bt';
            title_match = '(.*)\n';
            description_element = '.lien > table > tbody > tr:nth-child(4)';
            authorisme = '茂名市农业农村局';
            pubDate_element = '.lien > table > tbody > tr:nth-child(2)';
            pubDate_match = '日期：(.*)   点击数';
            break;
        case 'lyj':
            if (path[2] === undefined) {
                list_element = '#main-slide .changeDiv a, .lycneter_all a[href*="content"]';
            } else {
                list_element = '.r_text a';
            }
            title_element = 'h3';
            description_element = '.time_r + div';
            authorisme = '茂名市林业局';
            pubDate_element = '.time_r';
            pubDate_match = '发布时间：(.*)   文章来源';
            break;
        case 'mmswj':
            if (path[2] === undefined) {
                list_element = 'div[id^="con_three_"] a, .pt6 a[href*="content"]';
            } else {
                list_element = '#main21l_main_dk > table a';
            }
            title_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(2)';
            description_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(4)';
            authorisme = '茂名市商务局';
            pubDate_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(3)';
            pubDate_match = '发表时间：(.*)';
            break;
        case 'wgxj':
            defaultPath = 'zcfg/zcjd/';
            list_element = '.com-news a';
            title_element = '.text-title h2';
            description_element = '.text-body';
            authorisme = '茂名市文化广电旅游体育局';
            pubDate_element = '.text-title p';
            pubDate_match = '最后更新： (.*)    来源';
            break;
        case 'wsjkj':
            if (path[2] === undefined) {
                list_element = '.tbv_mn a';
            } else {
                list_element = '.news_list a';
            }
            title_element = 'h1.content_title';
            description_element = '#zoomcon';
            authorisme = '茂名市卫生健康局';
            pubDate_element = '.desc span:nth-child(1)';
            pubDate_match = '发布时间：(.*)';
            break;
        case 'scj':
            if (path[2] === undefined) {
                list_element = '.title_content a';
            } else {
                list_element = '.news_list > ul > li a';
            }
            title_element = '.subject_tit';
            description_element = '#zoomcon';
            authorisme = '茂名市市场监督管理局';
            pubDate_element = '.subject_litle span:nth-child(1)';
            pubDate_match = '发布时间:(.*)';
            break;
        case 'ajj':
            if (path[2] === undefined) {
                list_element = '.picList a, .title_content a[href*="content"]';
            } else {
                list_element = '.newslist ul li a';
            }
            title_element = '.opinion_result center p:nth-child(1)';
            description_element = '.opinion_result_content';
            authorisme = '茂名市应急管理局';
            pubDate_element = '.opinion_result center p:nth-child(2) span:nth-child(1)';
            pubDate_match = '发布时间：(.*)';
            break;
        case 'cgj':
            if (path[2] === undefined) {
                list_element =
                    '#con_two_1 a[href*="cgj.maoming.gov.cn"], #con_two_1 a[href*="mp.weixin.qq.com"], .newshotkuan.pt9 .heibti[href*="cgj.maoming.gov.cn"], .newshotkuan.pt9 .heibti[href*="mp.weixin.qq.com"], .qkuan01.mt9 .heibti[href*="cgj.maoming.gov.cn"], .qkuan01.mt9 .heibti[href*="mp.weixin.qq.com"], #demo a[href*="cgj.maoming.gov.cn"], #demo a[href*="mp.weixin.qq.com"], .main3lr_main a[href*="cgj.maoming.gov.cn"], .main3lr_main a[href*="mp.weixin.qq.com"]';
            } else {
                list_element = '#main21l_main_dkc .hei[href*="cgj.maoming.gov.cn"], #main21l_main_dkc .hei[href*="mp.weixin.qq.com"]';
            }
            list_include = 'all';
            title_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(2)';
            description_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(4)';
            authorisme = '茂名市城市管理和综合执法局';
            pubDate_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(3)';
            pubDate_match = '发表时间：(.*)';
            break;
        case 'xzfw':
            defaultPath = 'zcjd/';
            list_element = '#lblListInfo a';
            title_element = '.HTitle';
            description_element = '#mmhygs';
            authorisme = '茂名市政务服务网';
            pubDate_element = '.HTime';
            pubDate_match = '发布日期：(.*)   点击率';
            break;
    }
    const info = {
        pathstartat,
        defaultPath,
        list_element,
        list_include,
        title_element,
        title_match,
        description_element,
        authorisme,
        pubDate_element,
        pubDate_match,
        // pubDate_format,
    };
    await gdgov(info, ctx);
};
