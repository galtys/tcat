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

import OrderLine
import JSIO


{-
   console_log test_json   
   case (parse test_json) of
     Nothing => console_log "na"
     (Just j) => console_log (Language.JSON.Data.format 2 j)
-}

partial main : JS_IO ()
main = do      
   new_row_sha1 <- calc_sha1 "abc"
   new_row_sha256 <- calc_sha256 "abc"
   console_log new_row_sha1
   console_log new_row_sha256
   
   tab_widget.table_card2 "order1" Items_ModelSchema items_ModelDataList
      
--   insert_beforeend "so_composite" (table_card table_composite_id THeader)
--   line_list2io_amend table_composite_id test_list
  
   
            
--   setUp
--   onEvent "#p2__Qty" Input testingEvent1
--   console_log $ schema2thead (OrderLineKey1 .+. (SInt (FA "Qty" False) ))                   


   --onInit setUp
   
-- Local Variables:
-- idris-load-packages: ("contrib")
-- End:
