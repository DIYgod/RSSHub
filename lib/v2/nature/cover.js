// The content is generateed by undocumentated API of nature journals
// This router has **just** been tested in:
// nature:           Nature
// nbt:              Nature Biotechnology
// neuro:            Nature Neuroscience
// ng:               Nature Genetics
// ni:               Nature Immunology
// nmeth:            Nature Method
// nchem:            Nature Chemistry
// nmat:             Nature Materials
// natmachintell:    Nature Machine Intelligence
// ncb:              Nature Cell Biology
// nplants:          Nature Plants
// natastron:        Nature Astronomy
// nphys             Nature Physics

const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, journalMap } = require('./utils');

module.exports = async (ctx) => {
    const journals = journalMap.items;
    const out = await Promise.all(
        journals
            .filter((j) => j.id)
            .map(async (journal) => {
                // get the lastest volumn and issue id
                const pageURL = `${baseUrl}/${journal.title}/current-issue`;
                const cookieData = await got
                    .extend({
                        prefixUrl: 'https://idp.nature.com/authorize',
                        followRedirect: false,
                    })
                    .get(`?response_type=cookie&client_id=grover&redirect_uri=${encodeURI(pageURL)}`)
                    .then((response) => response.headers['set-cookie'].join(' '));
                const issueURL = await got
                    .extend({
                        prefixUrl: pageURL,
                        headers: {
                            cookie: cookieData,
                        },
                        followRedirect: false,
                    })
                    .get('')
                    .then((response) => response.headers.location);
                const capturingRegex = /volumes\/(?<volumes>\d+)\/issues\/(?<issues>\d+)/;
                const { volumes, issues } = issueURL.match(capturingRegex).groups;

                const address = `${baseUrl}${issueURL}`;
                return ctx.cache.tryGet(address, async () => {
                    const id = journal.id;
                    const imageURL = `https://media.springernature.com/full/springer-static/cover-hires/journal/${id}/${volumes}/${issues}?as=webp`;
                    const contents = `<div align="center"><img src="${imageURL}" alt="Volume ${volumes} Issue ${issues}"></div>`;

                    const response = await got(address);
                    const $ = cheerio.load(response.data);
                    const date = $('title').text().split(',')[1].trim();
                    const issueDescription = $('div[data-test=issue-description]').html() ?? '';

                    const single = {
                        title: `${journal.name} | Volume ${volumes} Issue ${issues}`,
                        description: contents + issueDescription,
                        link: address,
                        pubDate: parseDate(date, 'MMMM YYYY'),
                    };
                    return single;
                });
            })
    );
    ctx.state.data = {
        title: 'Nature Covers Story',
        description: 'Find out the cover story of some Nature journals.',
        link: baseUrl,
        item: out,
    };
};
