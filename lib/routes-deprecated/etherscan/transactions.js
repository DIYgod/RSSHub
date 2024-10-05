const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { address } = ctx.params;

    const response = await got({
        method: 'get',
        url: `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&page=1&offset=0&sort=desc`,
    });

    const list = response.data.result.slice(0, 20);

    ctx.state.data = {
        title: 'etherscan transactions',
        link: 'https://etherscan.io/',
        language: 'en',
        description: 'ethereum address transactions',
        item:
            list &&
            list.map((item) => {
                const title = ` TransactionHash: ${item.hash} `;
                const value = (Number.parseFloat(item.value) / 10 ** 18).toFixed(8);
                const description = `
                        From: ${item.from} <br> To: ${item.to} <br> Value: ${value} <br> Block: ${item.blockNumber}`;
                const link = `https://etherscan.io/tx/${item.hash}`;

                return {
                    title,
                    description,
                    link,
                    pubDate: parseDate(item.timestamp),
                    guid: item.hash,
                };
            }),
    };
};
