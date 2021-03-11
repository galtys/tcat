module Main 

import Data.Vect
import Printf as PF
import Snippets
import Snippets2
--import Exchange
import Language.JSON
import Language.JSON.Data
import DataStore
import Data.SortedMap
import Control.Monad.State

import JSIO



test_line : OrderLine
test_line = MkOrderLine ("p1", 188, "$") (Tt 15 0)

test_list : List OrderLine
test_list = [test_line,
             MkOrderLine ("p2", 73, "$") (Tt 5 0),
             MkOrderLine ("p1", 188, "$") (Tt 0 2),
             MkOrderLine ("p3", 93, "$") (Tt 3 0)
             ]
test_list2 : List OrderLine
test_list2 = [MkOrderLine ("p1", 188, "$") (Tt 0 3),
              MkOrderLine ("p2", 73, "$") (Tt 3 0),
             MkOrderLine  ("p3", 93, "$") (Tt 0 1)
             ]

test_list3 : List OrderLine
test_list3 = [MkOrderLine ("p2", 73, "$") (Tt 0 1),
             MkOrderLine ("p3", 93, "$") (Tt 0 2)
             ]

test_list4 : List OrderLine
test_list4 = [MkOrderLine ("p2", 73, "$") (Tt 0 1),
             MkOrderLine ("p4",  93, "$") (Tt 1 0)
             ]


table_composite_id : TableID
table_composite_id = "so_table1"

table_amendments_id : Integer -> TableID
table_amendments_id x = printf "so_table_amendments%d" x


{- old way, no ModelData, no flexbox -}


line2io : TableID -> RowID -> OrderLine -> JS_IO ()
line2io tableid rowid x = insert_beforeend tableid $ line2row rowid x


line_list2io_amend : TableID -> List OrderLine -> JS_IO ()
line_list2io_amend tableid [] = pure ()
line_list2io_amend tableid ( x@(MkOrderLine k@(sku1, price, sku2) v) :: xs) = do
          let new_qty = printf "%d" (t2integer v)
          --console_log $ show $ ((renderDataWithSchema "" k) ++ [("Qty",new_qty )] )

          line2io tableid (Just sku1) x
          line_list2io_amend tableid xs


THeader : Schema
THeader = OrderLineKey1 .+. (SInt (FA "Qty" True) ) 


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


test_json : String
test_json = renderModelData Test_ModelSchema test_ModelData --items_ModelDataList


listJSON_2_kv : List JSON -> (List JSON,List JSON)
listJSON_2_kv (a::b::xs) = (json2ListJSON a, json2ListJSON b)
listJSON_2_kv _ = ([],[])

test_inv_ : (m:ModelSchema) -> Maybe ( ModelDataList m  )
test_inv_ m = do 
          js <- (parse test_json)
          let (k,v) =  listJSON_2_kv (json2ListJSON js)
          let ko = [ (json2Schema2Data (key m) (json2ListJSON x)  ) | x <- ( k )]
          let vo = [ (json2Schema2Data (val m) (json2ListJSON x)  ) | x <- ( v )]
          let sz = (length ko)
          pure (MkMDList "items" ko vo)

{-
to_model_data : (m:ModelSchema) -> Maybe (ModelData m)
to_model_data m  = do
          x <- (test_inv_ m)
          let k = data_keyL x
          let v = data_valL x
          let z = (zip k v)
          let zv = fromList z
          
          let sz = length z
          
          let (kk,vv) = Data.Vect.unzip zv
          pure ( MkMD (length z) kk vv )
          
                              
          --let (keyD,valD) =  (json2kv js)
          --let ret_val = [ (json2Schema2Data valSchema2 (json2ListJSON x)  ) | x <- (json2ListJSON valD)]
          --pure ret_val
-}          
-- test_inv_ valSchema2


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
   
   
   console_log test_json   
   case (parse test_json) of
     Nothing => console_log "na"
     (Just j) => console_log (Language.JSON.Data.format 2 j)
            
   setUp
   onEvent "#p2__Qty" Input testingEvent1
   console_log $ schema2thead (OrderLineKey1 .+. (SInt (FA "Qty" False) ))                   
   --onInit setUp
   
-- Local Variables:
-- idris-load-packages: ("contrib")
-- End:
