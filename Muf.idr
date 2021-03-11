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


      
   insert_beforeend "so_composite" (table_card table_composite_id THeader)
   line_list2io_amend table_composite_id test_list



   
   
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
