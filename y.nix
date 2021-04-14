let
  pkgs = import <nixpkgs> {};
  yarn2nix = import /home/jan/github.com/yarn2nix {};
  nixLib = yarn2nix.nixLib;

in
  nixLib.buildNodePackage
    ( { src = nixLib.removePrefixes [ "node_modules" ] ./.; } //
      nixLib.callTemplate ./npm-package.nix
        (nixLib.buildNodeDeps (pkgs.callPackage ./npm-deps.nix {})))
    
