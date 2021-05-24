module JSIO.SHA

%access public export

%include JavaScript "lib/forge/forge.min.js"
%include JavaScript "js/sha.js"

--%include Node "lib/forge/forge.min.js"
%include Node "js/sha_node.js"

calc_sha1 : String -> JS_IO String
calc_sha1 = foreign FFI_JS "calc_sha1(%0)" (String -> JS_IO String)

calc_sha256 : String -> JS_IO String
calc_sha256 = foreign FFI_JS "calc_sha256(%0)" (String -> JS_IO String)

