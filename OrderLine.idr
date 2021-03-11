module OrderLine

import DataStore
import Snippets2
import Printf
import JSIO

%access public export

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



-- was in main: 

   -- line_list2io table_composite_id test_list
--   insert_beforeend "so_table1" example_row
   
   --line2io aline1
   --line2io aline2
   
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
