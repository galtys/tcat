module Main

%include Node "js/webs.js"

console_log : String -> JS_IO ()
console_log = foreign FFI_JS "console.log(%0)" (String -> JS_IO () )


setConn : Ptr -> JS_IO Ptr
setConn request = foreign FFI_JS "gameState.setConn(%0)"
                             (Ptr -> JS_IO Ptr)
                             request

echoWS2 : (Ptr -> JS_IO () ) -> JS_IO ()
echoWS2 on_request = foreign FFI_JS "gameState.echoWS2(%0)"
                              (JsFn (Ptr -> JS_IO ()) -> JS_IO () )
                              (MkJsFn on_request)

set_on_msg : (Ptr -> JS_IO ()) -> JS_IO ()
set_on_msg handle_msg = foreign FFI_JS "gameState.set_on_msg(%0)"
                              (JsFn (Ptr -> JS_IO ()) -> JS_IO () )
                              (MkJsFn handle_msg)
on_msg_fc : Ptr -> JS_IO ()
on_msg_fc msg = foreign FFI_JS "gameState.on_msg_fc(%0)"
                              (Ptr -> JS_IO ())
                              msg

get_msg : Ptr -> JS_IO String
get_msg msg = foreign FFI_JS "gameState.get_msg(%0)"
                             (Ptr -> JS_IO String)
                             msg

send_msg : String -> JS_IO ()
send_msg a = foreign FFI_JS "gameState.send_msg(%0)"
                            (String -> JS_IO ())
                            a


on_msg_recv : Ptr -> JS_IO ()
on_msg_recv msg = do
        x <- get_msg msg
        send_msg (x ++ "+X back")


echoWS : (String -> String) -> JS_IO ()
echoWS callback = foreign FFI_JS "gameState.echoWS(%0)"
                                 (JsFn (String->String) -> JS_IO ())
                                 (MkJsFn callback)

clb : String -> String
clb x = x ++"muf "





on_req : Ptr -> JS_IO ()
on_req req = do
    setConn req
    set_on_msg on_msg_recv
    
main : JS_IO ()
main = do
   console_log "Starting ws"
   --echoWS clb

   echoWS2 on_req
