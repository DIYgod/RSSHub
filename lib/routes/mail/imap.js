const ImapClient = require('emailjs-imap-client').default;
const queryString = require('query-string');
const config = require('@/config');
const parser = require('mailparser').simpleParser;

module.exports = async (ctx) => {
    const email = ctx.params.email;
    const mailConfig = Object.assign(
        {
            username: email,
            password: '',
            host: '',
            port: 993,
        },
        queryString.parse(config.email.config[email.replace('@', '.')])
    );

    if (!mailConfig.username || !mailConfig.password || !mailConfig.host || !mailConfig.port) {
        throw Error('please config email password, host, port in .env file');
    }

    const imap = new ImapClient(mailConfig.host, parseInt(mailConfig.port), {
        logLevel: 'error',
        auth: {
            user: mailConfig.username,
            pass: mailConfig.password,
        },
    });

    const mails = await imap
        .connect()
        .then(() => imap.selectMailbox('INBOX'))
        .then((mailbox) => imap.listMessages('INBOX', `${Math.max(mailbox.exists - 9, 1)}:*`, ['uid', 'flags', 'envelope', 'body[]']))
        .then((messages) => messages)
        .catch((error) => console.log(error))
        .finally(() => {
            imap.close();
        });

    const items = await Promise.all(
        mails.reverse().map(async (item) => {
            const cache = await ctx.cache.get(item.envelope['message-id']);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const description = await parser(item['body[]']);
            const single = {
                title: item.envelope.subject,
                description: description.html || description.textAsHtml,
                guid: item.envelope['message-id'] || item.envelope.date,
                pubDate: item.envelope.date,
                author: `${item.envelope.from[0].name}(${item.envelope.from[0].address})`,
            };
            ctx.cache.set(item.envelope['message-id'], JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${email}的邮件列表`,
        link: ``,
        description: `${email}的邮件列表`,
        item: items,
    };
};
