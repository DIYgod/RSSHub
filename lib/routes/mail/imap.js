const ImapClient = require('emailjs-imap-client').default;
const queryString = require('query-string');
const config = require('@/config').value;
const parser = require('mailparser').simpleParser;
const logger = require('@/utils/logger');

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
        .catch((error) => logger.error(error))
        .finally(() => {
            imap.close();
        });

    const ParserMail = async (data) => {
        const mail = await parser(Buffer.from(data, 'binary'));
        let content = mail.html || mail.textAsHtml;
        if (mail.attachments.length > 0) {
            content += `<h3>附件（${mail.attachments.length}）</h3>`;
            mail.attachments.forEach((attachment) => {
                content += `<p>${attachment.filename}</p>`;
            });
        }
        return content;
    };

    const items = await Promise.all(
        mails.reverse().map(async (item) => {
            const guid = item.envelope['message-id'] || `mail_${new Date(item.envelope.date).getTime()}`;
            const cache = await ctx.cache.get(guid);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const description = await ParserMail(item['body[]']);
            const single = {
                title: item.envelope.subject,
                description,
                guid,
                pubDate: item.envelope.date,
                author: `${item.envelope.from[0].name}(${item.envelope.from[0].address})`,
            };
            ctx.cache.set(guid, JSON.stringify(single));
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
