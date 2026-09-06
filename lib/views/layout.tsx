import type { FC } from 'hono/jsx';

export const Layout: FC = (props) => (
    <html>
        <head>
            <title>Welcome to RSSHub!</title>
            <meta name="color-scheme" content="light dark" />
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                {`
                    details::-webkit-scrollbar {
                        width: 0.25rem;
                    }
                    details::-webkit-scrollbar-thumb {
                        border-radius: 0.125rem;
                        background-color: #e4e4e7;
                    }
                    details::-webkit-scrollbar-thumb:hover {
                        background-color: #a1a1aa;
                    }
                    @media (prefers-color-scheme: dark) {
                        details::-webkit-scrollbar-thumb {
                            background-color: #3f3f46;
                        }
                        details::-webkit-scrollbar-thumb:hover {
                            background-color: #52525b;
                        }
                    }

                    @font-face {
                        font-family: SN Pro;
                        font-style: normal;
                        font-display: swap;
                        font-weight: 400;
                        src: url(https://cdn.jsdelivr.net/fontsource/fonts/sn-pro@latest/latin-400-normal.woff2) format(woff2);
                    }
                    @font-face {
                        font-family: SN Pro;
                        font-style: normal;
                        font-display: swap;
                        font-weight: 500;
                        src: url(https://cdn.jsdelivr.net/fontsource/fonts/sn-pro@latest/latin-500-normal.woff2) format(woff2);
                    }
                    @font-face {
                        font-family: SN Pro;
                        font-style: normal;
                        font-display: swap;
                        font-weight: 700;
                        src: url(https://cdn.jsdelivr.net/fontsource/fonts/sn-pro@latest/latin-700-normal.woff2) format(woff2);
                    }
                    body {
                        font-family: SN Pro, sans-serif;
                    }
                `
                    .replaceAll(/\s+/g, ' ')
                    .trim()}
            </style>
        </head>
        <body className="antialiased min-h-screen text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 flex flex-col">{props.children}</body>
    </html>
);
