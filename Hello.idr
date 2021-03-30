module Main

%include Node "js/webs.js"

console_log : String -> JS_IO ()
console_log = foreign FFI_JS "console.log(%0)" (String -> JS_IO () )


acceptConnection : Ptr -> JS_IO Ptr
acceptConnection request = foreign FFI_JS "gameState.acceptConnection(%0)"
                             (Ptr -> JS_IO Ptr)
                             request

wsServerOnRequest : (Ptr -> JS_IO () ) -> JS_IO ()
wsServerOnRequest on_request = foreign FFI_JS "gameState.wsServerOnRequest(%0)"
                              (JsFn (Ptr -> JS_IO ()) -> JS_IO () )
                              (MkJsFn on_request)
{-
set_on_msg : (Ptr -> JS_IO ()) -> JS_IO ()
set_on_msg handle_msg = foreign FFI_JS "gameState.set_on_msg(%0)"
                              (JsFn (Ptr -> JS_IO ()) -> JS_IO () )
                              (MkJsFn handle_msg)
-}
setOnMsgHandler : Ptr -> (Ptr -> JS_IO ()) -> JS_IO ()
setOnMsgHandler conn handle_msg = foreign FFI_JS "gameState.set_on_msg2(%0,%1)"
                              (Ptr -> JsFn (Ptr -> JS_IO ()) -> JS_IO () )
                              conn (MkJsFn handle_msg)
{-
on_msg_fc : Ptr -> JS_IO ()
on_msg_fc msg = foreign FFI_JS "gameState.on_msg_fc(%0)"
                              (Ptr -> JS_IO ())
                              msg
-}

getUtf8Data : Ptr -> JS_IO String
getUtf8Data msg = foreign FFI_JS "gameState.getUtf8Data(%0)"
                             (Ptr -> JS_IO String)
                             msg
{-
send_msg : String -> JS_IO ()
send_msg a = foreign FFI_JS "gameState.send_msg(%0)"
                            (String -> JS_IO ())
                            a
-}
sendUTF : Ptr -> String -> JS_IO ()
sendUTF conn a = foreign FFI_JS "gameState.sendUTF(%0,%1)"
                            (Ptr -> String -> JS_IO ())
                            conn a

echoWS : (String -> String) -> JS_IO ()
echoWS callback = foreign FFI_JS "gameState.echoWS(%0)"
                                 (JsFn (String->String) -> JS_IO ())
                                 (MkJsFn callback)
{-
clb : String -> String
clb x = x ++"muf "


on_msg_recv : Ptr -> JS_IO ()
on_msg_recv msg = do
        x <- get_msg msg
        send_msg (x ++ "+X back")
-}

on_msg_recv2 : Ptr -> Ptr -> JS_IO ()
on_msg_recv2 conn msg = do
        x <- getUtf8Data msg
        sendUTF conn (x ++ "+X back")

on_req : Ptr -> JS_IO ()
on_req req = do
    conn <- acceptConnection req
    setOnMsgHandler conn (on_msg_recv2 conn)

main : JS_IO ()
main = do
   console_log "Starting ws"
   --echoWS clb

   wsServerOnRequest on_req
