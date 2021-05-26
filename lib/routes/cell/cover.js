// The content is generateed by undocumentated resource of Cell journals

const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const baseURL = 'https://www.cell.com';
    const journals = [
        'cell',
        'cancer-cell',
        'cell-chemical-biology',
        'cell-host-microbe',
        'cell-metabolism',
        'cell-reports',
        'cell-reports-physical-science',
        'cell-stem-cell',
        'cell-systems',
        'chem',
        'current-biology',
        'developmental-cell',
        'immunity',
        'joule',
        'matter',
        'molecular-cell',
        'neuron',
        'one-earth',
        'structure',
    ];
    const out = await Promise.all(
        journals.map(async (journal) => {
            // get the lastest volumn and issue id
            const pageURL = `${baseURL}/${journal}/current`;

            const pageMeta = await ctx.cache.tryGet(
                pageURL,
                async () => {
                    const cookieData = await got
                        .extend({
                            followRedirect: false,
                        })
                        .get(`https://secure.jbs.elsevierhealth.com/action/getSharedSiteSession?redirect=${encodeURI(pageURL)}`)
                        .then((response) => {
                            const cookieString = response.headers['set-cookie'].join(' ');
                            const server = cookieString.match(/SERVER=(\S+);/)[1];
                            const jsession = cookieString.match(/JSESSIONID=(\S+);/)[1];
                            return `SERVER=${server}; JSESSIONID=${jsession};`;
                        });

                    const pageResponse = await got.get(pageURL, {
                        headers: {
                            cookie: cookieData,
                        },
                        followRedirect: false,
                    });

                    const $ = cheerio.load(pageResponse.data);
                    const coverImg = url.resolve('https://', $('#fullCover > img').attr('src'));
                    const coverDescription = $('#fullCover > img').attr('alt');
                    const issueDate = $('h1.toc-header__issue-date').text();
                    const issueNum = $('.toc-header__details span')
                        .contents()
                        .map(function () {
                            return this.type === 'text' ? $(this).text() : '';
                        })
                        .get()
                        .slice(0, 2)
                        .join(', ');
                    const issueName = $('meta[name="name"]').attr('content').replace('Issue: ', '') || `Cell ...`;
                    const m = $('meta[name="pbContext"]')
                        .attr('content')
                        .match(/issue:issue:pii\\:(S\d{4})(\d{4})(\d{2})(X\d{4})(\w)/);
                    const issueID = `${m[1]}-${m[2]}(${m[3]})${m[4]}-${m[5]}`;
                    return {
                        coverImg: coverImg,
                        coverDescription: coverDescription,
                        issueName: issueName,
                        issueDate: issueDate,
                        issueNum: issueNum,
                        issueID: issueID,
                    };
                },
                12 * 60 * 60 // set cache timeout to 12h
            );
            const address = `${baseURL}/${journal}/issue?pii=${pageMeta.issueID}`;
            const contents = `<div align="center"><img src="${pageMeta.coverImg}" alt="${pageMeta.coverDescription}"></div>`;

            const single = {
                title: `${pageMeta.issueName} | ${pageMeta.issueNum} (${pageMeta.issueDate})`,
                author: '@yech1990',
                description: contents,
                link: address,
                guid: address,
                pubDate: new Date(pageMeta.issueDate).toUTCString(),
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'Cell Covers Story',
        description: 'Find out the cover story of some Cell journals.',
        link: baseURL,
        item: out,
    };
};
