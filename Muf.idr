module Main 

import Printf as PF
import Snippets

{--
function update_qty(key, value) {
  document.getElementById(key).innerText=value;
}
function get_qty(key) {
  return document.getElementById(key).innerText

--}
new_row : String
new_row = """<tr >  <td scope="row">AB</td>   <td></td> <td id="so4_qty" >1</td>  <td>Unit</td> <td>STE20</td> <td>188</td> <td>0</td>     </tr>"""

update_qty : String -> String -> JS_IO ()
update_qty = foreign FFI_JS "update_qty(%0,%1)" (String -> String -> JS_IO ())

get_qty : String -> JS_IO String
get_qty = foreign FFI_JS "get_qty(%0)" (String -> JS_IO String)

console_log : String -> JS_IO ()
console_log = foreign FFI_JS "console_log(%0)" (String -> JS_IO () )

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

partial main : JS_IO ()
main = do
   insert_beforeend "so_composite" table_card

   new_row_sha1 <- calc_sha1 new_row
   new_row_sha256 <- calc_sha256 new_row
   add_row "so_table1" new_row
   console_log new_row_sha1
   console_log new_row_sha256
      
   so1_qty <- get_qty "so1_qty"
   let k="so1_qty"
   let v="34.98"
   update_qty k so1_qty

   console_log $ PF.printf "%d%s" 5 "hello!"
