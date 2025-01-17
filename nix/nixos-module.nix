# nixos-module.nix
{
  config,
  pkgs,
  lib,
  ...
}:
let
  cfg = config.services.xnode-nextjs-web3-blog;
  xnode-nextjs-web3-blog = pkgs.callPackage ./package.nix { };
in
{
  options = {
    services.xnode-nextjs-web3-blog = {
      enable = lib.mkEnableOption "Enable the nextjs app";

      hostname = lib.mkOption {
        type = lib.types.str;
        default = "0.0.0.0";
        example = "127.0.0.1";
        description = ''
          The hostname under which the app should be accessible.
        '';
      };

      port = lib.mkOption {
        type = lib.types.port;
        default = 3000;
        example = 3000;
        description = ''
          The port under which the app should be accessible.
        '';
      };

      dataDir = lib.mkOption {
        type = lib.types.str;
        default = "/var/lib/xnode-nextjs";
        description = ''
          Directory to store persistent data.
        '';
      };

      adminAddress = lib.mkOption {
        type = lib.types.str;
        description = ''
          Ethereum wallet address of the admin.
        '';
      };

      openFirewall = lib.mkOption {
        type = lib.types.bool;
        default = true;
        description = ''
          Whether to open ports in the firewall for this application.
        '';
      };
    };
  };

  config = lib.mkIf cfg.enable {
    systemd.services.xnode-nextjs-web3-blog = {
      wantedBy = [ "multi-user.target" ];
      description = "Nextjs App";
      after = [ "network.target" ];
      environment = {
        HOSTNAME = cfg.hostname;
        PORT = toString cfg.port;
        DATA_DIR = "${cfg.dataDir}/data";
        ADMIN_ADDRESS = cfg.adminAddress;
      };
      serviceConfig = {
        ExecStart = "${lib.getExe xnode-nextjs-web3-blog}";
        DynamicUser = true;
        CacheDirectory = "nextjs-app";
        StateDirectory = "xnode-nextjs";
        StateDirectoryMode = "0750";
        RuntimeDirectory = "xnode-nextjs";
        RuntimeDirectoryMode = "0750";
      };

      preStart = ''
        # Ensure data directory exists and has default content if empty
        if [ ! -f "${cfg.dataDir}/data/content.json" ]; then
          mkdir -p "${cfg.dataDir}/data"
          echo '{"pages":{"home":{"title":"Home","content":"Welcome"}}}' > "${cfg.dataDir}/data/content.json"
          chmod 640 "${cfg.dataDir}/data/content.json"
        fi
      '';
    };

    networking.firewall = lib.mkIf cfg.openFirewall {
      allowedTCPPorts = [ cfg.port ];
    };
  };
}