module Main

%include Node "js/webs.js"

console_log : String -> JS_IO ()
console_log = foreign FFI_JS "console.log(%0)" (String -> JS_IO () )


acceptConnection : Ptr -> JS_IO Ptr
acceptConnection request = foreign FFI_JS "nodeAppState.acceptConnection(%0)"
                             (Ptr -> JS_IO Ptr)
                             request

wsServerOnRequest : (Ptr -> JS_IO () ) -> JS_IO ()
wsServerOnRequest on_request = foreign FFI_JS "nodeAppState.wsServerOnRequest(%0)"
                              (JsFn (Ptr -> JS_IO ()) -> JS_IO () )
                              (MkJsFn on_request)

setOnMsgHandler : Ptr -> (Ptr -> JS_IO ()) -> JS_IO ()
setOnMsgHandler conn handle_msg = foreign FFI_JS "nodeAppState.setOnMsgHandler(%0,%1)"
                              (Ptr -> JsFn (Ptr -> JS_IO ()) -> JS_IO () )
                              conn (MkJsFn handle_msg)


setOnCloseHandler : Ptr -> (Int -> String -> JS_IO ()) -> JS_IO ()
setOnCloseHandler conn handle_close = foreign FFI_JS "nodeAppState.setOnCloseHandler(%0,%1)"
                              (Ptr -> JsFn (Int -> String -> JS_IO ()) -> JS_IO () )
                              conn (MkJsFn handle_close)


getUtf8Data : Ptr -> JS_IO String
getUtf8Data msg = foreign FFI_JS "nodeAppState.getUtf8Data(%0)"
                             (Ptr -> JS_IO String)
                             msg

sendUTF : Ptr -> String -> JS_IO ()
sendUTF conn a = foreign FFI_JS "nodeAppState.sendUTF(%0,%1)"
                            (Ptr -> String -> JS_IO ())
                            conn a

echoWS : (String -> String) -> JS_IO ()
echoWS callback = foreign FFI_JS "nodeAppState.echoWS(%0)"
                                 (JsFn (String->String) -> JS_IO ())
                                 (MkJsFn callback)

on_close_handle : Ptr -> Int -> String -> JS_IO ()
on_close_handle conn  reasonCode description = do
        console_log ( "connection closed: " ++ description)

on_close_handle2 : Int -> String -> JS_IO ()
on_close_handle2 reasonCode description = do
        console_log ( "connection closed: " ++ description)

on_msg_recv2 : Ptr -> Ptr -> JS_IO ()
on_msg_recv2 conn msg = do
        x <- getUtf8Data msg
        sendUTF conn (x ++ "+X back")

on_req : Ptr -> JS_IO ()
on_req req = do
    conn <- acceptConnection req
    setOnMsgHandler conn (on_msg_recv2 conn)
    
--    setOnCloseHandler conn on_close_handle2

main : JS_IO ()
main = do
   console_log "Starting ws"

   wsServerOnRequest on_req
