{  }:
  allDeps:
    {
      key = { name = "tcat"; scope = ""; };
      version = "2.0.0";
      nodeBuildInputs = let
        a = allDeps;
      in [
        (a."pg@^8.6.0")
        (a."browserify@^17.0.0")
        (a."websocket@^1.0.34")
        (a."pg-cursor@^2.6.0")
        (a."puppeteer@^8.0.0")
        (a."nodejs@^0.0.0")
        ];
      meta = {
        license = {
          fullName = "GNU General Public License v3.0 only";
          shortName = "gpl3Only";
          spdxId = "GPL-3.0-only";
          url = "https://spdx.org/licenses/GPL-3.0-only.html";
          };
        };
      }
