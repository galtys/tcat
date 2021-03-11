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
keyItems : Schema2
keyItems = (EField "sku1" "asset")                                

valItems : Schema2
valItems = (IField "qty" FTterm)

valItems' : Schema2
valItems' = (IField "flag" FBool) .|. (IField "note" FString) .|. (IField "qty" FTterm)

--Items_ModelSchema : ModelSchema
--Items_ModelSchema = MkModelSchema keyItems valItems

Items_ModelSchema : ModelSchema
Items_ModelSchema = MkModelSchema keyItems valItems --Items_ModelSchema

Items_ModelSchema' : ModelSchema
Items_ModelSchema' = MkModelSchema keyItems valItems' --Items_ModelSchema

items_ModelDataList : ModelDataList Items_ModelSchema
items_ModelDataList = MkMDList "items" [ 1,2,3,4 ] 
                        [ ( Tt 3 0 ),
                          ( Tt 7 0 ),
                          ( Tt 1 0 ),
                          ( Tt 1 39 ) ]

items_ModelDataList' : ModelDataList Items_ModelSchema'
items_ModelDataList' = MkMDList "items" [ 1,2,3,4 ] 
                        [ (False , "res", Tt 3 0 ),
                          (False , "r", Tt 0 3 ),
                          (False , "il", Tt 1 0 ),
                          (False , "l", Tt 0 7 ) ]

{-
test_ModelData : ModelData Items_ModelSchema
test_ModelData = MkMD 4 [ 1,2,3,4 ] 
                        [ (Tt 3 0 ),
                          (Tt 2 0 ),
                          (Tt 1 0 ),
                          (Tt 1 78 ) ]
-}


partial main : JS_IO ()
main = do      
   new_row_sha1 <- calc_sha1 "abc"
   new_row_sha256 <- calc_sha256 "abc"
   console_log new_row_sha1
   console_log new_row_sha256
   
   tab_widget.table_card2 "order1" Items_ModelSchema' items_ModelDataList'
      
--   insert_beforeend "so_composite" (table_card table_composite_id THeader)
--   line_list2io_amend table_composite_id test_list
  
   
            
--   setUp
--   onEvent "#p2__Qty" Input testingEvent1
--   console_log $ schema2thead (OrderLineKey1 .+. (SInt (FA "Qty" False) ))                   


   --onInit setUp
   
-- Local Variables:
-- idris-load-packages: ("contrib")
-- End:
