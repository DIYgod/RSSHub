// https://github.com/misskey-dev/misskey/blob/d2e8dc4fe3c6e90e68001ed1f092d4e3d2454283/packages/backend/src/misc/json-schema.ts

// https://github.com/misskey-dev/misskey/blob/d2e8dc4fe3c6e90e68001ed1f092d4e3d2454283/packages/backend/src/models/json-schema/note.ts
export interface MisskeyNote {
    id: string;
    createdAt: string;
    userId: string;
    user: MisskeyUser;
    text: string | null;
    cw: string | null;
    visibility: 'public' | 'home' | 'followers' | 'specified';
    localOnly: boolean;
    reactionAcceptance: string | null;
    renoteCount: number;
    repliesCount: number;
    reactions: Record<string, number>;
    reactionEmojis: Record<string, string>;
    fileIds: string[];
    files: MisskeyFile[];
    replyId: string | null;
    renoteId: string | null;
    channelId: string | undefined;
    channel?: {
        id: string;
        name: string;
        color: string;
        isSensitive: boolean;
        allowRenoteToExternal: boolean;
        userId: string | null;
    };
    mentions?: string[];
    uri?: string;
    url?: string;
    reactionAndUserPairCache?: string[];
    poll?: {
        expiresAt: string | null;
        multiple: boolean;
        choices: {
            text: string;
            votes: number;
            isVoted: boolean;
        }[];
    };
    emojis?: Record<string, string>;
    tags?: string[];
    clippedCount?: number;
    myReaction?: string | null;

    reply?: MisskeyNote;
    renote?: MisskeyNote;
}

// https://github.com/misskey-dev/misskey/blob/d2e8dc4fe3c6e90e68001ed1f092d4e3d2454283/packages/backend/src/models/json-schema/user.ts
export interface MisskeyUser {
    id: string;
    name: string | null;
    username: string;
    host: string | null;
    avatarUrl: string | null;
    avatarBlurhash: string | null;
    avatarDecorations: Array<{
        id: string;
        url: string;
        angle?: number;
        flipH?: boolean;
        offsetX?: number;
        offsetY?: number;
    }>;
    isBot?: boolean;
    isCat?: boolean;
    instance?: {
        name: string | null;
        softwareName: string | null;
        softwareVersion: string | null;
        iconUrl: string | null;
        faviconUrl: string | null;
        themeColor: string | null;
    };
    emojis: Record<string, string>;
    onlineStatus: 'unknown' | 'online' | 'active' | 'offline';
    badgeRoles?: Array<{
        name: string;
        iconUrl: string | null;
        displayOrder: number;
    }>;
}

// https://github.com/misskey-dev/misskey/blob/d2e8dc4fe3c6e90e68001ed1f092d4e3d2454283/packages/backend/src/models/json-schema/drive-file.ts
interface MisskeyFile {
    id: string;
    createdAt: string;
    name: string;
    type: string;
    md5: string;
    size: number;
    isSensitive: boolean;
    blurhash: string | null;
    properties: {
        width?: number;
        height?: number;
        orientation?: number;
        avgColor?: string;
    };
    url: string;
    thumbnailUrl: string | null;
    comment: string | null;
    folderId: string | null;
    folder?: unknown | null;
    userId: string | null;
    user?: MisskeyUser | null;
}
