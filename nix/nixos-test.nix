# nixos-test.nix
{ pkgs, system, ... }:
let
  testing = import "${toString pkgs.path}/nixos/lib/testing-python.nix" { inherit system pkgs; };
in
testing.makeTest {
  name = "xnode-nextjs-web3-blog";

  nodes.machine =
    { pkgs, ... }:
    {
      imports = [ ./nixos-module.nix ];
      services.xnode-nextjs-web3-blog = {
        enable = true;
        port = 8080;
        adminAddress = ""; #add admin address here
      };
    };

  testScript = ''
    # Ensure the service is started and reachable
    machine.wait_for_unit("xnode-nextjs-web3-blog.service")
    machine.wait_for_open_port(8080)
    machine.succeed("curl --fail http://127.0.0.1:8080")
    
    # Test data directory exists and is writable
    machine.succeed("test -d /var/lib/xnode-nextjs/data")
    machine.succeed("test -f /var/lib/xnode-nextjs/data/content.json")
  '';
}