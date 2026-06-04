import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'Tumblr',
    url: 'tumblr.com',
    lang: 'en',
    description: `Register an application on \`https://www.tumblr.com/oauth/apps\`.

- \`TUMBLR_CLIENT_ID\`: The key is labelled as \`OAuth consumer Key\` in the info page of the registered application.
- \`TUMBLR_CLIENT_SECRET\`: The key is labelled as \`OAuth consumer Secret\` in the info page of the registered application.
- \`TUMBLR_REFRESH_TOKEN\`: Navigate to \`https://www.tumblr.com/oauth2/authorize?client_id=\${CLIENT_ID}&response_type=code&scope=basic%20offline_access&state=mystate\` in your browser and login. After doing so, you'll be redirected to the URL you defined when registering the application. Look for the \`code\` parameter in the URL. You can then call \`curl -F grant_type=authorization_code -F "code=\${CODE}" -F "client_id=\${CLIENT_ID}" -F "client_secret=\${CLIENT_SECRET}" "https://api.tumblr.com/v2/oauth2/token"\`

Two login methods are currently supported:

- \`TUMBLR_CLIENT_ID\`: The key never expires, however blogs that are "dashboard only" cannot be accessed.
- \`TUMBLR_CLIENT_ID\` + \`TUMBLR_CLIENT_SECRET\` + \`TUMBLR_REFRESH_TOKEN\`: The refresh token will expire and will need to be regenerated, "dashboard only" blogs can be accessed.`,
};
