// Fallback type declaration for route-paths
// This file provides a default type when assets/build/route-paths.ts doesn't exist
declare module '@/../assets/build/route-paths' {
    export type RoutePath = string;
}
