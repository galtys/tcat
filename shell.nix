{ pkgs ? import <nixpkgs> {} }:
with pkgs;

let
  pp = "muf";
  my_free = pkgs.idrisPackages.build-idris-package rec {
    name = "idris_free";
    version = "v4";

    ipkgName = "idris-free";
    idrisDeps = [pkgs.idrisPackages.contrib];
    src = fetchFromGitHub {
      owner = "galtys";
      repo = "idris-free";
      # rev = "919950fb6a9d97c139c2d102402fec094a99c397";
      rev = "9521fdeeebb151551311aed5c5db98232b7e62a4";
      #sha256 = "1n4daf1acjkd73an4m31yp9g616crjb7h5z02f1gj29wm3dbx5s6";
      sha256 = "1yanvzijnkzscf5f2fx4zh4kkc6i0pmasdyg49smqp32da219lqc";
    };
  #extraBuildInputs = [pkgs.idrisPackages.contrib];
    meta = {
      description = "Free Monads and useful constructions to work with them";
      homepage = "https://github.com/galtys/idris-free";
      license = lib.licenses.bsd2;
      maintainers = [ lib.maintainers.brainrape ];
    };
  };


  idris_commons = pkgs.idrisPackages.build-idris-package rec {
    name = "idris_commons";
    version = "v4";

    ipkgName = "commons";
    idrisDeps = [pkgs.idrisPackages.contrib pkgs.idrisPackages.containers];
    src = fetchFromGitHub {
      owner = "galtys";
      repo = "idris-commons";
      rev = "df32dc33c253709751fe0f9f2b57cd5d497eccd4";

      sha256 = "1dz2qvl91nymy516hxjrmxbpbk0347zksbfc3z3w2dw7d5pw7crm";
    };
  #extraBuildInputs = [pkgs.idrisPackages.contrib];
    meta = {
      description = "commons";
      homepage = "https://github.com/galtys/idris-commons";
      license = lib.licenses.bsd2;
      maintainers = [];
    };
  };



  

  idris_xml = pkgs.idrisPackages.build-idris-package rec {
    name = "idris_xml";
    version = "v4";

    ipkgName = "xml";
    idrisDeps = [pkgs.idrisPackages.contrib pkgs.idrisPackages.containers idris_commons];
    src = fetchFromGitHub {
      owner = "galtys";
      repo = "idris-xml";
      rev = "d03377aaa7af81a5e9af53f843291fa9f381b697";
      sha256 = "1ka7wwrv4rvi6zvq5fkxiksfgqkbkgd6ffny37csyhv5ch42xlac";
    };
    #extraBuildInputs = [pkgs.idrisPackages.contrib];
    meta = {
      description = "xml";
      homepage = "https://github.com/galtys/idris-xml";
      license = lib.licenses.bsd2;
      maintainers = [  ];
    };
  };
  
in 

stdenv.mkDerivation {
  name = "idris-env";
  buildInputs = [
    (idrisPackages.with-packages (with idrisPackages; [ contrib pruviloj bytes array base containers my_free rationals lightyear idris_xml idris_commons]))
    gmp
  ];
}
