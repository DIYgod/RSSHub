export default {
    'openai.com': {
        _name: 'OpenAI',
        '.': [
            {
                title: 'Blog',
                docs: 'https://docs.rsshub.app/routes/new-media#openai',
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
                docs: 'https://docs.rsshub.app/routes/new-media#openai',
                source: '/chat',
                target: () => '/openai/chatgpt/release-notes',
            },
        ],
        research: [
            {
                title: 'Research',
                docs: 'https://docs.rsshub.app/routes/new-media#openai',
                source: '/research',
                target: () => '/openai/research',
            },
        ],
    },
};
