module Main 

import Printf as PF
import Snippets
import Exchange
import Language.JSON
import Language.JSON.Data
import DataStore
{--
function update_qty(key, value) {
  document.getElementById(key).innerText=value;
}
function get_qty(key) {
  return document.getElementById(key).innerText

--}


update_qty : String -> Int -> JS_IO ()
update_qty = foreign FFI_JS "update_qty(%0,%1)" (String -> Int -> JS_IO ())

_get_qty : String -> JS_IO String
_get_qty = foreign FFI_JS "get_qty(%0)" (String -> JS_IO String)

get_qty_int : String -> JS_IO Int
get_qty_int = foreign FFI_JS "get_qty_int(%0)" (String -> JS_IO Int)

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


test_line : OrderLine
test_line = MkOrderLine (1, 7, 1, 1, 100, 188) (Tt 15 0)

test_list : List OrderLine
test_list = [test_line,
             MkOrderLine (1, 7, 1, 2, 100, 73) (Tt 5 0),
             MkOrderLine (1, 7, 1, 1, 100, 188) (Tt 0 2),
             MkOrderLine (1, 7, 1, 3, 100, 93) (Tt 3 0)
             ]
test_list2 : List OrderLine
test_list2 = [MkOrderLine (1, 7, 1, 1, 100, 188) (Tt 0 3),
              MkOrderLine (1, 7, 1, 2, 100, 73) (Tt 3 0),
             MkOrderLine (1, 7, 1, 3, 100, 93) (Tt 0 1)
             ]

test_list3 : List OrderLine
test_list3 = [MkOrderLine (1, 7, 1, 2, 100, 73) (Tt 0 1),
             MkOrderLine (1, 7, 1, 3, 100, 93) (Tt 0 2)
             ]

test_list4 : List OrderLine
test_list4 = [MkOrderLine (1, 7, 1, 2, 100, 73) (Tt 0 1),
             MkOrderLine (1, 7, 1, 4, 100, 93) (Tt 1 0)
             ]


table_composite_id : TableID
table_composite_id = "so_table1"

table_amendments_id : Integer -> TableID
table_amendments_id x = printf "so_table_amendments%d" x


line2io : TableID -> RowID -> OrderLine -> JS_IO ()
line2io tableid rowid x = insert_beforeend tableid $ line2row rowid x


line_list2io_amend : TableID -> List OrderLine -> JS_IO ()
line_list2io_amend tableid [] = pure ()
line_list2io_amend tableid ( x@(MkOrderLine k v) :: xs) = do
          let key_s = (display_as_key k)
          -- console_log key_s
          let new_qty = printf "%d" (t2integer v)
          --console_log $ show $ ((renderDataWithSchema "" k) ++ [("Qty",new_qty )] )

          line2io tableid (Just key_s) x
          line_list2io_amend tableid xs
          
line_list2io : TableID -> List OrderLine -> JS_IO ()
line_list2io tableid [] = pure ()
line_list2io tableid ( x@(MkOrderLine k v) :: xs) = do
          --console_log (show k)
          let key_s = (display_as_key k)
          -- console_log key_s
          console_log $ show $ renderDataWithSchema k
          q_flag <- get_qty_int_flag key_s
          case (q_flag==0) of
              True => line2io tableid (Just key_s) x
              False => do
                      q <- get_qty_int key_s
                      let new_qty = (t2int v) + q
                      case (new_qty==0) of 
                         True => remove_row key_s
                         False => update_qty key_s new_qty
                      
          line_list2io tableid xs

--line2io_amend : OrderLine -> JS_IO ()
--line2io_amend x = insert_beforeend table_amendments_id $ line2row Nothing x


THeader : Schema
THeader = OrderLineKey1 .+. (SInt "Qty")

partial main : JS_IO ()
main = do      
   new_row_sha1 <- calc_sha1 "abc"
   new_row_sha256 <- calc_sha256 "abc"
   console_log new_row_sha1
   console_log new_row_sha256

--   insert_beforeend "so_table1" example_row
   
   --line2io aline1
   --line2io aline2

      
   insert_beforeend "so_composite" (table_card table_composite_id THeader)
   line_list2io_amend table_composite_id test_list

   -- line_list2io table_composite_id test_list
   
   {-
   insert_beforeend "so_amendments" (table_card (table_amendments_id 1) )
   line_list2io_amend (table_amendments_id 1) test_list

   insert_beforeend "so_amendments" (table_card (table_amendments_id 2) )
   line_list2io_amend (table_amendments_id 2) test_list2      
   line_list2io table_composite_id test_list2

   insert_beforeend "so_amendments" (table_card (table_amendments_id 3) )
   line_list2io_amend (table_amendments_id 3) test_list3
   line_list2io table_composite_id test_list3   

   insert_beforeend "so_amendments" (table_card (table_amendments_id 4) )
   line_list2io_amend (table_amendments_id 4) test_list4
   line_list2io table_composite_id test_list4
   -}
   
   case (parse js1) of
     Nothing => console_log "na"
     (Just j) => console_log (Language.JSON.Data.format 2 j)
   console_log $ schema2thead (OrderLineKey1 .+. (SInt "Qty"))                   

-- Local Variables:
-- idris-load-packages: ("contrib")
-- End:
