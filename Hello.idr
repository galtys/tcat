module Main

%include Node "js/webs.js"

console_log : String -> JS_IO ()
console_log = foreign FFI_JS "console.log(%0)" (String -> JS_IO () )


getConn : Ptr -> JS_IO Ptr
getConn request = foreign FFI_JS "gameState.getConn(%0)"
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
                              
set_on_msg2 : Ptr -> (Ptr -> JS_IO ()) -> JS_IO ()
set_on_msg2 conn handle_msg = foreign FFI_JS "gameState.set_on_msg2(%0,%1)"
                              (Ptr -> JsFn (Ptr -> JS_IO ()) -> JS_IO () )
                              conn (MkJsFn handle_msg)

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
send_msg2 : Ptr -> String -> JS_IO ()
send_msg2 conn a = foreign FFI_JS "gameState.send_msg2(%0,%1)"
                            (Ptr -> String -> JS_IO ())
                            conn a




echoWS : (String -> String) -> JS_IO ()
echoWS callback = foreign FFI_JS "gameState.echoWS(%0)"
                                 (JsFn (String->String) -> JS_IO ())
                                 (MkJsFn callback)

clb : String -> String
clb x = x ++"muf "

on_msg_recv : Ptr -> JS_IO ()
on_msg_recv msg = do
        x <- get_msg msg
        send_msg (x ++ "+X back")

on_msg_recv2 : Ptr -> Ptr -> JS_IO ()
on_msg_recv2 conn msg = do
        x <- get_msg msg
        send_msg2 conn (x ++ "+X back")

on_req : Ptr -> JS_IO ()
on_req req = do
    conn <- getConn req
    set_on_msg2 conn (on_msg_recv2 conn)

main : JS_IO ()
main = do
   console_log "Starting ws"
   --echoWS clb

   echoWS2 on_req
