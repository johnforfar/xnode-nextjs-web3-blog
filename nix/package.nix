# package.nix
{ pkgs, lib }:
pkgs.buildNpmPackage {
  pname = "xnode-nextjs-web3-blog";
  version = "1.0.0";
  src = ../nextjs-app;

  npmDeps = pkgs.importNpmLock {
    npmRoot = ../nextjs-app;
  };
  npmConfigHook = pkgs.importNpmLock.npmConfigHook;

  postBuild = ''
    # Add a shebang to the server js file, then patch the shebang to use a
    # nixpkgs nodes binary
    sed -i '1s|^|#!/usr/bin/env node\n|' .next/standalone/server.js
    patchShebangs .next/standalone/server.js
  '';

  installPhase = ''
    runHook preInstall

    mkdir -p $out/{share,bin}

    cp -r .next/standalone $out/share/homepage/
    cp -r public $out/share/homepage/public

    # Add initial data directory with default content
    mkdir -p $out/share/homepage/data
    echo '{"pages":{"home":{"title":"Home","content":"Welcome"}}}' > $out/share/homepage/data/content.json

    mkdir -p $out/share/homepage/.next
    cp -r .next/static $out/share/homepage/.next/static

    # https://github.com/vercel/next.js/discussions/58864
    ln -s /var/cache/nextjs-app $out/share/homepage/.next/cache

    chmod +x $out/share/homepage/server.js

    # we set a default port to support "nix run ..."
    makeWrapper $out/share/homepage/server.js $out/bin/xnode-nextjs-web3-blog \
      --set-default PORT 3000 \
      --set-default HOSTNAME 0.0.0.0 \
      --set-default DATA_DIR "/var/lib/xnode-nextjs/data"

    runHook postInstall
  '';

  doDist = false;

  meta = {
    mainProgram = "xnode-nextjs-web3-blog";
  };
}