module Main 

import Printf as PF
import Snippets
import Exchange

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

aline1 : OrderLine
aline1 = MkOrderLine (MkOrderLineKey 1 7 1 1 100 188) (Tt 15 0)

aline2 : OrderLine
aline2 = MkOrderLine (MkOrderLineKey 1 7 2 2 100 73) (Tt 5 0)

test_list : List OrderLine
test_list = [aline1,
             aline2,
             MkOrderLine (MkOrderLineKey 1 7 1 1 100 188) (Tt 0 3),
             MkOrderLine (MkOrderLineKey 1 7 1 1 100 188) (Tt 0 2),
             MkOrderLine (MkOrderLineKey 1 7 2 2 100 73) (Tt 1 0),
             MkOrderLine (MkOrderLineKey 1 7 2 2 100 73) (Tt 1 0),
             MkOrderLine (MkOrderLineKey 1 7 2 2 100 73) (Tt 0 7),
             MkOrderLine (MkOrderLineKey 1 7 1 1 100 188) (Tt 0 1)]

line2io : OrderLine -> JS_IO ()
line2io x = insert_beforeend "so_table1" $ line2row x

line_list2io : List OrderLine -> JS_IO ()
line_list2io [] = pure ()
line_list2io (x :: xs) = do
          line2io x
          line_list2io xs

partial main : JS_IO ()
main = do
   insert_beforeend "so_composite" table_card

   new_row_sha1 <- calc_sha1 example_row
   new_row_sha256 <- calc_sha256 example_row
--   insert_beforeend "so_table1" example_row
   
   --line2io aline1
   --line2io aline2
   line_list2io test_list
   
   console_log new_row_sha1
   console_log new_row_sha256
      
   so1_qty <- get_qty "so1_qty"
   let k="so1_qty"
   let v="34.98"
   update_qty k so1_qty

   console_log $ PF.printf "%d%s" 5 "hello!"
   console_log $ show $test2 test_list

-- Local Variables:
-- idris-load-packages: ("contrib")
-- End:
