# Create your own RSSHub route

## Acquiring Data

Typically, data can be acquired via HTTP requests (via API or webpage) sent by [got](https://github.com/sindresorhus/got).

Occasionally [puppeteer](https://github.com/puppeteer/puppeteer) is required for browser stimulation and page rendering in order to acquire the data.

The acquired data are most likely in JSON or HTML format. For HTML, [cheerio](https://github.com/cheeriojs/cheerio) is used for further processing.

Below is a list of data acquisition methods, ordered by the **level of recommendation**:

1.  **API**: The most recommended way to acquire data. The API is usually more stable and faster than web scraping.

2.  **Web scraping**: If the API is not available, web scraping is the second best choice. Web scraping is faster than browser simulation, but slower than API.

3.  **Genen
