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
import JSIO.JSIO
import JSIO.SHA

data T: Type -> Type where
  Dr : a -> T a
  Cr : a -> T a
--  Pure : (res : ty) -> T ty
  (>>=) : T a -> (a-> T b) -> T b



doorProg : T Int
doorProg = do Dr 4
              Cr 9
              Dr 98
              Cr 34
              

--Functor T where
--  map f (Dr x) = Dr (f x)
--  map f (Cr x) = Cr (f x)  
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


items_ModelDataList : ModelDataList Items_ModelSchema
items_ModelDataList = MkMDList "items" [] []


                                                                              
items_ModelDataList' : ModelDataList Items_ModelSchema
items_ModelDataList' = MkMDList "items" [ ("a1","£"), ("a2","£"), ("a3","£"), ("a4","£") ] 
                        [ ( Tt 0 0 ),
                          ( Tt 0 0 ),
                          ( Tt 0 0 ),
                          ( Tt 0 0 )]

--warehouse_ModelDataList : (ModelDataList Val) Items_ModelSchema
--warehouse_ModelDataList = MkMDList "warehouse" [(1,100), (2,100), (3,100), (4,100)] [(Tt 0 0),(Tt 0 0),(Tt 0 0),(Tt 0 0)]
whs_ModelDataList : ModelDataList Items_ModelSchema
whs_ModelDataList = MkMDList "items" [ ("a1","£"), ("a2","£"), ("a3","£"), ("a4","£") ] 
                        [ ( Tt 0 0 ),
                          ( Tt 0 0 ),
                          ( Tt 0 0 ),
                          ( Tt 0 0 )]

items_ModelDataList'' : ModelDataList Items_ModelSchema
items_ModelDataList'' = MkMDList "items" [ ("a1","£"), ("a2","£"), ("a3","£") ] 
                        [ ( Tt 0 1 ),
                          ( Tt 0 2 ),
                          ( Tt 0 1 )]

pricelist_ModelDataList : ModelDataList Pricelist_ModelSchema
pricelist_ModelDataList = MkMDList "pricelist" [] []

pricelist_ModelDataList' : ModelDataList Pricelist_ModelSchema
pricelist_ModelDataList' = MkMDList "pricelist" [ ("a1","£"), ("a2","£"), ("a3","£"), ("a4","£") ]
                        [ ( Tt 3 0 ),
                          ( Tt 7 0 ),
                          ( Tt 1 0 ),
                          ( Tt 2 0 )]

subtotal_ModelDataList : ModelDataList Subtotal_ModelSchema
subtotal_ModelDataList = MkMDList "subtotal" [ ("a1","£"), ("a2","£"), ("a3","£"), ("a4","£") ] 
                        [ ( Tt 0 0 ),
                          ( Tt 0 0 ),
                          ( Tt 0 0 ),
                          ( Tt 0 0 )]

t_ModelDataList : ModelDataList  Total_ModelSchema
t_ModelDataList = MkMDList "order_total" [ "£" ] [ (Tt 0 0) ]

partial main : JS_IO ()
main = do      
   
   new_row_sha1 <- calc_sha1 "abc"
   new_row_sha256 <- calc_sha256 "abc"
   console_log new_row_sha1
   console_log new_row_sha256
   
   tab_widget.table_composite False "Pricelist" "pricelist" Pricelist_ModelSchema pricelist_ModelDataList   
   
   tab_widget.table_composite True "Order1 Items" "order1" Items_ModelSchema items_ModelDataList
   tab_widget.add_whs_button "order1" Items_ModelSchema items_ModelDataList

   tab_widget.table_composite False "Order1 Subtotals" "subtotal" Subtotal_ModelSchema subtotal_ModelDataList
   tab_widget.insert_rows_calc "subtotal" Subtotal_ModelSchema subtotal_ModelDataList



   tab_widget.table_composite False "Invoice1 Subtotals" "invoice_subtotal" Subtotal_ModelSchema subtotal_ModelDataList
   tab_widget.insert_rows_calc "invoice_subtotal" Subtotal_ModelSchema subtotal_ModelDataList


   tab_widget.table_composite False "WHS Routing" "warehouse" Items_ModelSchema items_ModelDataList   
   tab_widget.insert_rows_calc "warehouse" Items_ModelSchema whs_ModelDataList
   
         
   tab_widget.table_composite True "WHS Done" "warehouse_done" Items_ModelSchema items_ModelDataList   
   tab_widget.insert_rows_x "warehouse_done" Items_ModelSchema whs_ModelDataList
   tab_widget.add_whs_done_button "warehouse_done" Items_ModelSchema items_ModelDataList


   tab_widget.table_composite False "WHS Backorders" "warehouse_backorders" Items_ModelSchema items_ModelDataList   
   tab_widget.insert_rows_calc "warehouse_backorders" Items_ModelSchema whs_ModelDataList
      
                  

                  
   tab_widget.insert_rows_x "pricelist" Pricelist_ModelSchema pricelist_ModelDataList'
   --tab_widget.insert_rows_x "order1" Items_ModelSchema items_ModelDataList'
   --tab_widget.insert_rows_x "order1" Items_ModelSchema items_ModelDataList''
   
   tab_widget.table_composite False "Order Total" "order_total" Total_ModelSchema t_ModelDataList
   
   tab_widget.table_composite False "Invoice Total" "invoice_total" Total_ModelSchema t_ModelDataList
         
   tab_widget.table_composite True "Payment Received" "payment_received" Total_ModelSchema t_ModelDataList
   
   calc_order_subtotals "order1" "subtotal" "order_total" Items_ModelSchema Pricelist_ModelSchema Subtotal_ModelSchema   
   
   

   
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
