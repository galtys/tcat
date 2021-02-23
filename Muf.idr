module Main 

{--
function update_qty(key, value) {
  document.getElementById(key).innerText=value;
}
function get_qty(key) {
  return document.getElementById(key).innerText

--}

update_qty : String -> String -> JS_IO ()
update_qty = foreign FFI_JS "update_qty(%0,%1)" (String -> String -> JS_IO ())

get_qty : String -> JS_IO String
get_qty = foreign FFI_JS "get_qty(%0)" (String -> JS_IO String)

console_log : String -> JS_IO ()
console_log = foreign FFI_JS "console_log" (String -> JS_IO () )

partial main : JS_IO ()
main = do
   so1_qty <- get_qty "so1_qty"
   let k="so3_qty"
   let v="34.98"
   update_qty k so1_qty
   console_log "hotovo"
   
