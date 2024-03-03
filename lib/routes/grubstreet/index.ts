// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const url = `https://www.grubstreet.com/_components/newsfeed/instances/grubstreet-index@published`;
    const title = `Grub Street`;
    const description = `New York Magazine's Food and Restaurant Blog`;

    ctx.set('data', await utils.getData(ctx, url, title, description));
};
