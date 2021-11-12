const got = require('@/utils/got');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'http://info.tsinghua.edu.cn/';
const news_url = 'http://postinfo.tsinghua.edu.cn/f/';

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title,
        path,
        kind = 0;
    switch (type) {
        case 'zhongyao':
            title = '重要公告';
            path = 'zhongyaogonggao/more';
            kind = 1;
            break;
        case 'keyan':
            title = '科研通知';
            path = 'keyantongzhi/more';
            break;
        case 'bangong':
            title = '办公通知';
            path = 'bangongtongzhi/more';
            break;
        case 'jiaowu':
            title = '教务公告';
            path = 'jiaowugonggao/more';
            break;
        case 'haibao':
            title = '海报列表';
            path = 'haibao/more';
            break;
        case 'yiqing':
            title = '疫情防控';
            path = 'yiqingfangkong/more';
            kind = 1;
            break;
        default:
            title = '重要公告';
            path = 'zhongyaogonggao/more';
            kind = 1;
    }

    const response = await got({
        method: 'get',
        url: news_url + path,
        headers: {
            Referer: base_url,
        },
    });

    const $ = cheerio.load(response.data);
    if (kind === 1) {
        ctx.state.data = {
            title: '清华大学 - ' + title,
            link: news_url + path,
            description: '清华大学内网信息发布平台 - ' + title,
            item: $('table>tbody>tr')
                .slice(0, 10)
                .map((_, elem) => ({
                    link: get_link($('td>a', elem).attr('href'), news_url + path),
                    title: get_title($('td>a', elem).text(), $('td', elem).text()),
                    pubDate: new Date(
                        $('td>font>span', elem)
                            .text()
                            .replace(/(\d+).(\d+).(\d+).(\d+)/, '2020-$1-$2T$3:$4')
                    ).toUTCString(),
                }))
                .get(),
        };
    } else {
        ctx.state.data = {
            title: '清华大学 - ' + title,
            link: news_url + path,
            description: '清华大学内网信息发布平台 - ' + title,
            item: $('.cont_list>li')
                .slice(0, 10)
                .map((_, elem) => ({
                    link: get_link($('a', elem).attr('href'), news_url + path),
                    title: get_title($('a', elem).text(), $.text()),
                    pubDate: new Date(
                        $('time', elem)
                            .text()
                            .replace(/(\d+).(\d+).(\d+)/, '$1-$2-$3')
                    ).toUTCString(),
                }))
                .get(),
        };
    }
};

function get_link(url, alter_url) {
    if (url !== undefined) {
        return resolve_url(news_url, url);
    } else {
        return alter_url;
    }
}

function get_title(title, data) {
    if (title) {
        return title;
    }
    return data;
}
