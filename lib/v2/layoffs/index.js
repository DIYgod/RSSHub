const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const ROW_COUNT = 100;

const WEBSITE_URL = 'https://layoffs.fyi';
const ENTRY_URL = 'https://airtable.com/embed/shrqYt5kSqMzHV9R5/tbl8c8kanuNB6bPYr';
const AIRTABLE_HOST = 'https://airtable.com';

/**
 * getMapping can convert either an array or an object
 * of a specific structure into a Map, where the key is
 * the name and the value is the Id. It will only parse
 * entries with 'name' and 'id' in it
 *
 * Inputs:
 *   obj = [{name: 'Apple', id: 1}, {name: 'Peach', id: 2}]
 * Returns:
 *   [{1: 'Apple', 2: 'Peach'}, {Apple: 1, Peach: 2}]
 *
 * Inputs:
 *   obj = {Apple: {name: 'Apple', id: 1}, Peach: {name: 'Peach', id: 2}}
 * Returns:
 *   [{1: 'Apple', 2: 'Peach'}, {Apple: 1, Peach: 2}]
 */
const getMappings = function (obj) {
    const mapping = new Map();
    const reverseMapping = new Map();
    for (const key in obj) {
        if ('name' in obj[key] && 'id' in obj[key]) {
            reverseMapping.set(obj[key].name, obj[key].id);
            mapping.set(obj[key].id, obj[key].name);
        }
    }
    return [mapping, reverseMapping];
};

module.exports = async (ctx) => {
    const headers = {
        'x-airtable-application-id': 'app1PaujS9zxVGUZ4',
        'x-airtable-inter-service-client': 'webClient',
        'x-requested-with': 'XMLHttpRequest',
        'x-time-zone': 'America/Los_Angeles',
    };

    // Get the latest data source url
    let dataSourceUrl = await ctx.cache.get(ENTRY_URL);
    let cacheInvalid = false;
    let response;
    if (!dataSourceUrl) {
        cacheInvalid = true;
    } else {
        // Try to fetch data,
        // it may fail due to outdated url
        try {
            response = await got({
                method: 'get',
                url: dataSourceUrl,
                headers,
            });
            if (response.statusCode >= 400) {
                cacheInvalid = true;
            }
        } catch {
            cacheInvalid = true;
        }
    }

    if (cacheInvalid) {
        // Refetch the data source link from entry page
        const sourcePage = await got({
            method: 'get',
            url: ENTRY_URL,
        });
        const $ = cheerio.load(sourcePage.data);
        dataSourceUrl =
            AIRTABLE_HOST +
            $('script')
                .text()
                .match(/urlWithParams: "(.*?)"/)[1]
                .replace(/\\u002F/g, '/');

        // Cache it again
        ctx.cache.set(ENTRY_URL, dataSourceUrl);

        // Refetch the data source
        response = await got({
            method: 'get',
            url: dataSourceUrl,
            headers,
        });
    }

    // Get data from data source
    const data = response.data.data;
    const table = data.table;

    // Columns are represented by special IDs
    const columnReverseMapping = getMappings(table.columns)[1];

    const companyColumnId = columnReverseMapping.get('Company');
    const dateAddedColumnId = columnReverseMapping.get('Date Added');
    const numOfLaidOffColumnId = columnReverseMapping.get('# Laid Off');
    const sourceColumnId = columnReverseMapping.get('Source');
    const countryColumnId = columnReverseMapping.get('Country');
    const countryMapping = getMappings(table.columns.filter((col) => col.name === 'Country')[0].typeOptions.choices)[0];

    const rows = table.rows.slice(0, ROW_COUNT);
    ctx.state.data = {
        title: 'Tech layoff data feed from layoffs.fyi',
        link: WEBSITE_URL,
        description: 'This feed gets tech layoff data from layoffs.fyi and display them in a user friendly way',
        item: rows.map((row) => {
            const rowContent = row.cellValuesByColumnId;

            const company = rowContent[companyColumnId];
            const dateAdded = parseDate(rowContent[dateAddedColumnId]);
            const source = rowContent[sourceColumnId];
            const numOfLaidOff = rowContent[numOfLaidOffColumnId] || 'some';
            const country = countryMapping.get(rowContent[countryColumnId]);

            const title = `${company} Layoffs Happening!`;
            const description = `${company} lays off ${numOfLaidOff} employees in ${country}. For more details, please visit ${source}.`;

            return {
                title,
                description, // the article content
                pubDate: dateAdded, // Data publish date
                link: source, // Laid off source link
            };
        }),
    };
};
