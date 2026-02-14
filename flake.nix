{
  description = "RSSHub - Make RSS Great Again!";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    devenv.url = "github:cachix/devenv";
  };

  outputs = inputs@{ self, nixpkgs, flake-utils, devenv }:
    let
      # Helper to define the RSSHub package
      makeRSSHub = pkgs:
        let
          pnpm = pkgs.pnpm_10;
          deps = pnpm.fetchDeps {
            pname = "rsshub";
            src = ./.;
            hash = "sha256-QG1cIkZh+qBA5Dipt0iDLuQpEOI45wdFhuG/CTcRVU8=";
            fetcherVersion = 2;
          };
        in
        pkgs.stdenv.mkDerivation rec {
          pname = "rsshub";
          version = "1.0.0";

          src = ./.;

          nativeBuildInputs = with pkgs; [
            nodejs_22
            pnpm.configHook
            git
          ];

        buildInputs = with pkgs; [
          # Optional: Add chromium for routes that need browser automation
          # chromium
        ];

        pnpmDeps = deps;

        # 修补构建脚本以支持离线构建（Nix 构建环境无网络访问）
        postPatch = ''
          # 在 registry.ts 中添加 BUILD_ROUTES 模式，使用 directoryImport 但不实际导入模块
          substituteInPlace lib/registry.ts \
            --replace-fail 'if (config.isPackage)' \
                          'if (process.env.BUILD_ROUTES_MODE) {
    modules = directoryImport({
        targetDirectoryPath: path.join(__dirname, "./routes"),
        importPattern: /\.tsx?$/,
    }) as typeof modules;
} else if (config.isPackage)'
        '';

        # The build phase
        buildPhase = ''
          runHook preBuild

          # 先构建路由元数据（使用 directoryImport 但避免执行模块顶层代码）
          export BUILD_ROUTES_MODE=1
          pnpm run build:routes
          unset BUILD_ROUTES_MODE

          # 然后构建应用
          export NODE_ENV=production
          ${pnpm}/bin/pnpm run build

          runHook postBuild
        '';

        # The install phase
        installPhase = ''
          runHook preInstall
          mkdir -p $out/lib/rsshub
          cp -r dist $out/lib/rsshub/
          cp -r node_modules $out/lib/rsshub/
          cp package.json $out/lib/rsshub/

          mkdir -p $out/bin
          cat > $out/bin/rsshub <<EOF
          #!${pkgs.bash}/bin/bash
          export NODE_ENV=production
          export NODE_OPTIONS='--max-http-header-size=32768'
          exec ${pkgs.nodejs_22}/bin/node $out/lib/rsshub/dist/index.mjs "\$@"
          EOF
          chmod +x $out/bin/rsshub
          runHook postInstall
        '';

        meta = with pkgs.lib; {
          description = "Everything is RSSible";
          homepage = "https://github.com/DIYgod/RSSHub";
          license = licenses.mit;
          maintainers = [ ];
          platforms = platforms.all;
        };
      };

      # NixOS module definition
      makeNixOSModule = { lib, pkgs, config, ... }:
        with lib;
        let
          cfg = config.services.rsshub;
        in
        {
          options.services.rsshub = {
            enable = mkEnableOption "RSSHub service";

            package = mkOption {
              type = types.package;
              default = makeRSSHub pkgs;
              defaultText = literalExpression "pkgs.rsshub";
              description = "The RSSHub package to use.";
            };

            port = mkOption {
              type = types.port;
              default = 1200;
              description = "Port on which RSSHub will listen.";
            };

            listenAddress = mkOption {
              type = types.str;
              default = "0.0.0.0";
              description = "Address on which RSSHub will listen.";
            };

            openFirewall = mkOption {
              type = types.bool;
              default = false;
              description = "Whether to open the firewall for the specified port.";
            };

            user = mkOption {
              type = types.str;
              default = "rsshub";
              description = "User account under which RSSHub runs.";
            };

            group = mkOption {
              type = types.str;
              default = "rsshub";
              description = "Group under which RSSHub runs.";
            };

            dataDir = mkOption {
              type = types.path;
              default = "/var/lib/rsshub";
              description = "Directory for RSSHub data.";
            };

            environment = mkOption {
              type = types.attrsOf types.str;
              default = { };
              example = literalExpression ''
                {
                  PORT = "1200";
                  CACHE_TYPE = "redis";
                  REDIS_URL = "redis://localhost:6379/";
                  ALLOW_LOCALHOST = "true";
                }
              '';
              description = ''
                Environment variables for RSSHub.
                See https://docs.rsshub.app/deploy/config for available options.
              '';
            };

            environmentFiles = mkOption {
              type = types.listOf types.path;
              default = [ ];
              example = literalExpression ''
                [ config.sops.secrets.rsshub.path ]
              '';
              description = ''
                Environment variables stored in files for RSSHub.
                It can be used for secrets like agenix, sops-nix, etc.
                See https://docs.rsshub.app/deploy/config for available options.
              '';
            };

            redis = {
              enable = mkOption {
                type = types.bool;
                default = false;
                description = "Whether to enable and configure Redis for caching.";
              };

              createLocally = mkOption {
                type = types.bool;
                default = true;
                description = "Whether to create a local Redis instance.";
              };

              url = mkOption {
                type = types.str;
                default = "redis://localhost:6379/";
                description = "Redis connection URL.";
              };
            };
          };

          config = mkIf cfg.enable (
            let
              baseEnv = cfg.environment;
              redisEnv = optionalAttrs cfg.redis.enable {
                CACHE_TYPE = "redis";
                REDIS_URL = cfg.redis.url;
              };
              derivedEnv =
                {
                  PORT = toString cfg.port;
                }
                // optionalAttrs (cfg.listenAddress == "0.0.0.0") {
                  LISTEN_INADDR_ANY = "1";
                };
              finalEnv = baseEnv // redisEnv // derivedEnv;
              environmentFile = pkgs.writeText "rsshub.env" (
                concatStringsSep "\n" (
                  mapAttrsToList (name: value: "${name}=${toString value}") finalEnv
                )
              );
            in
            {
              # Set up Redis if enabled
              services.redis.servers.rsshub = mkIf (cfg.redis.enable && cfg.redis.createLocally) {
                enable = true;
                port = 6379;
              };

              # Create user and group
              users.users.${cfg.user} = {
                isSystemUser = true;
                group = cfg.group;
                home = cfg.dataDir;
                createHome = true;
                description = "RSSHub service user";
              };

              users.groups.${cfg.group} = { };

              # SystemD service
              systemd.services.rsshub = {
                description = "RSSHub - Everything is RSSible";
                wantedBy = [ "multi-user.target" ];
                after = [ "network.target" ] ++ optional (cfg.redis.enable && cfg.redis.createLocally) "redis-rsshub.service";
                requires = optional (cfg.redis.enable && cfg.redis.createLocally) "redis-rsshub.service";

                serviceConfig = {
                  Type = "simple";
                  User = cfg.user;
                  Group = cfg.group;
                  WorkingDirectory = cfg.dataDir;
                  EnvironmentFile = [environmentFile] ++ cfg.environmentFiles;
                  ExecStart = "${cfg.package}/bin/rsshub";
                  Restart = "on-failure";
                  RestartSec = "5s";

                  # Hardening
                  NoNewPrivileges = true;
                  PrivateTmp = true;
                  ProtectSystem = "strict";
                  ProtectHome = true;
                  ReadWritePaths = [ cfg.dataDir ];
                  ProtectKernelTunables = true;
                  ProtectKernelModules = true;
                  ProtectControlGroups = true;
                };
              };

              # Open firewall if requested
              networking.firewall.allowedTCPPorts = mkIf cfg.openFirewall [ cfg.port ];
            }
          );
        };

    in
    {
      # NixOS module
      nixosModules.default = makeNixOSModule;
      nixosModules.rsshub = makeNixOSModule;

      # Overlay
      overlays.default = final: prev: {
        rsshub = makeRSSHub final;
      };
    }
    //
    # Per-system outputs
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        # Package
        packages = {
          default = makeRSSHub pkgs;
          rsshub = makeRSSHub pkgs;
        };

        # Development shell using devenv
        devShells.default = devenv.lib.mkShell {
          inherit inputs pkgs;
          modules = [
            {
              # devenv requires knowing the project root
              # https://devenv.sh/guides/using-with-flakes/
              packages = [ ];
            }
            ./devenv.nix
          ];
        };

        # Apps
        apps.default = {
          type = "app";
          program = "${self.packages.${system}.default}/bin/rsshub";
        };
      }
    );
}
