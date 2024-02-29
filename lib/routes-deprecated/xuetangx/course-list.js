const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { type = '', credential, mode, status } = ctx.params;
    const baseUrl = 'http://www.xuetangx.com';
    const link = `${baseUrl}/courses`;
    const query = {
        page_type: type,
        course_mode: mode,
        process: status,
        credential,
    };
    for (const key of Object.keys(query)) {
        Number(query[key]) === -1 && (query[key] = '');
    }
    const res = await got(link, {
        query,
    });
    const $ = cheerio.load(res.data);

    const item = $('#list_style .list_inner')
        .map((_, node) => {
            const $item = cheerio.load(node);
            const title = $item('.coursetitle').text();
            const link = `${baseUrl}${$item('.coursename > a').attr('href')}`;
            const posterImg = baseUrl + $item('.course-cover').attr('src');
            const baseInfo = $item('.coursename_ref').text().trim().replaceAll(/\s+/g, '/');
            const teacherInfo = $item('div.fl.name > ul > li:nth-child(1)').text();
            const extraInfo = $item('div.fl.name > ul > li:nth-child(2)').text().replace('$', '');
            const description = `
            ${baseInfo}<br/>
            ${teacherInfo}<br/>
            ${extraInfo}<br/>
            ${$item('.txt')}<br/>
            ${$item('.ctxt')}<br/>
            <img src="${posterImg}"/><br/>
        `;
            return {
                title,
                link,
                description,
            };
        })
        .get();

    ctx.state.data = {
        title: `学堂在线-课程列表`,
        description: `学堂在线-课程列表`,
        link,
        item,
        allowEmpty: true,
    };
};
