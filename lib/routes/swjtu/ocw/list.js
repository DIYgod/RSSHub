const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://ocw.swjtu.edu.cn/yethan/YouthIndex?setAction=courseList',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#data-main > ul > li');

    // let itemPicUrl;

    ctx.state.data = {
        title: '第二课堂',
        link: 'https://ocw.swjtu.edu.cn/yethan/YouthIndex?setAction=courseList',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const itemPicUrl = item.find('li img').attr('src');
                    const text = $('li .list-tit').attr('onclick');
                    const url = 'YouthIndex?setAction=courseInfo&courseid=' + text.replace("getCourseInfo('", '').replace("')", '');

                    return {
                        title: item.find('li  .list-tit').text(),

                        description: `${item.find('p', '.list-txt', 'li').text()}</br>
			    ${item.find('span', '.list-tips', 'li').first().text()}  |  类别：${item.find('span', '.list-tips', 'li').eq(1).text()} | <a href = "${url}"><b>报名</b></a></br>
			    <img src="${itemPicUrl}"> 
			    `,
                        link: url,
                    };
                })
                .get(),
    };
};
