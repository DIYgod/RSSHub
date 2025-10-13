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
const { CookieJar } = require('tough-cookie');

module.exports = async (ctx) => {
    const cookieJar = new CookieJar();

    await got('https://www.nature.com', { cookieJar });

    const journals = journalMap.items
        .filter((j) => j.id)
        .map((j) => ({
            ...j,
            link: `${baseUrl}/${j.title}/current-issue`,
        }));

    const out = await Promise.all(
        journals.map((journal) =>
            ctx.cache.tryGet(journal.link, async () => {
                const { id, name } = journal;

                const response = await got(journal.link, { cookieJar });

                const capturingRegex = /volumes\/(?<volume>\d+)\/issues\/(?<issue>\d+)/;
                const { volume, issue } = response.url.match(capturingRegex).groups;
                const imageUrl = `https://media.springernature.com/full/springer-static/cover-hires/journal/${id}/${volume}/${issue}?as=webp`;
                const contents = `<div align="center"><img src="${imageUrl}" alt="Volume ${volume} Issue ${issue}"></div>`;

                const $ = cheerio.load(response.data);
                const date = $('title').text().split(',')[1].trim();
                const issueDescription = $('div[data-test=issue-description]').html() ?? '';

                return {
                    title: `${name} | Volume ${volume} Issue ${issue}`,
                    description: contents + issueDescription,
                    link: response.url,
                    pubDate: parseDate(date, 'MMMM YYYY'),
                };
            })
        )
    );

    ctx.state.data = {
        title: 'Nature Covers Story',
        description: 'Find out the cover story of some Nature journals.',
        link: baseUrl,
        item: out,
    };
};
