const { gdgov } = require('../general/general');

module.exports = async (ctx) => {
    const path = ctx.path.split('/').filter((item) => item !== '');
    const branch = path[1];
    let defaultPath = '';
    let list_element = '';
    let title_element = '';
    let title_match = '';
    let description_element = '';
    let author_element = '';
    let author_match = '';
    let authorisme = '';
    let pubDate_element = '';
    let pubDate_match = '';
    let pubDate_format = '';
    switch (branch) {
        case 'www':
            defaultPath = 'zwgk/zcjd/jd/';
            list_element = '.GsTL5 a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '#ScDetailTitle';
            title_match = '(.*)';
            description_element = '#zoomcon';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市人民政府网';
            pubDate_element = '.desc span:nth-child(2)';
            pubDate_match = '日期：(.*)';
            pubDate_format = undefined;
            break;
        // 不知道这种怎么做
        // case 'rd':
        //     defaultPath = 'index.php?c=category&id=12';
        //     list_element = '.news_title ul li \a''
        //     title_element = '.article_title'
        //     title_match = '(.*)'
        //     description_element = '.article_content > *:not(.article_)'
        //     author_element = undefined;
        //     author_match = undefined;
        //     authorisme = '茂名市人大网'
        //     pubDate_element = '.op_ span:nth-child(1)'
        //     pubDate_match = '发布时间：(.*)'
        //     pubDate_format = undefined
        //     break;
        case 'fgj':
            defaultPath = 'fzgh/zcjd/';
            list_element = '.list a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.title';
            title_match = '(.*)';
            description_element = '.content';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市发展和改革局';
            pubDate_element = '.info';
            pubDate_match = '发布时间：(.*)';
            pubDate_format = undefined;
            break;
        case 'jxj':
            defaultPath = 'zwgk/zcjd/';
            list_element = '#main21l_main_dk > table > tbody > tr > td:nth-child(2) a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(2)';
            title_match = '(.*)';
            description_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(4)';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市工业和信息化局';
            pubDate_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(3) > td > table > tbody > tr > td';
            pubDate_match = '发表时间：\n(.*)';
            pubDate_format = undefined;
            break;
        case 'mmjyj':
            defaultPath = 'zcfg/zcjd/';
            list_element = '.news_title a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.article_title';
            title_match = '(.*)';
            description_element = '.article_body';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市教育局';
            pubDate_element = '.op_ span:nth-child(2)';
            pubDate_match = '发布时间：(.*)';
            pubDate_format = undefined;
            break;
        case 'kjj':
            defaultPath = 'zwgk/zcjd/';
            list_element = '.list-right-content a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.article-detail-title';
            title_match = '(.*)';
            description_element = '.article-detail-content';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市科学技术局';
            pubDate_element = '.article-detail-time span:nth-child(2)';
            pubDate_match = '发布时间：(.*)';
            pubDate_format = undefined;
            break;
        case 'mmga':
            defaultPath = 'zwgk/zcjd/';
            list_element = '.new_list a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.top h2';
            title_match = '(.*)';
            description_element = '.mid.text';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市公安局';
            pubDate_element = '.top td:nth-child(1)';
            pubDate_match = '时间：(.*)';
            pubDate_format = undefined;
            break;
        case 'smzj':
            defaultPath = 'zwgk/xxgkml/zcjd/';
            list_element = '.HK_List_ul_5 a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.HTitle';
            title_match = '(.*)';
            description_element = '#mmhygs';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市民政局';
            pubDate_element = '.HTime';
            pubDate_match = '日期：(.*)';
            pubDate_format = undefined;
            break;
        case 'sfj':
            defaultPath = 'zwgk/gzwj/zcfg/zcjd/';
            list_element = '.list a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.title';
            title_match = '(.*)';
            description_element = '#context';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市司法局';
            pubDate_element = '.info span:nth-child(1)';
            pubDate_match = '发布时间：(.*)';
            pubDate_format = undefined;
            break;
        case 'czj':
            defaultPath = 'zwgk/tzgg/';
            list_element = '.newsList_right .clearfix a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.newsContainer_title';
            title_match = '(.*)';
            description_element = '.newsContainer_text';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市财政局';
            pubDate_element = '.time';
            pubDate_match = '(.*)';
            pubDate_format = undefined;
            break;
        case 'mmrs':
            defaultPath = 'zmhd/zcjd/';
            list_element = '.g-list a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.pre-box h3';
            title_match = '(.*)';
            description_element = '.pre-box .clearfix';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市人力资源和社会保障局网站';
            pubDate_element = '.pre-box > *:nth-child(3)';
            pubDate_match = '发布时间:(.*) ';
            pubDate_format = undefined;
            break;
        case 'zrzyj':
            defaultPath = 'zwgk/zcjd/zcjd/';
            list_element = '.PicList000960 a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = 'header.title h1';
            title_match = '(.*)';
            description_element = 'article.info';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市自然资源局';
            pubDate_element = 'header.title p span:nth-child(1)';
            pubDate_match = '日期：(.*)';
            pubDate_format = undefined;
            break;
        case 'sthjj':
            defaultPath = 'ztzl/zcjd/';
            list_element = 'a[href*="sthjj.maoming.gov.cn"].pull-left';
            title_element = '.article_top_l p';
            title_match = '(.*)\n';
            description_element = '.txt';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市生态环境局';
            pubDate_element = '.article_top_l > p > :nth-child(2)';
            pubDate_match = '发布时间：(.*)';
            pubDate_format = undefined;
            break;
        case 'jianshe':
            defaultPath = 'xwdt/zcjd/';
            list_element = '.listhref a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '#showtitlediv';
            title_match = '(.*)';
            description_element = '.aleft > *:nth-child(3)';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市住房和城乡建设局';
            pubDate_element = '#showtitlediv + table';
            pubDate_match = '刊登时间：(.*)，信息';
            pubDate_format = undefined;
            break;
        case 'swj':
            defaultPath = 'zcjd/';
            list_element = '#lblListInfo a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.HTitle';
            title_match = '(.*)';
            description_element = '#mmhygs';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市水务局';
            pubDate_element = '.HTime';
            pubDate_match = '日期：(.*)';
            pubDate_format = undefined;
            break;
        case 'mmny':
            defaultPath = 'zcjd/';
            list_element = '.xw > a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.bt';
            title_match = '(.*)\n';
            description_element = '.lien > table > tbody > tr:nth-child(4)';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市农业农村局';
            pubDate_element = '.lien > table > tbody > tr:nth-child(2)';
            pubDate_match = '日期：(.*)   点击数';
            pubDate_format = undefined;
            break;
        case 'lyj':
            defaultPath = 'zwgk/zcjd/';
            list_element = '.r_text a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = 'h3';
            title_match = '(.*)';
            description_element = '.time_r + div';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市林业局';
            pubDate_element = '.time_r';
            pubDate_match = '发布时间：(.*)   文章来源';
            pubDate_format = undefined;
            break;
        case 'mmswj':
            defaultPath = 'xxgk/zcjd/';
            list_element = '#main21l_main_dk > table a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(2)';
            title_match = '(.*)';
            description_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(4)';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市商务局';
            pubDate_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(3)';
            pubDate_match = '发表时间：(.*)';
            pubDate_format = undefined;
            break;
        case 'wgxj':
            defaultPath = 'zcfg/zcjd/';
            list_element = '.com-news a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.text-title h2';
            title_match = '(.*)';
            description_element = '.text-body';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市文化广电旅游体育局';
            pubDate_element = '.text-title p';
            pubDate_match = '最后更新： (.*)    来源';
            pubDate_format = undefined;
            break;
        case 'wsjkj':
            defaultPath = 'ywgl/zcjd/';
            list_element = '.news_list a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = 'h1.content_title';
            title_match = '(.*)';
            description_element = '#zoomcon';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市卫生健康局';
            pubDate_element = '.desc span:nth-child(1)';
            pubDate_match = '发布时间：(.*)';
            pubDate_format = undefined;
            break;
        case 'scj':
            defaultPath = 'zwgk/zcjd/';
            list_element = '.news_list > ul > li a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.subject_tit';
            title_match = '(.*)';
            description_element = '#zoomcon';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市市场监督管理局';
            pubDate_element = '.subject_litle span:nth-child(1)';
            pubDate_match = '发布时间:(.*)';
            pubDate_format = undefined;
            break;
        case 'ajj':
            defaultPath = 'zwgk/zcjd/';
            list_element = '.newslist ul li a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.opinion_result center p:nth-child(1)';
            title_match = '(.*)';
            description_element = '.opinion_result_content';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市应急管理局';
            pubDate_element = '.opinion_result center p:nth-child(2) span:nth-child(1)';
            pubDate_match = '发布时间：(.*)';
            pubDate_format = undefined;
            break;
        case 'cgj':
            defaultPath = 'zwgk/zcjd/';
            list_element = '#main21l_main_dkc > table > tbody > tr > td:nth-child(2) a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(2)';
            title_match = '(.*)';
            description_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(4)';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市城市管理和综合执法局';
            pubDate_element = 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(3)';
            pubDate_match = '发表时间：(.*)';
            pubDate_format = undefined;
            break;
        case 'xf':
            defaultPath = 'zcfg/';
            list_element = '.kuang2 > tbody > tr > td:nth-child(2) a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.shaw > tbody > tr > td > table > tbody > tr:nth-child(3)';
            title_match = '(.*)';
            description_element = '#zoom';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市信访网';
            pubDate_element = '.shaw > tbody > tr > td > table > tbody > tr:nth-child(5) > td > div > span.index_text4';
            pubDate_match = '(.*)';
            pubDate_format = 'YYYY年MM月DD日';
            break;
        case 'xzfw':
            defaultPath = 'zcjd/';
            list_element = '#lblListInfo a[href*="' + branch + '.maoming.gov.cn"]';
            title_element = '.HTitle';
            title_match = '(.*)';
            description_element = '#mmhygs';
            author_element = undefined;
            author_match = undefined;
            authorisme = '茂名市政务服务网';
            pubDate_element = '.HTime';
            pubDate_match = '发布日期：(.*)   点击率';
            pubDate_format = undefined;
            break;
    }
    const info = {
        defaultPath,
        list_element,
        title_element,
        title_match,
        description_element,
        author_element,
        author_match,
        authorisme,
        pubDate_element,
        pubDate_match,
        pubDate_format,
    };
    await gdgov(info, ctx);
};
