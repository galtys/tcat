module Main

%include Node "js/webs.js"

console_log : String -> JS_IO ()
console_log = foreign FFI_JS "console.log(%0)" (String -> JS_IO () )

echoWS : (String -> String) -> JS_IO ()
echoWS callback = foreign FFI_JS "gameState.echoWS(%0)"
                                 (JsFn (String->String) -> JS_IO ())
                                 (MkJsFn callback)

clb : String -> String
clb x = x ++"muf "


main : JS_IO ()
main = do
   console_log "Starting ws"
   echoWS clb

