import utils from './utils';

export default async (ctx) => {
    ctx.set('data', await utils.parseFeed({ subjectid: ctx.req.param('id') }));
};
