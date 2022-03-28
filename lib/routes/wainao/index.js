const got = require('@/utils/got');
const cheerio = require('cheerio');

// 找到那个对象存储的是需要的数据
const findData = (list) => {
    const target = list.filter((item) => item.method === 'replaceWith' || item.method === 'infiniteScrollInsertView');
    if (!target.length) {
        return {};
    }
    return target[0];
};

module.exports = async (ctx) => {
    // 如果在国内运行，需要在这里配置代理（agent）方可请求歪脑读接口。
    const response = await got({
        method: 'post',
        url: `https://www.wainao.me/views/ajax?_wrapper_format=drupal_ajax`,
        body: `view_name=wainao_reads_all_articles&view_display_id=page_2&view_args=&view_path=%2Fwainao-reads%2Fall-articles&view_base_path=wainao-reads%2Fall-articles&view_dom_id=0ae93d7cdc29110b720a459d259ee376b5cdfd8caa02ce79d3468a5d3084b1a1&pager_element=0&sort_by=created&page=0&_drupal_ajax=1&ajax_page_state%5Btheme%5D=wainaome&ajax_page_state%5Btheme_token%5D=&ajax_page_state%5Blibraries%5D=addtoany%2Faddtoany%2Cbetter_exposed_filters%2Fauto_submit%2Cbetter_exposed_filters%2Fgeneral%2Cbootstrap%2Fpopover%2Cbootstrap%2Ftooltip%2Ccore%2Fhtml5shiv%2Ccore%2Fpicturefill%2Cextlink%2Fdrupal.extlink%2Cfontawesome%2Ffontawesome.svg.shim%2Cgoogle_analytics%2Fgoogle_analytics%2Cmasonry%2Fmasonry.layout%2Csystem%2Fbase%2Cviews%2Fviews.module%2Cviews_infinite_scroll%2Fviews-infinite-scroll%2Cwainao_votes%2Fwainao_votes%2Cwainaome%2Fdefault-layout%2Cwn_custom%2Fwn_custom`,
        headers: {
            accept: 'application/json, text/javascript, */*; q=0.01',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
    });
    const _body = response.data;
    const data = findData(_body).data;
    if (!data) {
        return;
    }
    const $ = cheerio.load(data);

    const titles = $('.view-content .views-row').map((_, item) => {
        const $item = $(item);
        return {
            title: $item.find('.field_title a').text(),
            description: $item.find('.field_teaser').text().trim(),
            link: 'https://www.wainao.me' + $item.find('.field_title a').attr('href'),
            pubDate: $item.find('.field_date').text().trim(),
        };
    });
    ctx.state.data = {
        title: `歪脑读 - 所有文章`,
        link: 'https://www.wainao.me/wainao-reads/all-articles',
        description: '歪脑读 - 所有文章...',
        item: titles.toArray(),
    };
};
