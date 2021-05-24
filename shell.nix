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



  idris_bifunctors = pkgs.idrisPackages.build-idris-package rec {
    name = "idris_bifunctors";
    version = "v4";

    ipkgName = "bifunctors";
    idrisDeps = [pkgs.idrisPackages.contrib pkgs.idrisPackages.containers];
    src = fetchFromGitHub {
      owner = "japesinator";
      repo = "Idris-Bifunctors";
      rev = "be7b8bde88331ad3af87e5c0a23fc0f3d52f3868";
      sha256 = "0cfp58lhm2g0g1vrpb0mh71qb44n2yvg5sil9ndyf2sqd5ria6yq";
    };
    #extraBuildInputs = [pkgs.idrisPackages.contrib];
    meta = {
      description = "bifunctors";
      homepage = "https://github.com/japesinator/Idris-Bifunctors";
      license = lib.licenses.bsd2;
      maintainers = [  ];
    };
  };

  idris_profunctors = pkgs.idrisPackages.build-idris-package rec {
    name = "idris_profunctors";
    version = "v4";

    ipkgName = "profunctors";
    idrisDeps = [pkgs.idrisPackages.contrib idris_bifunctors];
    src = fetchFromGitHub {
      owner = "Ptival";
      repo = "Idris-Profunctors";
      rev = "89ebf3f13a8e58280c08a378e94e8a505b53f2fc";
      sha256 = "13r7550rq0cn6rmj2x05ybla6spw24yfs7ydw15h4x8c83ahca76";
    };
    #extraBuildInputs = [pkgs.idrisPackages.contrib];
    meta = {
      description = "bifunctors";
      homepage = "https://github.com/Ptival/Idris-Profunctors.git";
      license = lib.licenses.bsd2;
      maintainers = [  ];
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
    (idrisPackages.with-packages (with idrisPackages; [ contrib pruviloj bytes array base containers my_free rationals lightyear idris_xml idris_commons idris_bifunctors idris_profunctors]))
    gmp
    (import "/home/jan/github.com/tcat/y.nix")
    yarn
    sass
    nodejs
     (with nodePackages; [
                    #babel
                    #replem
                    browserify
      #              yarn
                    #yarn2nix
#                    postgres
#                    puppeteer
                    #npm2nix
                    #coffee-script
                    #jsonlint
                    ])


    
  ];
}
