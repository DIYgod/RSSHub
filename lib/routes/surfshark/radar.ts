export default {
    'surfshark.com': {
        _name: 'Surfshark',
        '.': [
            {
                title: 'Blog',
                docs: 'https://docs.rsshub.app/routes/blog#surfshark-blog',
                source: ['/blog/blog/:category*'],
                target: (params, url) => {
                    url = new URL(url);
                    const path = params.category ?? url.href.match(/\/blog\/(.*?)/)[1];

                    return `/surfshark/blog${path ? `/${path}` : ''}`;
                },
            },
            {
                title: 'Blog - Cybersecurity',
                docs: 'https://docs.rsshub.app/routes/blog#surfshark-blog',
                source: ['/blog/cybersecurity'],
                target: '/surfshark/blog/cybersecurity',
            },
            {
                title: 'Blog - All things VPN',
                docs: 'https://docs.rsshub.app/routes/blog#surfshark-blog',
                source: ['/blog/all-things-vpn'],
                target: '/surfshark/blog/all-things-vpn',
            },
            {
                title: 'Blog - Internet censorship',
                docs: 'https://docs.rsshub.app/routes/blog#surfshark-blog',
                source: ['/blog/internet-censorship'],
                target: '/surfshark/blog/internet-censorship',
            },
            {
                title: 'Blog - Entertainment',
                docs: 'https://docs.rsshub.app/routes/blog#surfshark-blog',
                source: ['/blog/entertainment'],
                target: '/surfshark/blog/entertainment',
            },
            {
                title: 'Blog - News',
                docs: 'https://docs.rsshub.app/routes/blog#surfshark-blog',
                source: ['/blog/news'],
                target: '/surfshark/blog/news',
            },
            {
                title: 'Blog - Internet Security',
                docs: 'https://docs.rsshub.app/routes/blog#surfshark-blog',
                source: ['/blog/cybersecurity/internet-security', '/blog/cybersecurity'],
                target: '/surfshark/blog/cybersecurity/internet-security',
            },
            {
                title: 'Blog - Mobile Security',
                docs: 'https://docs.rsshub.app/routes/blog#surfshark-blog',
                source: ['/blog/cybersecurity/mobile-security', '/blog/cybersecurity'],
                target: '/surfshark/blog/cybersecurity/mobile-security',
            },
            {
                title: 'Blog - Identity Protection',
                docs: 'https://docs.rsshub.app/routes/blog#surfshark-blog',
                source: ['/blog/cybersecurity/identity-protection', '/blog/cybersecurity'],
                target: '/surfshark/blog/cybersecurity/identity-protection',
            },
            {
                title: 'Blog - Phishing',
                docs: 'https://docs.rsshub.app/routes/blog#surfshark-blog',
                source: ['/blog/cybersecurity/phishing', '/blog/cybersecurity'],
                target: '/surfshark/blog/cybersecurity/phishing',
            },
            {
                title: 'Blog - Must-knows',
                docs: 'https://docs.rsshub.app/routes/blog#surfshark-blog',
                source: ['/blog/all-things-vpn/must-knows', '/blog/all-things-vpn'],
                target: '/surfshark/blog/all-things-vpn/must-knows',
            },
            {
                title: 'Blog - Technology',
                docs: 'https://docs.rsshub.app/routes/blog#surfshark-blog',
                source: ['/blog/all-things-vpn/technology', '/blog/all-things-vpn'],
                target: '/surfshark/blog/all-things-vpn/technology',
            },
            {
                title: 'Blog - Tips & Advice',
                docs: 'https://docs.rsshub.app/routes/blog#surfshark-blog',
                source: ['/blog/all-things-vpn/tips-and-advice', '/blog/all-things-vpn'],
                target: '/surfshark/blog/all-things-vpn/tips-and-advice',
            },
        ],
    },
};
