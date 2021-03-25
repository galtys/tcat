module Main 

import Data.Vect
import Printf as PF
import Snippets
import Snippets2
       
import Language.JSON
import Language.JSON.Data
import DataStore
import Data.SortedMap
import Control.Monad.State

--import OrderLine
import JSIO


{-
   console_log test_json   
   case (parse test_json) of
     Nothing => console_log "na"
     (Just j) => console_log (Language.JSON.Data.format 2 j)
-}

--Warehouse_ModelSchema : ModelSchema Val
--Warehouse_ModelSchema = MkModelSchema keyItems ( (IFieldV "routing" FTtermV) .+. (IFieldV "done" FTtermV) )


--keyItems_data : List (SchemaType2 Main.keyItems)
--keyItems_data = [ (1,100), (2,100), (3,100), (4,100) ,(2,100) ] 


items_ModelDataList : (ModelDataList Val) Items_ModelSchema
items_ModelDataList = MkMDList "items" [] []


                                                                              
items_ModelDataList' : (ModelDataList Val) Items_ModelSchema
items_ModelDataList' = MkMDList "items" [ (1,100), (2,100), (3,100), (4,100) ] 
                        [ ( Tt 3 0 ),
                          ( Tt 6 0 ),
                          ( Tt 9 0 ),
                          ( Tt 5 0 )]

--warehouse_ModelDataList : (ModelDataList Val) Items_ModelSchema
--warehouse_ModelDataList = MkMDList "warehouse" [(1,100), (2,100), (3,100), (4,100)] [(Tt 0 0),(Tt 0 0),(Tt 0 0),(Tt 0 0)]
whs_ModelDataList : (ModelDataList Val) Items_ModelSchema
whs_ModelDataList = MkMDList "items" [ (1,100), (2,100), (3,100), (4,100) ] 
                        [ ( Tt 0 0 ),
                          ( Tt 0 0 ),
                          ( Tt 0 0 ),
                          ( Tt 0 0 )]

items_ModelDataList'' : (ModelDataList Val) Items_ModelSchema
items_ModelDataList'' = MkMDList "items" [ (1,100), (2,100), (3,100) ] 
                        [ ( Tt 0 1 ),
                          ( Tt 0 2 ),
                          ( Tt 0 1 )]

pricelist_ModelDataList : (ModelDataList Val) Pricelist_ModelSchema
pricelist_ModelDataList = MkMDList "pricelist" [] []

pricelist_ModelDataList' : (ModelDataList Val) Pricelist_ModelSchema
pricelist_ModelDataList' = MkMDList "pricelist" [ (1,100), (2,100), (3,100), (4,100) ]
                        [ ( Tt 3 0 ),
                          ( Tt 7 0 ),
                          ( Tt 1 0 ),
                          ( Tt 2 0 )]

subtotal_ModelDataList : (ModelDataList Val) Subtotal_ModelSchema
subtotal_ModelDataList = MkMDList "subtotal" [ (1,100), (2,100), (3,100), (4,100) ] 
                        [ ( Tt 0 0 ),
                          ( Tt 0 0 ),
                          ( Tt 0 0 ),
                          ( Tt 0 0 )]

t_ModelDataList : (ModelDataList Val) Total_ModelSchema
t_ModelDataList = MkMDList "order_total" [ 100 ] [ (Tt 0 0) ]

partial main : JS_IO ()
main = do      
   new_row_sha1 <- calc_sha1 "abc"
   new_row_sha256 <- calc_sha256 "abc"
   console_log new_row_sha1
   console_log new_row_sha256
   
   tab_widget.table_composite "Pricelist" "pricelist" Pricelist_ModelSchema pricelist_ModelDataList   
   
   tab_widget.table_composite "Order1 Items" "order1" Items_ModelSchema items_ModelDataList
   tab_widget.add_whs_button "order1" Items_ModelSchema items_ModelDataList

   tab_widget.table_composite "Order1 Subtotals" "subtotal" Subtotal_ModelSchema subtotal_ModelDataList
   tab_widget.insert_rows "subtotal" Subtotal_ModelSchema subtotal_ModelDataList

   tab_widget.table_composite "WHS Routing" "warehouse" Items_ModelSchema items_ModelDataList   
   tab_widget.insert_rows "warehouse" Items_ModelSchema whs_ModelDataList
   
         
   tab_widget.table_composite "WHS Done" "warehouse_done" Items_ModelSchema items_ModelDataList   
   tab_widget.insert_rows "warehouse_done" Items_ModelSchema whs_ModelDataList
   tab_widget.add_whs_done_button "warehouse_done" Items_ModelSchema items_ModelDataList


   tab_widget.table_composite "WHS Backorders" "warehouse_backorders" Items_ModelSchema items_ModelDataList   
   tab_widget.insert_rows "warehouse_backorders" Items_ModelSchema whs_ModelDataList
      
                  
--   tab_widget.insert_rows "warehouse_done" Items_ModelSchema warehouse_ModelDataList
                  
   tab_widget.insert_rows "pricelist" Pricelist_ModelSchema pricelist_ModelDataList'
   tab_widget.insert_rows "order1" Items_ModelSchema items_ModelDataList'
   tab_widget.insert_rows "order1" Items_ModelSchema items_ModelDataList''
   
   tab_widget.table_composite "Order Total" "order_total" Total_ModelSchema t_ModelDataList
      

   calc_order_subtotals Items_ModelSchema Pricelist_ModelSchema Subtotal_ModelSchema   
--   tab_widget.table_composite 

--   tab_widget.table_amendments "Pricelist" "pricelist" Pricelist_ModelSchema pricelist_ModelDataList   
   

--   tab_widget.table_amendments "Subtotals" "subtotal" Subtotal_ModelSchema subtotal_ModelDataList               

                                    
--   tab_widget.table_composite "Warehouse" "warehouse" Warehouse_ModelSchema warehouse_ModelDataList
                                                                                                               
--   insert_beforeend "so_composite" (table_card table_composite_id THeader)
--   line_list2io_amend table_composite_id test_list


--   setUp
--   onEvent "#p2__Qty" Input testingEvent1
--   console_log $ schema2thead (OrderLineKey1 .+. (SInt (FA "Qty" False) ))                   

--onInit setUp

-- Local Variables:
-- idris-load-packages: ("contrib")
-- End:
