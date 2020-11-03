const got = require('@/utils/got');
const cheerio = require('cheerio');
const qs = require('querystring');

const baseURL = 'https://www.linkresearcher.com';

module.exports = async (ctx) => {
    // parse params
    const { params } = ctx.params;
    const query = qs.parse(params);

    const categoryMap = { theses: '论文', information: '新闻', careers: '职业' };
    const category = query.category;
    let title = categoryMap[category];

    // get XSRF token from main page
    const metaURL = `${baseURL}/${category}`;
    const metaResponse = await got.get(metaURL);
    const metaCapture = cheerio.load(metaResponse.data);
    const xsrf_token = metaCapture('meta[name="_csrf"]').prop('content');

    let data = { filters: { status: false } };
    if (typeof query.subject !== 'undefined' && typeof query.columns !== 'undefined') {
        data = { filters: { status: true, subject: query.subject, columns: query.columns } };
        title = `${title}「${query.subject} & ${query.columns}」`;
    } else if (typeof query.subject !== 'undefined' && typeof query.columns === 'undefined') {
        data = { filters: { status: true, subject: query.subject } };
        title = `${title}「${query.subject}」`;
    } else if (typeof query.subject === 'undefined' && typeof query.columns !== 'undefined') {
        data = { filters: { status: true, columns: query.columns } };
        title = `${title}「${query.columns}」`;
    }
    data.query = query.query;
    const dataURL = `${baseURL}/api/${category}/search?from=0&size=20&type=SEARCH`;
    const pageResponse = await got({
        method: 'post',
        url: dataURL,
        headers: {
            'content-type': 'application/json; charset=UTF-8',
            'x-xsrf-token': xsrf_token,
            cookie: `XSRF-TOKEN=${xsrf_token}`,
        },
        data: JSON.stringify(data),
    });

    const list = pageResponse.data.hits;

    const out = list.map((item) => ({
        title: item.title,
        description: item.content,
        pubDate: new Date(item.createdAt).toUTCString(),
        link: `${metaURL}/${item.id}`,
        guid: `${metaURL}/${item.id}`,
        doi: typeof item.identCode !== 'undefined' ? item.identCode : '',
        author: typeof item.authors !== 'undefined' ? item.authors.join(', ') : '',
    }));

    ctx.state.data = {
        title: `领研 | ${title}`,
        description:
            '领研是链接华人学者的人才及成果平台。领研为国内外高校、科研机构及科技企业提供科研人才招聘服务，也是青年研究者的职业发展指导及线上培训平台；研究者还可将自己的研究论文上传至领研，与超过五十万华人学者分享工作的最新进展。',
        link: baseURL,
        item: out,
    };
};
