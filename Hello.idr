module Main

%include Node "js/webs.js"

console_log : String -> JS_IO ()
console_log = foreign FFI_JS "console.log(%0)" (String -> JS_IO () )

echoWS : String -> JS_IO ()
echoWS = foreign FFI_JS "gameState.echoWS(%0)" (String -> JS_IO ())




main : JS_IO ()
main = do
   console_log "Starting ws"
   echoWS "adda"

