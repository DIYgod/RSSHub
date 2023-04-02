module.exports = {
    'openai.com': {
        _name: 'OpenAI',
        '.': [
            {
                title: 'Blog',
                docs: 'https://docs.rsshub.app/en/new-media.html#openai',
                source: '/blog',
                target: (_, url) => {
                    const topics = new URL(url).searchParams.get('topics');
                    if (topics) {
                        return `/openai/blog/${topics}`;
                    }
                    return '/openai/blog';
                },
            },
        ],
        chat: [
            {
                title: 'ChatGPT - Release Notes',
                docs: 'https://docs.rsshub.app/en/new-media.html#openai',
                source: '/chat',
                target: () => '/openai/chatgpt/release-notes',
            },
        ],
    },
};
