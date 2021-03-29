module Main


console_log : String -> JS_IO ()
console_log = foreign FFI_JS "console.log(%0)" (String -> JS_IO () )


main : JS_IO ()
main = do
   console_log "hello"
   
