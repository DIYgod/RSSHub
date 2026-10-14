{ pkgs, lib, config, ... }:

{
  # https://devenv.sh/basics/
  env = {
    NODE_ENV = "dev";
    NODE_OPTIONS = "--max-http-header-size=32768";
  };

  # https://devenv.sh/packages/
  packages = with pkgs; [
    git
    prek

    # Optional: Uncomment if you need browser automation
    # chromium
  ];

  # https://devenv.sh/languages/
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    pnpm = {
      enable = true;
      package = pkgs.pnpm_10;
    };
  };

  # https://devenv.sh/services/
  services.redis = {
    enable = lib.mkDefault false;  # Disabled by default, users can enable in devenv.local.nix
    port = 6379;
  };

  # https://devenv.sh/scripts/
  scripts.rsshub-dev.exec = ''
    pnpm run dev
  '';

  scripts.rsshub-build.exec = ''
    pnpm run build
  '';

  scripts.rsshub-start.exec = ''
    pnpm start
  '';

  scripts.rsshub-test.exec = ''
    pnpm test
  '';

  # https://devenv.sh/processes/
  processes = {
    # Uncomment to auto-start RSSHub in dev mode when entering the shell
    # rsshub.exec = "pnpm run dev";

    # Example: Auto-start with Redis
    # rsshub.exec = "pnpm run dev";
  };

  enterShell = ''
    echo ""
    echo "🚀 RSSHub Development Environment"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Node.js:  $(node --version)"
    echo "pnpm:     $(pnpm --version)"
    ${lib.optionalString config.services.redis.enable ''
    echo "Redis:    Running on port ${toString config.services.redis.port}"
    ''}
    echo ""
    echo "Available commands:"
    echo "  rsshub-dev     - Start development server (pnpm run dev)"
    echo "  rsshub-build   - Build the project (pnpm run build)"
    echo "  rsshub-start   - Start production server (pnpm start)"
    echo "  rsshub-test    - Run tests (pnpm test)"
    ${lib.optionalString (!config.services.redis.enable) ''
    echo ""
    echo "💡 Tip: Enable Redis by creating devenv.local.nix:"
    echo "   { services.redis.enable = true; }"
    ''}
    echo ""
    echo "Documentation: https://docs.rsshub.app"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
      echo "📦 Installing dependencies..."
      pnpm install
    fi
  '';

  # https://devenv.sh/integrations/dotenv/
  dotenv.enable = true;  # Automatically load .env file

  # Load local overrides if they exist
  # Users can create devenv.local.nix for personal customizations
  imports = lib.optional (builtins.pathExists ./devenv.local.nix) ./devenv.local.nix;
}
