let
    pkgs = import <nixpkgs> {};
    node = pkgs.nodejs-12_x;
in pkgs.stdenv.mkDerivation {
    name = "rsshhub-devenv";
    buildInputs = [node pkgs.yarn];
}
