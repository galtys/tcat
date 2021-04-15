{ fetchurl, fetchgit }:
  self:
    super:
      let
        registries = {
          yarn = n:
            v:
              "https://registry.yarnpkg.com/${n}/-/${n}-${v}.tgz";
          npm = n:
            v:
              "https://registry.npmjs.org/${n}/-/${n}-${v}.tgz";
          };
        nodeFilePackage = key:
          version:
            registry:
              sha1:
                deps:
                  super._buildNodePackage {
                    inherit key version;
                    src = fetchurl {
                      url = registry key version;
                      inherit sha1;
                      };
                    nodeBuildInputs = deps;
                    };
        nodeFileLocalPackage = key:
          version:
            path:
              sha1:
                deps:
                  super._buildNodePackage {
                    inherit key version;
                    src = builtins.path { inherit path; };
                    nodeBuildInputs = deps;
                    };
        nodeGitPackage = key:
          version:
            url:
              rev:
                sha256:
                  deps:
                    super._buildNodePackage {
                      inherit key version;
                      src = fetchgit { inherit url rev sha256; };
                      nodeBuildInputs = deps;
                      };
        identityRegistry = url:
          _:
            _:
              url;
        scopedName = scope:
          name:
            { inherit scope name; };
        ir = identityRegistry;
        l = nodeFileLocalPackage;
        f = nodeFilePackage;
        g = nodeGitPackage;
        n = registries.npm;
        y = registries.yarn;
        sc = scopedName;
        s = self;
      in {
        "@types/node@*" = s."@types/node@14.14.37";
        "@types/node@14.14.37" = f (sc "types" "node") "14.14.37" (ir "https://registry.yarnpkg.com/@types/node/-/node-14.14.37.tgz") "a3dd8da4eb84a996c36e331df98d82abd76b516e" [];
        "@types/yauzl@2.9.1" = f (sc "types" "yauzl") "2.9.1" (ir "https://registry.yarnpkg.com/@types/yauzl/-/yauzl-2.9.1.tgz") "d10f69f9f522eef3cf98e30afb684a1e1ec923af" [
          (s."@types/node@*")
          ];
        "@types/yauzl@^2.9.1" = s."@types/yauzl@2.9.1";
        "JSONStream@1.3.5" = f "JSONStream" "1.3.5" y "3208c1f08d3a4d99261ab64f92302bc15e111ca0" [
          (s."jsonparse@^1.2.0")
          (s."through@>=2.2.7 <3")
          ];
        "JSONStream@^1.0.3" = s."JSONStream@1.3.5";
        "acorn-node@1.8.2" = f "acorn-node" "1.8.2" y "114c95d64539e53dede23de8b9d96df7c7ae2af8" [
          (s."acorn@^7.0.0")
          (s."acorn-walk@^7.0.0")
          (s."xtend@^4.0.2")
          ];
        "acorn-node@^1.2.0" = s."acorn-node@1.8.2";
        "acorn-node@^1.3.0" = s."acorn-node@1.8.2";
        "acorn-node@^1.5.2" = s."acorn-node@1.8.2";
        "acorn-node@^1.6.1" = s."acorn-node@1.8.2";
        "acorn-walk@7.2.0" = f "acorn-walk" "7.2.0" y "0de889a601203909b0fbe07b8938dc21d2e967bc" [];
        "acorn-walk@^7.0.0" = s."acorn-walk@7.2.0";
        "acorn@7.4.1" = f "acorn" "7.4.1" y "feaed255973d2e77555b83dbc08851a6c63520fa" [];
        "acorn@^7.0.0" = s."acorn@7.4.1";
        "agent-base@6" = s."agent-base@6.0.2";
        "agent-base@6.0.2" = f "agent-base" "6.0.2" y "49fff58577cfee3f37176feab4c22e00f86d7f77" [
          (s."debug@4")
          ];
        "array-filter@1.0.0" = f "array-filter" "1.0.0" y "baf79e62e6ef4c2a4c0b831232daffec251f9d83" [];
        "array-filter@^1.0.0" = s."array-filter@1.0.0";
        "asn1.js@5.4.1" = f "asn1.js" "5.4.1" y "11a980b84ebb91781ce35b0fdc2ee294e3783f07" [
          (s."bn.js@^4.0.0")
          (s."inherits@^2.0.1")
          (s."minimalistic-assert@^1.0.0")
          (s."safer-buffer@^2.1.0")
          ];
        "asn1.js@^5.2.0" = s."asn1.js@5.4.1";
        "assert@1.5.0" = f "assert" "1.5.0" y "55c109aaf6e0aefdb3dc4b71240c70bf574b18eb" [
          (s."object-assign@^4.1.1")
          (s."util@0.10.3")
          ];
        "assert@^1.4.0" = s."assert@1.5.0";
        "available-typed-arrays@1.0.2" = f "available-typed-arrays" "1.0.2" y "6b098ca9d8039079ee3f77f7b783c4480ba513f5" [
          (s."array-filter@^1.0.0")
          ];
        "available-typed-arrays@^1.0.2" = s."available-typed-arrays@1.0.2";
        "balanced-match@1.0.2" = f "balanced-match" "1.0.2" y "e83e3a7e3f300b34cb9d87f615fa0cbf357690ee" [];
        "balanced-match@^1.0.0" = s."balanced-match@1.0.2";
        "base64-js@1.5.1" = f "base64-js" "1.5.1" y "1b1b440160a5bf7ad40b650f095963481903930a" [];
        "base64-js@^1.0.2" = s."base64-js@1.5.1";
        "base64-js@^1.3.1" = s."base64-js@1.5.1";
        "bl@4.1.0" = f "bl" "4.1.0" y "451535264182bec2fbbc83a62ab98cf11d9f7b3a" [
          (s."buffer@^5.5.0")
          (s."inherits@^2.0.4")
          (s."readable-stream@^3.4.0")
          ];
        "bl@^4.0.3" = s."bl@4.1.0";
        "bn.js@4.12.0" = f "bn.js" "4.12.0" y "775b3f278efbb9718eec7361f483fb36fbbfea88" [];
        "bn.js@5.2.0" = f "bn.js" "5.2.0" y "358860674396c6997771a9d051fcc1b57d4ae002" [];
        "bn.js@^4.0.0" = s."bn.js@4.12.0";
        "bn.js@^4.1.0" = s."bn.js@4.12.0";
        "bn.js@^4.11.9" = s."bn.js@4.12.0";
        "bn.js@^5.0.0" = s."bn.js@5.2.0";
        "bn.js@^5.1.1" = s."bn.js@5.2.0";
        "brace-expansion@1.1.11" = f "brace-expansion" "1.1.11" y "3c7fcbf529d87226f3d2f52b966ff5271eb441dd" [
          (s."balanced-match@^1.0.0")
          (s."concat-map@0.0.1")
          ];
        "brace-expansion@^1.1.7" = s."brace-expansion@1.1.11";
        "brorand@1.1.0" = f "brorand" "1.1.0" y "12c25efe40a45e3c323eb8675a0a0ce57b22371f" [];
        "brorand@^1.0.1" = s."brorand@1.1.0";
        "brorand@^1.1.0" = s."brorand@1.1.0";
        "browser-pack@6.1.0" = f "browser-pack" "6.1.0" y "c34ba10d0b9ce162b5af227c7131c92c2ecd5774" [
          (s."JSONStream@^1.0.3")
          (s."combine-source-map@~0.8.0")
          (s."defined@^1.0.0")
          (s."safe-buffer@^5.1.1")
          (s."through2@^2.0.0")
          (s."umd@^3.0.0")
          ];
        "browser-pack@^6.0.1" = s."browser-pack@6.1.0";
        "browser-resolve@2.0.0" = f "browser-resolve" "2.0.0" y "99b7304cb392f8d73dba741bb2d7da28c6d7842b" [
          (s."resolve@^1.17.0")
          ];
        "browser-resolve@^2.0.0" = s."browser-resolve@2.0.0";
        "browserify-aes@1.2.0" = f "browserify-aes" "1.2.0" y "326734642f403dabc3003209853bb70ad428ef48" [
          (s."buffer-xor@^1.0.3")
          (s."cipher-base@^1.0.0")
          (s."create-hash@^1.1.0")
          (s."evp_bytestokey@^1.0.3")
          (s."inherits@^2.0.1")
          (s."safe-buffer@^5.0.1")
          ];
        "browserify-aes@^1.0.0" = s."browserify-aes@1.2.0";
        "browserify-aes@^1.0.4" = s."browserify-aes@1.2.0";
        "browserify-cipher@1.0.1" = f "browserify-cipher" "1.0.1" y "8d6474c1b870bfdabcd3bcfcc1934a10e94f15f0" [
          (s."browserify-aes@^1.0.4")
          (s."browserify-des@^1.0.0")
          (s."evp_bytestokey@^1.0.0")
          ];
        "browserify-cipher@^1.0.0" = s."browserify-cipher@1.0.1";
        "browserify-des@1.0.2" = f "browserify-des" "1.0.2" y "3af4f1f59839403572f1c66204375f7a7f703e9c" [
          (s."cipher-base@^1.0.1")
          (s."des.js@^1.0.0")
          (s."inherits@^2.0.1")
          (s."safe-buffer@^5.1.2")
          ];
        "browserify-des@^1.0.0" = s."browserify-des@1.0.2";
        "browserify-rsa@4.1.0" = f "browserify-rsa" "4.1.0" y "b2fd06b5b75ae297f7ce2dc651f918f5be158c8d" [
          (s."bn.js@^5.0.0")
          (s."randombytes@^2.0.1")
          ];
        "browserify-rsa@^4.0.0" = s."browserify-rsa@4.1.0";
        "browserify-rsa@^4.0.1" = s."browserify-rsa@4.1.0";
        "browserify-sign@4.2.1" = f "browserify-sign" "4.2.1" y "eaf4add46dd54be3bb3b36c0cf15abbeba7956c3" [
          (s."bn.js@^5.1.1")
          (s."browserify-rsa@^4.0.1")
          (s."create-hash@^1.2.0")
          (s."create-hmac@^1.1.7")
          (s."elliptic@^6.5.3")
          (s."inherits@^2.0.4")
          (s."parse-asn1@^5.1.5")
          (s."readable-stream@^3.6.0")
          (s."safe-buffer@^5.2.0")
          ];
        "browserify-sign@^4.0.0" = s."browserify-sign@4.2.1";
        "browserify-zlib@0.2.0" = f "browserify-zlib" "0.2.0" y "2869459d9aa3be245fe8fe2ca1f46e2e7f54d73f" [
          (s."pako@~1.0.5")
          ];
        "browserify-zlib@~0.2.0" = s."browserify-zlib@0.2.0";
        "browserify@17.0.0" = f "browserify" "17.0.0" y "4c48fed6c02bfa2b51fd3b670fddb805723cdc22" [
          (s."JSONStream@^1.0.3")
          (s."assert@^1.4.0")
          (s."browser-pack@^6.0.1")
          (s."browser-resolve@^2.0.0")
          (s."browserify-zlib@~0.2.0")
          (s."buffer@~5.2.1")
          (s."cached-path-relative@^1.0.0")
          (s."concat-stream@^1.6.0")
          (s."console-browserify@^1.1.0")
          (s."constants-browserify@~1.0.0")
          (s."crypto-browserify@^3.0.0")
          (s."defined@^1.0.0")
          (s."deps-sort@^2.0.1")
          (s."domain-browser@^1.2.0")
          (s."duplexer2@~0.1.2")
          (s."events@^3.0.0")
          (s."glob@^7.1.0")
          (s."has@^1.0.0")
          (s."htmlescape@^1.1.0")
          (s."https-browserify@^1.0.0")
          (s."inherits@~2.0.1")
          (s."insert-module-globals@^7.2.1")
          (s."labeled-stream-splicer@^2.0.0")
          (s."mkdirp-classic@^0.5.2")
          (s."module-deps@^6.2.3")
          (s."os-browserify@~0.3.0")
          (s."parents@^1.0.1")
          (s."path-browserify@^1.0.0")
          (s."process@~0.11.0")
          (s."punycode@^1.3.2")
          (s."querystring-es3@~0.2.0")
          (s."read-only-stream@^2.0.0")
          (s."readable-stream@^2.0.2")
          (s."resolve@^1.1.4")
          (s."shasum-object@^1.0.0")
          (s."shell-quote@^1.6.1")
          (s."stream-browserify@^3.0.0")
          (s."stream-http@^3.0.0")
          (s."string_decoder@^1.1.1")
          (s."subarg@^1.0.0")
          (s."syntax-error@^1.1.1")
          (s."through2@^2.0.0")
          (s."timers-browserify@^1.0.1")
          (s."tty-browserify@0.0.1")
          (s."url@~0.11.0")
          (s."util@~0.12.0")
          (s."vm-browserify@^1.0.0")
          (s."xtend@^4.0.0")
          ];
        "browserify@^17.0.0" = s."browserify@17.0.0";
        "buffer-crc32@0.2.13" = f "buffer-crc32" "0.2.13" y "0d333e3f00eac50aa1454abd30ef8c2a5d9a7242" [];
        "buffer-crc32@~0.2.3" = s."buffer-crc32@0.2.13";
        "buffer-from@1.1.1" = f "buffer-from" "1.1.1" y "32713bc028f75c02fdb710d7c7bcec1f2c6070ef" [];
        "buffer-from@^1.0.0" = s."buffer-from@1.1.1";
        "buffer-writer@2.0.0" = f "buffer-writer" "2.0.0" y "ce7eb81a38f7829db09c873f2fbb792c0c98ec04" [];
        "buffer-xor@1.0.3" = f "buffer-xor" "1.0.3" y "26e61ed1422fb70dd42e6e36729ed51d855fe8d9" [];
        "buffer-xor@^1.0.3" = s."buffer-xor@1.0.3";
        "buffer@5.2.1" = f "buffer" "5.2.1" y "dd57fa0f109ac59c602479044dca7b8b3d0b71d6" [
          (s."base64-js@^1.0.2")
          (s."ieee754@^1.1.4")
          ];
        "buffer@5.7.1" = f "buffer" "5.7.1" y "ba62e7c13133053582197160851a8f648e99eed0" [
          (s."base64-js@^1.3.1")
          (s."ieee754@^1.1.13")
          ];
        "buffer@^5.2.1" = s."buffer@5.7.1";
        "buffer@^5.5.0" = s."buffer@5.7.1";
        "buffer@~5.2.1" = s."buffer@5.2.1";
        "builtin-status-codes@3.0.0" = f "builtin-status-codes" "3.0.0" y "85982878e21b98e1c66425e03d0174788f569ee8" [];
        "builtin-status-codes@^3.0.0" = s."builtin-status-codes@3.0.0";
        "cached-path-relative@1.0.2" = f "cached-path-relative" "1.0.2" y "a13df4196d26776220cc3356eb147a52dba2c6db" [];
        "cached-path-relative@^1.0.0" = s."cached-path-relative@1.0.2";
        "cached-path-relative@^1.0.2" = s."cached-path-relative@1.0.2";
        "call-bind@1.0.2" = f "call-bind" "1.0.2" y "b1d4e89e688119c3c9a903ad30abb2f6a919be3c" [
          (s."function-bind@^1.1.1")
          (s."get-intrinsic@^1.0.2")
          ];
        "call-bind@^1.0.0" = s."call-bind@1.0.2";
        "call-bind@^1.0.2" = s."call-bind@1.0.2";
        "chownr@1.1.4" = f "chownr" "1.1.4" y "6fc9d7b42d32a583596337666e7d08084da2cc6b" [];
        "chownr@^1.1.1" = s."chownr@1.1.4";
        "cipher-base@1.0.4" = f "cipher-base" "1.0.4" y "8760e4ecc272f4c363532f926d874aae2c1397de" [
          (s."inherits@^2.0.1")
          (s."safe-buffer@^5.0.1")
          ];
        "cipher-base@^1.0.0" = s."cipher-base@1.0.4";
        "cipher-base@^1.0.1" = s."cipher-base@1.0.4";
        "cipher-base@^1.0.3" = s."cipher-base@1.0.4";
        "combine-source-map@0.8.0" = f "combine-source-map" "0.8.0" y "a58d0df042c186fcf822a8e8015f5450d2d79a8b" [
          (s."convert-source-map@~1.1.0")
          (s."inline-source-map@~0.6.0")
          (s."lodash.memoize@~3.0.3")
          (s."source-map@~0.5.3")
          ];
        "combine-source-map@^0.8.0" = s."combine-source-map@0.8.0";
        "combine-source-map@~0.8.0" = s."combine-source-map@0.8.0";
        "concat-map@0.0.1" = f "concat-map" "0.0.1" y "d8a96bd77fd68df7793a73036a3ba0d5405d477b" [];
        "concat-stream@1.6.2" = f "concat-stream" "1.6.2" y "904bdf194cd3122fc675c77fc4ac3d4ff0fd1a34" [
          (s."buffer-from@^1.0.0")
          (s."inherits@^2.0.3")
          (s."readable-stream@^2.2.2")
          (s."typedarray@^0.0.6")
          ];
        "concat-stream@^1.6.0" = s."concat-stream@1.6.2";
        "concat-stream@^1.6.1" = s."concat-stream@1.6.2";
        "concat-stream@~1.6.0" = s."concat-stream@1.6.2";
        "console-browserify@1.2.0" = f "console-browserify" "1.2.0" y "67063cef57ceb6cf4993a2ab3a55840ae8c49336" [];
        "console-browserify@^1.1.0" = s."console-browserify@1.2.0";
        "constants-browserify@1.0.0" = f "constants-browserify" "1.0.0" y "c20b96d8c617748aaf1c16021760cd27fcb8cb75" [];
        "constants-browserify@~1.0.0" = s."constants-browserify@1.0.0";
        "convert-source-map@1.1.3" = f "convert-source-map" "1.1.3" y "4829c877e9fe49b3161f3bf3673888e204699860" [];
        "convert-source-map@~1.1.0" = s."convert-source-map@1.1.3";
        "core-util-is@1.0.2" = f "core-util-is" "1.0.2" y "b5fd54220aa2bc5ab57aab7140c940754503c1a7" [];
        "core-util-is@~1.0.0" = s."core-util-is@1.0.2";
        "create-ecdh@4.0.4" = f "create-ecdh" "4.0.4" y "d6e7f4bffa66736085a0762fd3a632684dabcc4e" [
          (s."bn.js@^4.1.0")
          (s."elliptic@^6.5.3")
          ];
        "create-ecdh@^4.0.0" = s."create-ecdh@4.0.4";
        "create-hash@1.2.0" = f "create-hash" "1.2.0" y "889078af11a63756bcfb59bd221996be3a9ef196" [
          (s."cipher-base@^1.0.1")
          (s."inherits@^2.0.1")
          (s."md5.js@^1.3.4")
          (s."ripemd160@^2.0.1")
          (s."sha.js@^2.4.0")
          ];
        "create-hash@^1.1.0" = s."create-hash@1.2.0";
        "create-hash@^1.1.2" = s."create-hash@1.2.0";
        "create-hash@^1.2.0" = s."create-hash@1.2.0";
        "create-hmac@1.1.7" = f "create-hmac" "1.1.7" y "69170c78b3ab957147b2b8b04572e47ead2243ff" [
          (s."cipher-base@^1.0.3")
          (s."create-hash@^1.1.0")
          (s."inherits@^2.0.1")
          (s."ripemd160@^2.0.0")
          (s."safe-buffer@^5.0.1")
          (s."sha.js@^2.4.8")
          ];
        "create-hmac@^1.1.0" = s."create-hmac@1.1.7";
        "create-hmac@^1.1.4" = s."create-hmac@1.1.7";
        "create-hmac@^1.1.7" = s."create-hmac@1.1.7";
        "crypto-browserify@3.12.0" = f "crypto-browserify" "3.12.0" y "396cf9f3137f03e4b8e532c58f698254e00f80ec" [
          (s."browserify-cipher@^1.0.0")
          (s."browserify-sign@^4.0.0")
          (s."create-ecdh@^4.0.0")
          (s."create-hash@^1.1.0")
          (s."create-hmac@^1.1.0")
          (s."diffie-hellman@^5.0.0")
          (s."inherits@^2.0.1")
          (s."pbkdf2@^3.0.3")
          (s."public-encrypt@^4.0.0")
          (s."randombytes@^2.0.0")
          (s."randomfill@^1.0.3")
          ];
        "crypto-browserify@^3.0.0" = s."crypto-browserify@3.12.0";
        "dash-ast@1.0.0" = f "dash-ast" "1.0.0" y "12029ba5fb2f8aa6f0a861795b23c1b4b6c27d37" [];
        "dash-ast@^1.0.0" = s."dash-ast@1.0.0";
        "debug@4" = s."debug@4.3.1";
        "debug@4.3.1" = f "debug" "4.3.1" y "f0d229c505e0c6d8c49ac553d1b13dc183f6b2ee" [
          (s."ms@2.1.2")
          ];
        "debug@^4.1.0" = s."debug@4.3.1";
        "debug@^4.1.1" = s."debug@4.3.1";
        "define-properties@1.1.3" = f "define-properties" "1.1.3" y "cf88da6cbee26fe6db7094f61d870cbd84cee9f1" [
          (s."object-keys@^1.0.12")
          ];
        "define-properties@^1.1.3" = s."define-properties@1.1.3";
        "defined@1.0.0" = f "defined" "1.0.0" y "c98d9bcef75674188e110969151199e39b1fa693" [];
        "defined@^1.0.0" = s."defined@1.0.0";
        "deps-sort@2.0.1" = f "deps-sort" "2.0.1" y "9dfdc876d2bcec3386b6829ac52162cda9fa208d" [
          (s."JSONStream@^1.0.3")
          (s."shasum-object@^1.0.0")
          (s."subarg@^1.0.0")
          (s."through2@^2.0.0")
          ];
        "deps-sort@^2.0.1" = s."deps-sort@2.0.1";
        "des.js@1.0.1" = f "des.js" "1.0.1" y "5382142e1bdc53f85d86d53e5f4aa7deb91e0843" [
          (s."inherits@^2.0.1")
          (s."minimalistic-assert@^1.0.0")
          ];
        "des.js@^1.0.0" = s."des.js@1.0.1";
        "detective@5.2.0" = f "detective" "5.2.0" y "feb2a77e85b904ecdea459ad897cc90a99bd2a7b" [
          (s."acorn-node@^1.6.1")
          (s."defined@^1.0.0")
          (s."minimist@^1.1.1")
          ];
        "detective@^5.2.0" = s."detective@5.2.0";
        "devtools-protocol@0.0.854822" = f "devtools-protocol" "0.0.854822" y "eac3a5260a6b3b4e729a09fdc0c77b0d322e777b" [];
        "diffie-hellman@5.0.3" = f "diffie-hellman" "5.0.3" y "40e8ee98f55a2149607146921c63e1ae5f3d2875" [
          (s."bn.js@^4.1.0")
          (s."miller-rabin@^4.0.0")
          (s."randombytes@^2.0.0")
          ];
        "diffie-hellman@^5.0.0" = s."diffie-hellman@5.0.3";
        "domain-browser@1.2.0" = f "domain-browser" "1.2.0" y "3d31f50191a6749dd1375a7f522e823d42e54eda" [];
        "domain-browser@^1.2.0" = s."domain-browser@1.2.0";
        "duplexer2@0.1.4" = f "duplexer2" "0.1.4" y "8b12dab878c0d69e3e7891051662a32fc6bddcc1" [
          (s."readable-stream@^2.0.2")
          ];
        "duplexer2@^0.1.2" = s."duplexer2@0.1.4";
        "duplexer2@~0.1.0" = s."duplexer2@0.1.4";
        "duplexer2@~0.1.2" = s."duplexer2@0.1.4";
        "elliptic@6.5.4" = f "elliptic" "6.5.4" y "da37cebd31e79a1367e941b592ed1fbebd58abbb" [
          (s."bn.js@^4.11.9")
          (s."brorand@^1.1.0")
          (s."hash.js@^1.0.0")
          (s."hmac-drbg@^1.0.1")
          (s."inherits@^2.0.4")
          (s."minimalistic-assert@^1.0.1")
          (s."minimalistic-crypto-utils@^1.0.1")
          ];
        "elliptic@^6.5.3" = s."elliptic@6.5.4";
        "end-of-stream@1.4.4" = f "end-of-stream" "1.4.4" y "5ae64a5f45057baf3626ec14da0ca5e4b2431eb0" [
          (s."once@^1.4.0")
          ];
        "end-of-stream@^1.1.0" = s."end-of-stream@1.4.4";
        "end-of-stream@^1.4.1" = s."end-of-stream@1.4.4";
        "es-abstract@1.18.0" = f "es-abstract" "1.18.0" y "ab80b359eecb7ede4c298000390bc5ac3ec7b5a4" [
          (s."call-bind@^1.0.2")
          (s."es-to-primitive@^1.2.1")
          (s."function-bind@^1.1.1")
          (s."get-intrinsic@^1.1.1")
          (s."has@^1.0.3")
          (s."has-symbols@^1.0.2")
          (s."is-callable@^1.2.3")
          (s."is-negative-zero@^2.0.1")
          (s."is-regex@^1.1.2")
          (s."is-string@^1.0.5")
          (s."object-inspect@^1.9.0")
          (s."object-keys@^1.1.1")
          (s."object.assign@^4.1.2")
          (s."string.prototype.trimend@^1.0.4")
          (s."string.prototype.trimstart@^1.0.4")
          (s."unbox-primitive@^1.0.0")
          ];
        "es-abstract@^1.18.0-next.1" = s."es-abstract@1.18.0";
        "es-abstract@^1.18.0-next.2" = s."es-abstract@1.18.0";
        "es-to-primitive@1.2.1" = f "es-to-primitive" "1.2.1" y "e55cd4c9cdc188bcefb03b366c736323fc5c898a" [
          (s."is-callable@^1.1.4")
          (s."is-date-object@^1.0.1")
          (s."is-symbol@^1.0.2")
          ];
        "es-to-primitive@^1.2.1" = s."es-to-primitive@1.2.1";
        "events@3.3.0" = f "events" "3.3.0" y "31a95ad0a924e2d2c419a813aeb2c4e878ea7400" [];
        "events@^3.0.0" = s."events@3.3.0";
        "evp_bytestokey@1.0.3" = f "evp_bytestokey" "1.0.3" y "7fcbdb198dc71959432efe13842684e0525acb02" [
          (s."md5.js@^1.3.4")
          (s."safe-buffer@^5.1.1")
          ];
        "evp_bytestokey@^1.0.0" = s."evp_bytestokey@1.0.3";
        "evp_bytestokey@^1.0.3" = s."evp_bytestokey@1.0.3";
        "extract-zip@2.0.1" = f "extract-zip" "2.0.1" y "663dca56fe46df890d5f131ef4a06d22bb8ba13a" [
          (s."debug@^4.1.1")
          (s."get-stream@^5.1.0")
          (s."yauzl@^2.10.0")
          (s."@types/yauzl@^2.9.1")
          ];
        "extract-zip@^2.0.0" = s."extract-zip@2.0.1";
        "fast-safe-stringify@2.0.7" = f "fast-safe-stringify" "2.0.7" y "124aa885899261f68aedb42a7c080de9da608743" [];
        "fast-safe-stringify@^2.0.7" = s."fast-safe-stringify@2.0.7";
        "fd-slicer@1.1.0" = f "fd-slicer" "1.1.0" y "25c7c89cb1f9077f8891bbe61d8f390eae256f1e" [
          (s."pend@~1.2.0")
          ];
        "fd-slicer@~1.1.0" = s."fd-slicer@1.1.0";
        "find-up@4.1.0" = f "find-up" "4.1.0" y "97afe7d6cdc0bc5928584b7c8d7b16e8a9aa5d19" [
          (s."locate-path@^5.0.0")
          (s."path-exists@^4.0.0")
          ];
        "find-up@^4.0.0" = s."find-up@4.1.0";
        "foreach@2.0.5" = f "foreach" "2.0.5" y "0bee005018aeb260d0a3af3ae658dd0136ec1b99" [];
        "foreach@^2.0.5" = s."foreach@2.0.5";
        "fs-constants@1.0.0" = f "fs-constants" "1.0.0" y "6be0de9be998ce16af8afc24497b9ee9b7ccd9ad" [];
        "fs-constants@^1.0.0" = s."fs-constants@1.0.0";
        "fs.realpath@1.0.0" = f "fs.realpath" "1.0.0" y "1504ad2523158caa40db4a2787cb01411994ea4f" [];
        "fs.realpath@^1.0.0" = s."fs.realpath@1.0.0";
        "function-bind@1.1.1" = f "function-bind" "1.1.1" y "a56899d3ea3c9bab874bb9773b7c5ede92f4895d" [];
        "function-bind@^1.1.1" = s."function-bind@1.1.1";
        "get-assigned-identifiers@1.2.0" = f "get-assigned-identifiers" "1.2.0" y "6dbf411de648cbaf8d9169ebb0d2d576191e2ff1" [];
        "get-assigned-identifiers@^1.2.0" = s."get-assigned-identifiers@1.2.0";
        "get-intrinsic@1.1.1" = f "get-intrinsic" "1.1.1" y "15f59f376f855c446963948f0d24cd3637b4abc6" [
          (s."function-bind@^1.1.1")
          (s."has@^1.0.3")
          (s."has-symbols@^1.0.1")
          ];
        "get-intrinsic@^1.0.2" = s."get-intrinsic@1.1.1";
        "get-intrinsic@^1.1.1" = s."get-intrinsic@1.1.1";
        "get-stream@5.2.0" = f "get-stream" "5.2.0" y "4966a1795ee5ace65e706c4b7beb71257d6e22d3" [
          (s."pump@^3.0.0")
          ];
        "get-stream@^5.1.0" = s."get-stream@5.2.0";
        "glob@7.1.6" = f "glob" "7.1.6" y "141f33b81a7c2492e125594307480c46679278a6" [
          (s."fs.realpath@^1.0.0")
          (s."inflight@^1.0.4")
          (s."inherits@2")
          (s."minimatch@^3.0.4")
          (s."once@^1.3.0")
          (s."path-is-absolute@^1.0.0")
          ];
        "glob@^7.1.0" = s."glob@7.1.6";
        "glob@^7.1.3" = s."glob@7.1.6";
        "has-bigints@1.0.1" = f "has-bigints" "1.0.1" y "64fe6acb020673e3b78db035a5af69aa9d07b113" [];
        "has-bigints@^1.0.1" = s."has-bigints@1.0.1";
        "has-symbols@1.0.2" = f "has-symbols" "1.0.2" y "165d3070c00309752a1236a479331e3ac56f1423" [];
        "has-symbols@^1.0.1" = s."has-symbols@1.0.2";
        "has-symbols@^1.0.2" = s."has-symbols@1.0.2";
        "has@1.0.3" = f "has" "1.0.3" y "722d7cbfc1f6aa8241f16dd814e011e1f41e8796" [
          (s."function-bind@^1.1.1")
          ];
        "has@^1.0.0" = s."has@1.0.3";
        "has@^1.0.3" = s."has@1.0.3";
        "hash-base@3.1.0" = f "hash-base" "3.1.0" y "55c381d9e06e1d2997a883b4a3fddfe7f0d3af33" [
          (s."inherits@^2.0.4")
          (s."readable-stream@^3.6.0")
          (s."safe-buffer@^5.2.0")
          ];
        "hash-base@^3.0.0" = s."hash-base@3.1.0";
        "hash.js@1.1.7" = f "hash.js" "1.1.7" y "0babca538e8d4ee4a0f8988d68866537a003cf42" [
          (s."inherits@^2.0.3")
          (s."minimalistic-assert@^1.0.1")
          ];
        "hash.js@^1.0.0" = s."hash.js@1.1.7";
        "hash.js@^1.0.3" = s."hash.js@1.1.7";
        "hmac-drbg@1.0.1" = f "hmac-drbg" "1.0.1" y "d2745701025a6c775a6c545793ed502fc0c649a1" [
          (s."hash.js@^1.0.3")
          (s."minimalistic-assert@^1.0.0")
          (s."minimalistic-crypto-utils@^1.0.1")
          ];
        "hmac-drbg@^1.0.1" = s."hmac-drbg@1.0.1";
        "htmlescape@1.1.1" = f "htmlescape" "1.1.1" y "3a03edc2214bca3b66424a3e7959349509cb0351" [];
        "htmlescape@^1.1.0" = s."htmlescape@1.1.1";
        "https-browserify@1.0.0" = f "https-browserify" "1.0.0" y "ec06c10e0a34c0f2faf199f7fd7fc78fffd03c73" [];
        "https-browserify@^1.0.0" = s."https-browserify@1.0.0";
        "https-proxy-agent@5.0.0" = f "https-proxy-agent" "5.0.0" y "e2a90542abb68a762e0a0850f6c9edadfd8506b2" [
          (s."agent-base@6")
          (s."debug@4")
          ];
        "https-proxy-agent@^5.0.0" = s."https-proxy-agent@5.0.0";
        "ieee754@1.2.1" = f "ieee754" "1.2.1" y "8eb7a10a63fff25d15a57b001586d177d1b0d352" [];
        "ieee754@^1.1.13" = s."ieee754@1.2.1";
        "ieee754@^1.1.4" = s."ieee754@1.2.1";
        "inflight@1.0.6" = f "inflight" "1.0.6" y "49bd6331d7d02d0c09bc910a1075ba8165b56df9" [
          (s."once@^1.3.0")
          (s."wrappy@1")
          ];
        "inflight@^1.0.4" = s."inflight@1.0.6";
        "inherits@2" = s."inherits@2.0.4";
        "inherits@2.0.1" = f "inherits" "2.0.1" y "b17d08d326b4423e568eff719f91b0b1cbdf69f1" [];
        "inherits@2.0.4" = f "inherits" "2.0.4" y "0fa2c64f932917c3433a0ded55363aae37416b7c" [];
        "inherits@^2.0.1" = s."inherits@2.0.4";
        "inherits@^2.0.3" = s."inherits@2.0.4";
        "inherits@^2.0.4" = s."inherits@2.0.4";
        "inherits@~2.0.1" = s."inherits@2.0.4";
        "inherits@~2.0.3" = s."inherits@2.0.4";
        "inherits@~2.0.4" = s."inherits@2.0.4";
        "inline-source-map@0.6.2" = f "inline-source-map" "0.6.2" y "f9393471c18a79d1724f863fa38b586370ade2a5" [
          (s."source-map@~0.5.3")
          ];
        "inline-source-map@~0.6.0" = s."inline-source-map@0.6.2";
        "insert-module-globals@7.2.1" = f "insert-module-globals" "7.2.1" y "d5e33185181a4e1f33b15f7bf100ee91890d5cb3" [
          (s."JSONStream@^1.0.3")
          (s."acorn-node@^1.5.2")
          (s."combine-source-map@^0.8.0")
          (s."concat-stream@^1.6.1")
          (s."is-buffer@^1.1.0")
          (s."path-is-absolute@^1.0.1")
          (s."process@~0.11.0")
          (s."through2@^2.0.0")
          (s."undeclared-identifiers@^1.1.2")
          (s."xtend@^4.0.0")
          ];
        "insert-module-globals@^7.2.1" = s."insert-module-globals@7.2.1";
        "is-arguments@1.1.0" = f "is-arguments" "1.1.0" y "62353031dfbee07ceb34656a6bde59efecae8dd9" [
          (s."call-bind@^1.0.0")
          ];
        "is-arguments@^1.0.4" = s."is-arguments@1.1.0";
        "is-bigint@1.0.1" = f "is-bigint" "1.0.1" y "6923051dfcbc764278540b9ce0e6b3213aa5ebc2" [];
        "is-bigint@^1.0.1" = s."is-bigint@1.0.1";
        "is-boolean-object@1.1.0" = f "is-boolean-object" "1.1.0" y "e2aaad3a3a8fca34c28f6eee135b156ed2587ff0" [
          (s."call-bind@^1.0.0")
          ];
        "is-boolean-object@^1.1.0" = s."is-boolean-object@1.1.0";
        "is-buffer@1.1.6" = f "is-buffer" "1.1.6" y "efaa2ea9daa0d7ab2ea13a97b2b8ad51fefbe8be" [];
        "is-buffer@^1.1.0" = s."is-buffer@1.1.6";
        "is-callable@1.2.3" = f "is-callable" "1.2.3" y "8b1e0500b73a1d76c70487636f368e519de8db8e" [];
        "is-callable@^1.1.4" = s."is-callable@1.2.3";
        "is-callable@^1.2.3" = s."is-callable@1.2.3";
        "is-core-module@2.2.0" = f "is-core-module" "2.2.0" y "97037ef3d52224d85163f5597b2b63d9afed981a" [
          (s."has@^1.0.3")
          ];
        "is-core-module@^2.2.0" = s."is-core-module@2.2.0";
        "is-date-object@1.0.2" = f "is-date-object" "1.0.2" y "bda736f2cd8fd06d32844e7743bfa7494c3bfd7e" [];
        "is-date-object@^1.0.1" = s."is-date-object@1.0.2";
        "is-generator-function@1.0.8" = f "is-generator-function" "1.0.8" y "dfb5c2b120e02b0a8d9d2c6806cd5621aa922f7b" [];
        "is-generator-function@^1.0.7" = s."is-generator-function@1.0.8";
        "is-negative-zero@2.0.1" = f "is-negative-zero" "2.0.1" y "3de746c18dda2319241a53675908d8f766f11c24" [];
        "is-negative-zero@^2.0.1" = s."is-negative-zero@2.0.1";
        "is-number-object@1.0.4" = f "is-number-object" "1.0.4" y "36ac95e741cf18b283fc1ddf5e83da798e3ec197" [];
        "is-number-object@^1.0.4" = s."is-number-object@1.0.4";
        "is-regex@1.1.2" = f "is-regex" "1.1.2" y "81c8ebde4db142f2cf1c53fc86d6a45788266251" [
          (s."call-bind@^1.0.2")
          (s."has-symbols@^1.0.1")
          ];
        "is-regex@^1.1.2" = s."is-regex@1.1.2";
        "is-string@1.0.5" = f "is-string" "1.0.5" y "40493ed198ef3ff477b8c7f92f644ec82a5cd3a6" [];
        "is-string@^1.0.5" = s."is-string@1.0.5";
        "is-symbol@1.0.3" = f "is-symbol" "1.0.3" y "38e1014b9e6329be0de9d24a414fd7441ec61937" [
          (s."has-symbols@^1.0.1")
          ];
        "is-symbol@^1.0.2" = s."is-symbol@1.0.3";
        "is-symbol@^1.0.3" = s."is-symbol@1.0.3";
        "is-typed-array@1.1.5" = f "is-typed-array" "1.1.5" y "f32e6e096455e329eb7b423862456aa213f0eb4e" [
          (s."available-typed-arrays@^1.0.2")
          (s."call-bind@^1.0.2")
          (s."es-abstract@^1.18.0-next.2")
          (s."foreach@^2.0.5")
          (s."has-symbols@^1.0.1")
          ];
        "is-typed-array@^1.1.3" = s."is-typed-array@1.1.5";
        "isarray@1.0.0" = f "isarray" "1.0.0" y "bb935d48582cba168c06834957a54a3e07124f11" [];
        "isarray@~1.0.0" = s."isarray@1.0.0";
        "jsonparse@1.3.1" = f "jsonparse" "1.3.1" y "3f4dae4a91fac315f71062f8521cc239f1366280" [];
        "jsonparse@^1.2.0" = s."jsonparse@1.3.1";
        "labeled-stream-splicer@2.0.2" = f "labeled-stream-splicer" "2.0.2" y "42a41a16abcd46fd046306cf4f2c3576fffb1c21" [
          (s."inherits@^2.0.1")
          (s."stream-splicer@^2.0.0")
          ];
        "labeled-stream-splicer@^2.0.0" = s."labeled-stream-splicer@2.0.2";
        "locate-path@5.0.0" = f "locate-path" "5.0.0" y "1afba396afd676a6d42504d0a67a3a7eb9f62aa0" [
          (s."p-locate@^4.1.0")
          ];
        "locate-path@^5.0.0" = s."locate-path@5.0.0";
        "lodash.memoize@3.0.4" = f "lodash.memoize" "3.0.4" y "2dcbd2c287cbc0a55cc42328bd0c736150d53e3f" [];
        "lodash.memoize@~3.0.3" = s."lodash.memoize@3.0.4";
        "md5.js@1.3.5" = f "md5.js" "1.3.5" y "b5d07b8e3216e3e27cd728d72f70d1e6a342005f" [
          (s."hash-base@^3.0.0")
          (s."inherits@^2.0.1")
          (s."safe-buffer@^5.1.2")
          ];
        "md5.js@^1.3.4" = s."md5.js@1.3.5";
        "miller-rabin@4.0.1" = f "miller-rabin" "4.0.1" y "f080351c865b0dc562a8462966daa53543c78a4d" [
          (s."bn.js@^4.0.0")
          (s."brorand@^1.0.1")
          ];
        "miller-rabin@^4.0.0" = s."miller-rabin@4.0.1";
        "minimalistic-assert@1.0.1" = f "minimalistic-assert" "1.0.1" y "2e194de044626d4a10e7f7fbc00ce73e83e4d5c7" [];
        "minimalistic-assert@^1.0.0" = s."minimalistic-assert@1.0.1";
        "minimalistic-assert@^1.0.1" = s."minimalistic-assert@1.0.1";
        "minimalistic-crypto-utils@1.0.1" = f "minimalistic-crypto-utils" "1.0.1" y "f6c00c1c0b082246e5c4d99dfb8c7c083b2b582a" [];
        "minimalistic-crypto-utils@^1.0.1" = s."minimalistic-crypto-utils@1.0.1";
        "minimatch@3.0.4" = f "minimatch" "3.0.4" y "5166e286457f03306064be5497e8dbb0c3d32083" [
          (s."brace-expansion@^1.1.7")
          ];
        "minimatch@^3.0.4" = s."minimatch@3.0.4";
        "minimist@1.2.5" = f "minimist" "1.2.5" y "67d66014b66a6a8aaa0c083c5fd58df4e4e97602" [];
        "minimist@^1.1.0" = s."minimist@1.2.5";
        "minimist@^1.1.1" = s."minimist@1.2.5";
        "mkdirp-classic@0.5.3" = f "mkdirp-classic" "0.5.3" y "fa10c9115cc6d8865be221ba47ee9bed78601113" [];
        "mkdirp-classic@^0.5.2" = s."mkdirp-classic@0.5.3";
        "module-deps@6.2.3" = f "module-deps" "6.2.3" y "15490bc02af4b56cf62299c7c17cba32d71a96ee" [
          (s."JSONStream@^1.0.3")
          (s."browser-resolve@^2.0.0")
          (s."cached-path-relative@^1.0.2")
          (s."concat-stream@~1.6.0")
          (s."defined@^1.0.0")
          (s."detective@^5.2.0")
          (s."duplexer2@^0.1.2")
          (s."inherits@^2.0.1")
          (s."parents@^1.0.0")
          (s."readable-stream@^2.0.2")
          (s."resolve@^1.4.0")
          (s."stream-combiner2@^1.1.1")
          (s."subarg@^1.0.0")
          (s."through2@^2.0.0")
          (s."xtend@^4.0.0")
          ];
        "module-deps@^6.2.3" = s."module-deps@6.2.3";
        "ms@2.1.2" = f "ms" "2.1.2" y "d09d1f357b443f493382a8eb3ccd183872ae6009" [];
        "node-fetch@2.6.1" = f "node-fetch" "2.6.1" y "045bd323631f76ed2e2b55573394416b639a0052" [];
        "node-fetch@^2.6.1" = s."node-fetch@2.6.1";
        "nodejs@0.0.0" = f "nodejs" "0.0.0" y "4722fa2e18ac4eb73a42ae16d01e3584a12b7531" [];
        "nodejs@^0.0.0" = s."nodejs@0.0.0";
        "object-assign@4.1.1" = f "object-assign" "4.1.1" y "2109adc7965887cfc05cbbd442cac8bfbb360863" [];
        "object-assign@^4.1.1" = s."object-assign@4.1.1";
        "object-inspect@1.9.0" = f "object-inspect" "1.9.0" y "c90521d74e1127b67266ded3394ad6116986533a" [];
        "object-inspect@^1.9.0" = s."object-inspect@1.9.0";
        "object-keys@1.1.1" = f "object-keys" "1.1.1" y "1c47f272df277f3b1daf061677d9c82e2322c60e" [];
        "object-keys@^1.0.12" = s."object-keys@1.1.1";
        "object-keys@^1.1.1" = s."object-keys@1.1.1";
        "object.assign@4.1.2" = f "object.assign" "4.1.2" y "0ed54a342eceb37b38ff76eb831a0e788cb63940" [
          (s."call-bind@^1.0.0")
          (s."define-properties@^1.1.3")
          (s."has-symbols@^1.0.1")
          (s."object-keys@^1.1.1")
          ];
        "object.assign@^4.1.2" = s."object.assign@4.1.2";
        "once@1.4.0" = f "once" "1.4.0" y "583b1aa775961d4b113ac17d9c50baef9dd76bd1" [
          (s."wrappy@1")
          ];
        "once@^1.3.0" = s."once@1.4.0";
        "once@^1.3.1" = s."once@1.4.0";
        "once@^1.4.0" = s."once@1.4.0";
        "os-browserify@0.3.0" = f "os-browserify" "0.3.0" y "854373c7f5c2315914fc9bfc6bd8238fdda1ec27" [];
        "os-browserify@~0.3.0" = s."os-browserify@0.3.0";
        "p-limit@2.3.0" = f "p-limit" "2.3.0" y "3dd33c647a214fdfffd835933eb086da0dc21db1" [
          (s."p-try@^2.0.0")
          ];
        "p-limit@^2.2.0" = s."p-limit@2.3.0";
        "p-locate@4.1.0" = f "p-locate" "4.1.0" y "a3428bb7088b3a60292f66919278b7c297ad4f07" [
          (s."p-limit@^2.2.0")
          ];
        "p-locate@^4.1.0" = s."p-locate@4.1.0";
        "p-try@2.2.0" = f "p-try" "2.2.0" y "cb2868540e313d61de58fafbe35ce9004d5540e6" [];
        "p-try@^2.0.0" = s."p-try@2.2.0";
        "packet-reader@1.0.0" = f "packet-reader" "1.0.0" y "9238e5480dedabacfe1fe3f2771063f164157d74" [];
        "pako@1.0.11" = f "pako" "1.0.11" y "6c9599d340d54dfd3946380252a35705a6b992bf" [];
        "pako@~1.0.5" = s."pako@1.0.11";
        "parents@1.0.1" = f "parents" "1.0.1" y "fedd4d2bf193a77745fe71e371d73c3307d9c751" [
          (s."path-platform@~0.11.15")
          ];
        "parents@^1.0.0" = s."parents@1.0.1";
        "parents@^1.0.1" = s."parents@1.0.1";
        "parse-asn1@5.1.6" = f "parse-asn1" "5.1.6" y "385080a3ec13cb62a62d39409cb3e88844cdaed4" [
          (s."asn1.js@^5.2.0")
          (s."browserify-aes@^1.0.0")
          (s."evp_bytestokey@^1.0.0")
          (s."pbkdf2@^3.0.3")
          (s."safe-buffer@^5.1.1")
          ];
        "parse-asn1@^5.0.0" = s."parse-asn1@5.1.6";
        "parse-asn1@^5.1.5" = s."parse-asn1@5.1.6";
        "path-browserify@1.0.1" = f "path-browserify" "1.0.1" y "d98454a9c3753d5790860f16f68867b9e46be1fd" [];
        "path-browserify@^1.0.0" = s."path-browserify@1.0.1";
        "path-exists@4.0.0" = f "path-exists" "4.0.0" y "513bdbe2d3b95d7762e8c1137efa195c6c61b5b3" [];
        "path-exists@^4.0.0" = s."path-exists@4.0.0";
        "path-is-absolute@1.0.1" = f "path-is-absolute" "1.0.1" y "174b9268735534ffbc7ace6bf53a5a9e1b5c5f5f" [];
        "path-is-absolute@^1.0.0" = s."path-is-absolute@1.0.1";
        "path-is-absolute@^1.0.1" = s."path-is-absolute@1.0.1";
        "path-parse@1.0.6" = f "path-parse" "1.0.6" y "d62dbb5679405d72c4737ec58600e9ddcf06d24c" [];
        "path-parse@^1.0.6" = s."path-parse@1.0.6";
        "path-platform@0.11.15" = f "path-platform" "0.11.15" y "e864217f74c36850f0852b78dc7bf7d4a5721bf2" [];
        "path-platform@~0.11.15" = s."path-platform@0.11.15";
        "pbkdf2@3.1.2" = f "pbkdf2" "3.1.2" y "dd822aa0887580e52f1a039dc3eda108efae3075" [
          (s."create-hash@^1.1.2")
          (s."create-hmac@^1.1.4")
          (s."ripemd160@^2.0.1")
          (s."safe-buffer@^5.0.1")
          (s."sha.js@^2.4.8")
          ];
        "pbkdf2@^3.0.3" = s."pbkdf2@3.1.2";
        "pend@1.2.0" = f "pend" "1.2.0" y "7a57eb550a6783f9115331fcf4663d5c8e007a50" [];
        "pend@~1.2.0" = s."pend@1.2.0";
        "pg-connection-string@2.5.0" = f "pg-connection-string" "2.5.0" y "538cadd0f7e603fc09a12590f3b8a452c2c0cf34" [];
        "pg-connection-string@^2.5.0" = s."pg-connection-string@2.5.0";
        "pg-cursor@2.6.0" = f "pg-cursor" "2.6.0" y "a85df1bd1389c75ffa443ee94073da0a1be360ba" [];
        "pg-cursor@^2.6.0" = s."pg-cursor@2.6.0";
        "pg-int8@1.0.1" = f "pg-int8" "1.0.1" y "943bd463bf5b71b4170115f80f8efc9a0c0eb78c" [];
        "pg-pool@3.3.0" = f "pg-pool" "3.3.0" y "12d5c7f65ea18a6e99ca9811bd18129071e562fc" [];
        "pg-pool@^3.3.0" = s."pg-pool@3.3.0";
        "pg-protocol@1.5.0" = f "pg-protocol" "1.5.0" y "b5dd452257314565e2d54ab3c132adc46565a6a0" [];
        "pg-protocol@^1.5.0" = s."pg-protocol@1.5.0";
        "pg-types@2.2.0" = f "pg-types" "2.2.0" y "2d0250d636454f7cfa3b6ae0382fdfa8063254a3" [
          (s."pg-int8@1.0.1")
          (s."postgres-array@~2.0.0")
          (s."postgres-bytea@~1.0.0")
          (s."postgres-date@~1.0.4")
          (s."postgres-interval@^1.1.0")
          ];
        "pg-types@^2.1.0" = s."pg-types@2.2.0";
        "pg@8.6.0" = f "pg" "8.6.0" y "e222296b0b079b280cce106ea991703335487db2" [
          (s."buffer-writer@2.0.0")
          (s."packet-reader@1.0.0")
          (s."pg-connection-string@^2.5.0")
          (s."pg-pool@^3.3.0")
          (s."pg-protocol@^1.5.0")
          (s."pg-types@^2.1.0")
          (s."pgpass@1.x")
          ];
        "pg@^8.6.0" = s."pg@8.6.0";
        "pgpass@1.0.4" = f "pgpass" "1.0.4" y "85eb93a83800b20f8057a2b029bf05abaf94ea9c" [
          (s."split2@^3.1.1")
          ];
        "pgpass@1.x" = s."pgpass@1.0.4";
        "pkg-dir@4.2.0" = f "pkg-dir" "4.2.0" y "f099133df7ede422e81d1d8448270eeb3e4261f3" [
          (s."find-up@^4.0.0")
          ];
        "pkg-dir@^4.2.0" = s."pkg-dir@4.2.0";
        "postgres-array@2.0.0" = f "postgres-array" "2.0.0" y "48f8fce054fbc69671999329b8834b772652d82e" [];
        "postgres-array@~2.0.0" = s."postgres-array@2.0.0";
        "postgres-bytea@1.0.0" = f "postgres-bytea" "1.0.0" y "027b533c0aa890e26d172d47cf9ccecc521acd35" [];
        "postgres-bytea@~1.0.0" = s."postgres-bytea@1.0.0";
        "postgres-date@1.0.7" = f "postgres-date" "1.0.7" y "51bc086006005e5061c591cee727f2531bf641a8" [];
        "postgres-date@~1.0.4" = s."postgres-date@1.0.7";
        "postgres-interval@1.2.0" = f "postgres-interval" "1.2.0" y "b460c82cb1587507788819a06aa0fffdb3544695" [
          (s."xtend@^4.0.0")
          ];
        "postgres-interval@^1.1.0" = s."postgres-interval@1.2.0";
        "process-nextick-args@2.0.1" = f "process-nextick-args" "2.0.1" y "7820d9b16120cc55ca9ae7792680ae7dba6d7fe2" [];
        "process-nextick-args@~2.0.0" = s."process-nextick-args@2.0.1";
        "process@0.11.10" = f "process" "0.11.10" y "7332300e840161bda3e69a1d1d91a7d4bc16f182" [];
        "process@~0.11.0" = s."process@0.11.10";
        "progress@2.0.3" = f "progress" "2.0.3" y "7e8cf8d8f5b8f239c1bc68beb4eb78567d572ef8" [];
        "progress@^2.0.1" = s."progress@2.0.3";
        "proxy-from-env@1.1.0" = f "proxy-from-env" "1.1.0" y "e102f16ca355424865755d2c9e8ea4f24d58c3e2" [];
        "proxy-from-env@^1.1.0" = s."proxy-from-env@1.1.0";
        "public-encrypt@4.0.3" = f "public-encrypt" "4.0.3" y "4fcc9d77a07e48ba7527e7cbe0de33d0701331e0" [
          (s."bn.js@^4.1.0")
          (s."browserify-rsa@^4.0.0")
          (s."create-hash@^1.1.0")
          (s."parse-asn1@^5.0.0")
          (s."randombytes@^2.0.1")
          (s."safe-buffer@^5.1.2")
          ];
        "public-encrypt@^4.0.0" = s."public-encrypt@4.0.3";
        "pump@3.0.0" = f "pump" "3.0.0" y "b4a2116815bde2f4e1ea602354e8c75565107a64" [
          (s."end-of-stream@^1.1.0")
          (s."once@^1.3.1")
          ];
        "pump@^3.0.0" = s."pump@3.0.0";
        "punycode@1.3.2" = f "punycode" "1.3.2" y "9653a036fb7c1ee42342f2325cceefea3926c48d" [];
        "punycode@1.4.1" = f "punycode" "1.4.1" y "c0d5a63b2718800ad8e1eb0fa5269c84dd41845e" [];
        "punycode@^1.3.2" = s."punycode@1.4.1";
        "puppeteer@8.0.0" = f "puppeteer" "8.0.0" y "a236669118aa795331c2d0ca19877159e7664705" [
          (s."debug@^4.1.0")
          (s."devtools-protocol@0.0.854822")
          (s."extract-zip@^2.0.0")
          (s."https-proxy-agent@^5.0.0")
          (s."node-fetch@^2.6.1")
          (s."pkg-dir@^4.2.0")
          (s."progress@^2.0.1")
          (s."proxy-from-env@^1.1.0")
          (s."rimraf@^3.0.2")
          (s."tar-fs@^2.0.0")
          (s."unbzip2-stream@^1.3.3")
          (s."ws@^7.2.3")
          ];
        "puppeteer@^8.0.0" = s."puppeteer@8.0.0";
        "querystring-es3@0.2.1" = f "querystring-es3" "0.2.1" y "9ec61f79049875707d69414596fd907a4d711e73" [];
        "querystring-es3@~0.2.0" = s."querystring-es3@0.2.1";
        "querystring@0.2.0" = f "querystring" "0.2.0" y "b209849203bb25df820da756e747005878521620" [];
        "randombytes@2.1.0" = f "randombytes" "2.1.0" y "df6f84372f0270dc65cdf6291349ab7a473d4f2a" [
          (s."safe-buffer@^5.1.0")
          ];
        "randombytes@^2.0.0" = s."randombytes@2.1.0";
        "randombytes@^2.0.1" = s."randombytes@2.1.0";
        "randombytes@^2.0.5" = s."randombytes@2.1.0";
        "randomfill@1.0.4" = f "randomfill" "1.0.4" y "c92196fc86ab42be983f1bf31778224931d61458" [
          (s."randombytes@^2.0.5")
          (s."safe-buffer@^5.1.0")
          ];
        "randomfill@^1.0.3" = s."randomfill@1.0.4";
        "read-only-stream@2.0.0" = f "read-only-stream" "2.0.0" y "2724fd6a8113d73764ac288d4386270c1dbf17f0" [
          (s."readable-stream@^2.0.2")
          ];
        "read-only-stream@^2.0.0" = s."read-only-stream@2.0.0";
        "readable-stream@2.3.7" = f "readable-stream" "2.3.7" y "1eca1cf711aef814c04f62252a36a62f6cb23b57" [
          (s."core-util-is@~1.0.0")
          (s."inherits@~2.0.3")
          (s."isarray@~1.0.0")
          (s."process-nextick-args@~2.0.0")
          (s."safe-buffer@~5.1.1")
          (s."string_decoder@~1.1.1")
          (s."util-deprecate@~1.0.1")
          ];
        "readable-stream@3.6.0" = f "readable-stream" "3.6.0" y "337bbda3adc0706bd3e024426a286d4b4b2c9198" [
          (s."inherits@^2.0.3")
          (s."string_decoder@^1.1.1")
          (s."util-deprecate@^1.0.1")
          ];
        "readable-stream@^2.0.2" = s."readable-stream@2.3.7";
        "readable-stream@^2.2.2" = s."readable-stream@2.3.7";
        "readable-stream@^3.0.0" = s."readable-stream@3.6.0";
        "readable-stream@^3.1.1" = s."readable-stream@3.6.0";
        "readable-stream@^3.4.0" = s."readable-stream@3.6.0";
        "readable-stream@^3.5.0" = s."readable-stream@3.6.0";
        "readable-stream@^3.6.0" = s."readable-stream@3.6.0";
        "readable-stream@~2.3.6" = s."readable-stream@2.3.7";
        "resolve@1.20.0" = f "resolve" "1.20.0" y "629a013fb3f70755d6f0b7935cc1c2c5378b1975" [
          (s."is-core-module@^2.2.0")
          (s."path-parse@^1.0.6")
          ];
        "resolve@^1.1.4" = s."resolve@1.20.0";
        "resolve@^1.17.0" = s."resolve@1.20.0";
        "resolve@^1.4.0" = s."resolve@1.20.0";
        "rimraf@3.0.2" = f "rimraf" "3.0.2" y "f1a5402ba6220ad52cc1282bac1ae3aa49fd061a" [
          (s."glob@^7.1.3")
          ];
        "rimraf@^3.0.2" = s."rimraf@3.0.2";
        "ripemd160@2.0.2" = f "ripemd160" "2.0.2" y "a1c1a6f624751577ba5d07914cbc92850585890c" [
          (s."hash-base@^3.0.0")
          (s."inherits@^2.0.1")
          ];
        "ripemd160@^2.0.0" = s."ripemd160@2.0.2";
        "ripemd160@^2.0.1" = s."ripemd160@2.0.2";
        "safe-buffer@5.1.2" = f "safe-buffer" "5.1.2" y "991ec69d296e0313747d59bdfd2b745c35f8828d" [];
        "safe-buffer@5.2.1" = f "safe-buffer" "5.2.1" y "1eaf9fa9bdb1fdd4ec75f58f9cdb4e6b7827eec6" [];
        "safe-buffer@^5.0.1" = s."safe-buffer@5.2.1";
        "safe-buffer@^5.1.0" = s."safe-buffer@5.2.1";
        "safe-buffer@^5.1.1" = s."safe-buffer@5.2.1";
        "safe-buffer@^5.1.2" = s."safe-buffer@5.2.1";
        "safe-buffer@^5.2.0" = s."safe-buffer@5.2.1";
        "safe-buffer@~5.1.0" = s."safe-buffer@5.1.2";
        "safe-buffer@~5.1.1" = s."safe-buffer@5.1.2";
        "safe-buffer@~5.2.0" = s."safe-buffer@5.2.1";
        "safer-buffer@2.1.2" = f "safer-buffer" "2.1.2" y "44fa161b0187b9549dd84bb91802f9bd8385cd6a" [];
        "safer-buffer@^2.1.0" = s."safer-buffer@2.1.2";
        "sha.js@2.4.11" = f "sha.js" "2.4.11" y "37a5cf0b81ecbc6943de109ba2960d1b26584ae7" [
          (s."inherits@^2.0.1")
          (s."safe-buffer@^5.0.1")
          ];
        "sha.js@^2.4.0" = s."sha.js@2.4.11";
        "sha.js@^2.4.8" = s."sha.js@2.4.11";
        "shasum-object@1.0.0" = f "shasum-object" "1.0.0" y "0b7b74ff5b66ecf9035475522fa05090ac47e29e" [
          (s."fast-safe-stringify@^2.0.7")
          ];
        "shasum-object@^1.0.0" = s."shasum-object@1.0.0";
        "shell-quote@1.7.2" = f "shell-quote" "1.7.2" y "67a7d02c76c9da24f99d20808fcaded0e0e04be2" [];
        "shell-quote@^1.6.1" = s."shell-quote@1.7.2";
        "simple-concat@1.0.1" = f "simple-concat" "1.0.1" y "f46976082ba35c2263f1c8ab5edfe26c41c9552f" [];
        "simple-concat@^1.0.0" = s."simple-concat@1.0.1";
        "source-map@0.5.7" = f "source-map" "0.5.7" y "8a039d2d1021d22d1ea14c80d8ea468ba2ef3fcc" [];
        "source-map@~0.5.3" = s."source-map@0.5.7";
        "split2@3.2.2" = f "split2" "3.2.2" y "bf2cf2a37d838312c249c89206fd7a17dd12365f" [
          (s."readable-stream@^3.0.0")
          ];
        "split2@^3.1.1" = s."split2@3.2.2";
        "stream-browserify@3.0.0" = f "stream-browserify" "3.0.0" y "22b0a2850cdf6503e73085da1fc7b7d0c2122f2f" [
          (s."inherits@~2.0.4")
          (s."readable-stream@^3.5.0")
          ];
        "stream-browserify@^3.0.0" = s."stream-browserify@3.0.0";
        "stream-combiner2@1.1.1" = f "stream-combiner2" "1.1.1" y "fb4d8a1420ea362764e21ad4780397bebcb41cbe" [
          (s."duplexer2@~0.1.0")
          (s."readable-stream@^2.0.2")
          ];
        "stream-combiner2@^1.1.1" = s."stream-combiner2@1.1.1";
        "stream-http@3.1.1" = f "stream-http" "3.1.1" y "0370a8017cf8d050b9a8554afe608f043eaff564" [
          (s."builtin-status-codes@^3.0.0")
          (s."inherits@^2.0.4")
          (s."readable-stream@^3.6.0")
          (s."xtend@^4.0.2")
          ];
        "stream-http@^3.0.0" = s."stream-http@3.1.1";
        "stream-splicer@2.0.1" = f "stream-splicer" "2.0.1" y "0b13b7ee2b5ac7e0609a7463d83899589a363fcd" [
          (s."inherits@^2.0.1")
          (s."readable-stream@^2.0.2")
          ];
        "stream-splicer@^2.0.0" = s."stream-splicer@2.0.1";
        "string.prototype.trimend@1.0.4" = f "string.prototype.trimend" "1.0.4" y "e75ae90c2942c63504686c18b287b4a0b1a45f80" [
          (s."call-bind@^1.0.2")
          (s."define-properties@^1.1.3")
          ];
        "string.prototype.trimend@^1.0.4" = s."string.prototype.trimend@1.0.4";
        "string.prototype.trimstart@1.0.4" = f "string.prototype.trimstart" "1.0.4" y "b36399af4ab2999b4c9c648bd7a3fb2bb26feeed" [
          (s."call-bind@^1.0.2")
          (s."define-properties@^1.1.3")
          ];
        "string.prototype.trimstart@^1.0.4" = s."string.prototype.trimstart@1.0.4";
        "string_decoder@1.1.1" = f "string_decoder" "1.1.1" y "9cf1611ba62685d7030ae9e4ba34149c3af03fc8" [
          (s."safe-buffer@~5.1.0")
          ];
        "string_decoder@1.3.0" = f "string_decoder" "1.3.0" y "42f114594a46cf1a8e30b0a84f56c78c3edac21e" [
          (s."safe-buffer@~5.2.0")
          ];
        "string_decoder@^1.1.1" = s."string_decoder@1.3.0";
        "string_decoder@~1.1.1" = s."string_decoder@1.1.1";
        "subarg@1.0.0" = f "subarg" "1.0.0" y "f62cf17581e996b48fc965699f54c06ae268b8d2" [
          (s."minimist@^1.1.0")
          ];
        "subarg@^1.0.0" = s."subarg@1.0.0";
        "syntax-error@1.4.0" = f "syntax-error" "1.4.0" y "2d9d4ff5c064acb711594a3e3b95054ad51d907c" [
          (s."acorn-node@^1.2.0")
          ];
        "syntax-error@^1.1.1" = s."syntax-error@1.4.0";
        "tar-fs@2.1.1" = f "tar-fs" "2.1.1" y "489a15ab85f1f0befabb370b7de4f9eb5cbe8784" [
          (s."chownr@^1.1.1")
          (s."mkdirp-classic@^0.5.2")
          (s."pump@^3.0.0")
          (s."tar-stream@^2.1.4")
          ];
        "tar-fs@^2.0.0" = s."tar-fs@2.1.1";
        "tar-stream@2.2.0" = f "tar-stream" "2.2.0" y "acad84c284136b060dc3faa64474aa9aebd77287" [
          (s."bl@^4.0.3")
          (s."end-of-stream@^1.4.1")
          (s."fs-constants@^1.0.0")
          (s."inherits@^2.0.3")
          (s."readable-stream@^3.1.1")
          ];
        "tar-stream@^2.1.4" = s."tar-stream@2.2.0";
        "through2@2.0.5" = f "through2" "2.0.5" y "01c1e39eb31d07cb7d03a96a70823260b23132cd" [
          (s."readable-stream@~2.3.6")
          (s."xtend@~4.0.1")
          ];
        "through2@^2.0.0" = s."through2@2.0.5";
        "through@2.3.8" = f "through" "2.3.8" y "0dd4c9ffaabc357960b1b724115d7e0e86a2e1f5" [];
        "through@>=2.2.7 <3" = s."through@2.3.8";
        "through@^2.3.8" = s."through@2.3.8";
        "timers-browserify@1.4.2" = f "timers-browserify" "1.4.2" y "c9c58b575be8407375cb5e2462dacee74359f41d" [
          (s."process@~0.11.0")
          ];
        "timers-browserify@^1.0.1" = s."timers-browserify@1.4.2";
        "tty-browserify@0.0.1" = f "tty-browserify" "0.0.1" y "3f05251ee17904dfd0677546670db9651682b811" [];
        "typedarray@0.0.6" = f "typedarray" "0.0.6" y "867ac74e3864187b1d3d47d996a78ec5c8830777" [];
        "typedarray@^0.0.6" = s."typedarray@0.0.6";
        "umd@3.0.3" = f "umd" "3.0.3" y "aa9fe653c42b9097678489c01000acb69f0b26cf" [];
        "umd@^3.0.0" = s."umd@3.0.3";
        "unbox-primitive@1.0.1" = f "unbox-primitive" "1.0.1" y "085e215625ec3162574dc8859abee78a59b14471" [
          (s."function-bind@^1.1.1")
          (s."has-bigints@^1.0.1")
          (s."has-symbols@^1.0.2")
          (s."which-boxed-primitive@^1.0.2")
          ];
        "unbox-primitive@^1.0.0" = s."unbox-primitive@1.0.1";
        "unbzip2-stream@1.4.3" = f "unbzip2-stream" "1.4.3" y "b0da04c4371311df771cdc215e87f2130991ace7" [
          (s."buffer@^5.2.1")
          (s."through@^2.3.8")
          ];
        "unbzip2-stream@^1.3.3" = s."unbzip2-stream@1.4.3";
        "undeclared-identifiers@1.1.3" = f "undeclared-identifiers" "1.1.3" y "9254c1d37bdac0ac2b52de4b6722792d2a91e30f" [
          (s."acorn-node@^1.3.0")
          (s."dash-ast@^1.0.0")
          (s."get-assigned-identifiers@^1.2.0")
          (s."simple-concat@^1.0.0")
          (s."xtend@^4.0.1")
          ];
        "undeclared-identifiers@^1.1.2" = s."undeclared-identifiers@1.1.3";
        "url@0.11.0" = f "url" "0.11.0" y "3838e97cfc60521eb73c525a8e55bfdd9e2e28f1" [
          (s."punycode@1.3.2")
          (s."querystring@0.2.0")
          ];
        "url@~0.11.0" = s."url@0.11.0";
        "util-deprecate@1.0.2" = f "util-deprecate" "1.0.2" y "450d4dc9fa70de732762fbd2d4a28981419a0ccf" [];
        "util-deprecate@^1.0.1" = s."util-deprecate@1.0.2";
        "util-deprecate@~1.0.1" = s."util-deprecate@1.0.2";
        "util@0.10.3" = f "util" "0.10.3" y "7afb1afe50805246489e3db7fe0ed379336ac0f9" [
          (s."inherits@2.0.1")
          ];
        "util@0.12.3" = f "util" "0.12.3" y "971bb0292d2cc0c892dab7c6a5d37c2bec707888" [
          (s."inherits@^2.0.3")
          (s."is-arguments@^1.0.4")
          (s."is-generator-function@^1.0.7")
          (s."is-typed-array@^1.1.3")
          (s."safe-buffer@^5.1.2")
          (s."which-typed-array@^1.1.2")
          ];
        "util@~0.12.0" = s."util@0.12.3";
        "vm-browserify@1.1.2" = f "vm-browserify" "1.1.2" y "78641c488b8e6ca91a75f511e7a3b32a86e5dda0" [];
        "vm-browserify@^1.0.0" = s."vm-browserify@1.1.2";
        "which-boxed-primitive@1.0.2" = f "which-boxed-primitive" "1.0.2" y "13757bc89b209b049fe5d86430e21cf40a89a8e6" [
          (s."is-bigint@^1.0.1")
          (s."is-boolean-object@^1.1.0")
          (s."is-number-object@^1.0.4")
          (s."is-string@^1.0.5")
          (s."is-symbol@^1.0.3")
          ];
        "which-boxed-primitive@^1.0.2" = s."which-boxed-primitive@1.0.2";
        "which-typed-array@1.1.4" = f "which-typed-array" "1.1.4" y "8fcb7d3ee5adf2d771066fba7cf37e32fe8711ff" [
          (s."available-typed-arrays@^1.0.2")
          (s."call-bind@^1.0.0")
          (s."es-abstract@^1.18.0-next.1")
          (s."foreach@^2.0.5")
          (s."function-bind@^1.1.1")
          (s."has-symbols@^1.0.1")
          (s."is-typed-array@^1.1.3")
          ];
        "which-typed-array@^1.1.2" = s."which-typed-array@1.1.4";
        "wrappy@1" = s."wrappy@1.0.2";
        "wrappy@1.0.2" = f "wrappy" "1.0.2" y "b5243d8f3ec1aa35f1364605bc0d1036e30ab69f" [];
        "ws@7.4.4" = f "ws" "7.4.4" y "383bc9742cb202292c9077ceab6f6047b17f2d59" [];
        "ws@^7.2.3" = s."ws@7.4.4";
        "xtend@4.0.2" = f "xtend" "4.0.2" y "bb72779f5fa465186b1f438f674fa347fdb5db54" [];
        "xtend@^4.0.0" = s."xtend@4.0.2";
        "xtend@^4.0.1" = s."xtend@4.0.2";
        "xtend@^4.0.2" = s."xtend@4.0.2";
        "xtend@~4.0.1" = s."xtend@4.0.2";
        "yauzl@2.10.0" = f "yauzl" "2.10.0" y "c7eb17c93e112cb1086fa6d8e51fb0667b79a5f9" [
          (s."buffer-crc32@~0.2.3")
          (s."fd-slicer@~1.1.0")
          ];
        "yauzl@^2.10.0" = s."yauzl@2.10.0";
        }