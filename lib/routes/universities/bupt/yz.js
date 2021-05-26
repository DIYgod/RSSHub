const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

// const date = require('@/utils/date');
/* 研究生官网招生信息*/

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const struct = {
        all: {
            selector: {
                list: '.list ul',
                item: 'li',
                content: '.aticle',
            },
            url: 'https://yzb.bupt.edu.cn/list/list.php?p=2_1_1',
        },
        sice: {
            selector: {
                list: '.list',
                item: 'li',
                content: '#content',
            },
            url: 'https://sice.bupt.edu.cn/xygk/zygg.htm',
        },
        see: {
            selector: {
                list: '.list',
                item: 'li',
                content: '.article',
            },
            url: 'https://see.bupt.edu.cn/list/list.php?p=1_2_1',
        },
        scs: {
            selector: {
                list: '#ctl00_ctl00_ph_content_ph_2_content_noteMainPagePanel1_noteMainPage1_GridView1 tbody',
                item: 'tr',
                content: '#conten_2',
            },
            url: 'https://scs.bupt.edu.cn/cs_web/',
        },
        sa: {
            selector: {
                list: '.list',
                item: 'li',
                content: '.v_news_content',
            },
            url: 'https://sa.bupt.edu.cn/index/ybgl.htm',
        },
        sse: {
            selector: {
                list: '.main_conRCb ul',
                item: 'li',
                content: '.main_conDiv',
            },
            url: 'https://sse.bupt.edu.cn/jxgl/jwtzygg.htm',
        },
        sdmda: {
            selector: {
                list: '.list',
                item: 'li',
                content: '.article',
            },
            url: 'https://sdmda.bupt.edu.cn/?cat=33',
        },
        scss: {
            selector: {
                list: '.main_conRCb ul',
                item: 'li',
                content: '.main_conDiv',
            },
            url: 'https://scss.bupt.edu.cn/zsjy1/yjszs1.htm',
        },
        sci: {
            selector: {
                list: '#right_common ul',
                item: 'li',
                content: '#newscontent',
            },
            url: 'https://sci.bupt.edu.cn/list/list.php?p=2_6_1',
        },
        sem: {
            selector: {
                list: '#zs .index_list_lu',
                item: 'li',
                content: '#vsb_content',
            },
            url: 'https://sem.bupt.edu.cn/index.htm',
        },
        sh: {
            selector: {
                list: '.list ul',
                item: 'li',
                content: '.content',
            },
            url: 'https://sh.bupt.edu.cn/list/list.php?p=3_3_1',
        },
        mtri: {
            selector: {
                list: '.list ul',
                item: 'li',
                content: '.content',
            },
            url: 'https://mtri.bupt.edu.cn/list/list.php?p=1_3_1',
        },
        int: {
            selector: {
                list: '.list ul',
                item: 'li',
                content: '.content',
            },
            url: 'https://int.bupt.edu.cn/list/list.php?p=1_3_1',
        },
        ipoc: {
            selector: {
                list: '.content',
                item: 'li',
                content: '#content',
            },
            url: 'https://ipoc.bupt.edu.cn/zytz.htm',
        },
    };

    const url = struct[type].url;
    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: 'https://www.baidu.com/',
        },
    });
    const data = response.data;

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $(struct[type].selector.list).find(struct[type].selector.item).get();

    const name = $('title').text();
    const result = await util.ProcessFeed(list, ctx.cache, struct[type], type);

    // 使用 cheerio 选择器，选择 class="note-list" 下的所有 "li"元素，返回 cheerio node 对象数组
    // cheerio get() 方法将 cheerio node 对象数组转换为 node 对象数组

    // 注：每一个 cheerio node 对应一个 HTML DOM
    // 注：cheerio 选择器与 jquery 选择器几乎相同
    // 参考 cheerio 文档：https://cheerio.js.org/

    ctx.state.data = {
        title: `${name}又有更新了`,
        link: `${url}`,
        description: `${name}`,
        item: result,
    };
};
