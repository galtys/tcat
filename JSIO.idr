module JSIO

%access public export

{--
function update_qty(key, value) {
  document.getElementById(key).innerText=value;
}
function get_qty(key) {
  return document.getElementById(key).innerText

--}
data EventType : Type where
  Click : EventType
  DoubleClick : EventType
  MouseDown : EventType
  MouseMove : EventType
  MouseOver : EventType
  MouseOut : EventType
  MouseUp : EventType
  KeyDown : EventType
  KeyUp : EventType
  KeyPress : EventType
  Abort : EventType
  Error : EventType
  Load : EventType
  Resize : EventType
  Scroll : EventType
  Unload : EventType
  Blur : EventType
  Change : EventType
  Input : EventType
  Focus : EventType
  Reset : EventType
  Select : EventType
  Submit : EventType

implementation Show EventType where
  show Click = "click"
  show DoubleClick = "dblclick"
  show MouseDown = "mousedown"
  show MouseMove = "mousemove"
  show MouseOver = "mouseover"
  show MouseOut = "mouseout"
  show MouseUp = "mouseup"
  show KeyDown = "keydown"
  show KeyUp = "keyup"
  show KeyPress = "keypress"
  show Abort = "abort"
  show Error = "error"
  show Load = "load"
  show Resize = "resize"
  show Scroll = "scroll"
  show Unload = "unload"
  show Blur = "blur"
  show Change = "change"
  show Input = "input"
  show Focus = "focus"
  show Reset = "reset"
  show Select = "select"
  show Submit = "submit"







onEvent : String -> EventType -> (Ptr -> JS_IO () ) -> JS_IO ()
onEvent selector evType callback 
  = let ev_str= show evType in
    foreign FFI_JS
      "document.querySelector(%0).addEventListener(%1, %2)" --selector, event (eg click), callback
      (String -> String -> JsFn ( Ptr -> JS_IO () ) -> JS_IO ())  -- args type
      selector ev_str (MkJsFn callback)  -- args



toggle_hide_show_element : String -> JS_IO ()
toggle_hide_show_element = foreign FFI_JS "toggle_hide_snow_element(%0)" (String -> JS_IO() )


update_qty : String -> Int -> JS_IO ()
update_qty = foreign FFI_JS "update_qty(%0,%1)" (String -> Int -> JS_IO ())

_get_qty : String -> JS_IO String
_get_qty = foreign FFI_JS "get_qty(%0)" (String -> JS_IO String)

get_qty_int : String -> JS_IO Int
get_qty_int = foreign FFI_JS "get_qty_int(%0)" (String -> JS_IO Int)


get_qty_int_value2 : String -> JS_IO Int
get_qty_int_value2 = foreign FFI_JS "get_qty_int_value2(%0)" (String -> JS_IO Int)

get_qty_int_flag : String -> JS_IO Int
get_qty_int_flag = foreign FFI_JS "get_qty_int_flag(%0)" (String -> JS_IO Int)

remove_row : String -> JS_IO ()
remove_row = foreign FFI_JS "remove_row(%0)" (String -> JS_IO () )

_parse_int_pair_int : String -> JS_IO Ptr
_parse_int_pair_int = foreign FFI_JS "_parse_int_pair_int(%0,10)" (String -> JS_IO Ptr)

_get_fst_pair_int : Ptr -> JS_IO Int
_get_fst_pair_int x = foreign FFI_JS "_get_fst_pair_int" (JS_IO Int)

_get_snd_pair_int : Ptr -> JS_IO Int
_get_snd_pair_int x = foreign FFI_JS "_get_snd_pair_int" (JS_IO Int)


parse_int : String -> JS_IO (Maybe Int)
parse_int x = do
        x_pair <- _parse_int_pair_int x
        x_err <- _get_fst_pair_int x_pair
        x_val <- _get_snd_pair_int x_pair
        let   ret =case (x_err==0) of
               True => Nothing
               False => Just x_val
        pure ret

        
parse_int_m : Maybe String -> JS_IO (Maybe Int)
parse_int_m Nothing = pure Nothing
parse_int_m (Just x) = parse_int x

_get_qty_m' : String -> JS_IO (Maybe String)
_get_qty_m' key = do
       q' <- _get_qty key
       let q = case (q'=="") of 
               True => Nothing
               False => Just q'
       pure q


get_qty : String -> JS_IO (Maybe Int)
get_qty x = (_get_qty_m' x) >>= parse_int_m


update_element_text : String -> String -> JS_IO ()
update_element_text = foreign FFI_JS "update_element_text(%0,%1)" (String -> String -> JS_IO ())


console_log : String -> JS_IO ()
console_log = foreign FFI_JS "console_log(%0)" (String -> JS_IO () )

call_js_ptr : Ptr -> JS_IO Int
call_js_ptr = foreign FFI_JS "call_js_ptr(%0)" (Ptr -> JS_IO Int )

add_row : String -> String -> JS_IO ()
add_row = foreign FFI_JS "add_row(%0,%1)" (String -> String -> JS_IO ())

insert_adjancent_html : String -> String -> String -> JS_IO ()
insert_adjancent_html = foreign FFI_JS "insert_adjancent_html(%0,%1,%2)" (String -> String -> String -> JS_IO ())

insert_beforeend : String -> String -> JS_IO ()
insert_beforeend key row = insert_adjancent_html key "beforeend" row

calc_sha1 : String -> JS_IO String
calc_sha1 = foreign FFI_JS "calc_sha1(%0)" (String -> JS_IO String)

calc_sha256 : String -> JS_IO String
calc_sha256 = foreign FFI_JS "calc_sha256(%0)" (String -> JS_IO String)




-- UPDATE EVENTS


partial onClick : String -> JS_IO () -> JS_IO ()
onClick selector callback =
  foreign FFI_JS 
    "onClick(%0, %1)"
    (String -> JsFn (() -> JS_IO ()) -> JS_IO ())
    selector (MkJsFn (\_ => callback))

partial onInput : String -> JS_IO () -> JS_IO ()
onInput selector callback =
  foreign FFI_JS 
    "onInput(%0, %1)"
    (String -> JsFn (() -> JS_IO ()) -> JS_IO ())
    selector (MkJsFn (\_ => callback))


partial onInit : JS_IO () -> JS_IO ()
onInit callback =
  foreign FFI_JS
    "onInit(%0)"
    ((JsFn (() -> JS_IO ())) -> JS_IO ())
    (MkJsFn (\_ => callback))

partial setUp : JS_IO ()
setUp = do 
           onClick "#table_card_button" (console_log "button table card")
           onClick "#big_one" (console_log "button bigone")
--           onClick "#punch" (doAction PUNCH) 
--           onClick "#magic" (doAction MAGIC) 


testingEvent1 : Ptr -> JS_IO ()
testingEvent1 ev = do
        new_val <- call_js_ptr ev
        console_log "input event received "
        console_log (the String (cast new_val))
        console_log "hmm done"

