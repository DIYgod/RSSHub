const ImapClient = require('emailjs-imap-client').default;

module.exports = async (ctx) => {
    const mailConfig = {
        username: '',
        password: '',
        host: 'imap.exmail.qq.com',
        port: 993,
    };

    const imap = new ImapClient(mailConfig.host, mailConfig.port, {
        logLevel: 'error',
        auth: {
            user: mailConfig.username,
            pass: mailConfig.password,
        },
    });

    const mails = await imap
        .connect()
        .then(() => imap.selectMailbox('INBOX'))
        .then(() => imap.listMessages('INBOX', '1:10', ['uid', 'flags', 'envelope', 'body[text]']))
        .then((messages) => messages)
        .finally(() => {
            imap.close();
        });

    const items = await Promise.all(
        mails.reverse().map(async (item) => {
            const cache = await ctx.cache.get(item.envelope['message-id']);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title: item.envelope.subject,
                description: item['body[text]'],
                guid: item.envelope['message-id'],
                pubDate: item.envelope.date,
                author: `${item.envelope.from[0].name}(${item.envelope.from[0].address})`,
            };
            ctx.cache.set(item.envelope['message-id'], JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `mail`,
        link: ``,
        description: '',
        item: items,
    };
};
