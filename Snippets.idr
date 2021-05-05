module Snippets

import Printf
--import Exchange
import DataStore
import Data.Vect as DV
import Language.JSON
import Language.JSON.Data


%access public export

{- THIS PART IS ABOUT  SchemaType2 -> JSON -}


tterm2json : Tterm -> String
tterm2json (Tt dr cr) = printf """[%d,%d]""" dr cr

-- assumption: column(field) names are unique
renderSchemaDataAsJsonP : (SchemaType2 schema) -> String
renderSchemaDataAsJsonP {schema = (IFieldAlg name FTtermCarrier)} item = printf """ {"%s":%s} """ name (tterm2json item)
renderSchemaDataAsJsonP {schema = (IFieldAlg name FIntCarrier)} item = printf """ {"%s":%d} """ name (int2integer item)

renderSchemaDataAsJsonP {schema = (IField name FBool)} item = printf """ {"%s":%s} """ name val where
                      val = if (item == True) then "true" else "false"
renderSchemaDataAsJsonP {schema = (IField name FString)} item = printf """ {"%s":"%s"} """ name item 
renderSchemaDataAsJsonP {schema = (EField name (NSInteger ns))} item
                 = let ret = printf """ {"%s":%d} """ name item in
                       ret
renderSchemaDataAsJsonP {schema = (EField name (NSInt ns))} item
                 = let ret = printf """ {"%s":%d} """ name (int2integer item) in
                       ret
                       
renderSchemaDataAsJsonP {schema = (EField name (NSCode ns))} item
                 = let ret = printf """ {"%s":%s} """ name item in
                       ret
renderSchemaDataAsJsonP {schema = (y .|. z)} (iteml,itemr) = (renderSchemaDataAsJsonP iteml)++
                                                           "," ++
                                                           (renderSchemaDataAsJsonP itemr)

renderSchemaDataAsJsonP1 : (SchemaType2 schema) -> String
renderSchemaDataAsJsonP1 {schema = (IFieldAlg name FTtermCarrier)} item = printf """ %s """ (tterm2json item)
renderSchemaDataAsJsonP1 {schema = (IFieldAlg name FIntCarrier)} item = printf """ %d """  (int2integer item)
renderSchemaDataAsJsonP1 {schema = (IField name FBool)} item = printf """ %s """ val where
                      val = if (item == True) then "true" else "false"
renderSchemaDataAsJsonP1 {schema = (IField name FString)} item = printf """ "%s" """ item 
renderSchemaDataAsJsonP1 {schema = (EField name (NSInteger ns))} item
                 = let ret = printf """ %d """ item in
                       ret
renderSchemaDataAsJsonP1 {schema = (EField name (NSInt ns))} item
                 = let ret = printf """ %d """ (int2integer item) in
                       ret
                       
renderSchemaDataAsJsonP1 {schema = (EField name (NSCode ns))} item
                 = let ret = printf """ %s """ item in
                       ret
renderSchemaDataAsJsonP1 {schema = (y .|. z)} (iteml,itemr) = (renderSchemaDataAsJsonP1 iteml)++
                                                           "," ++
                                                           (renderSchemaDataAsJsonP1 itemr)

joinVect : (Vect size String) -> String
joinVect [] = ""
joinVect (x :: xs) = x ++ a ++ (joinVect xs) where
                    a = if ( length xs==0 ) then "" else ","


--joinVect (x:xs) = "" -- 


renderSchemaDataVect : (s:Schema2 kv) -> Vect size (SchemaType2 s) -> Vect size String
renderSchemaDataVect s [] = []
renderSchemaDataVect s (x :: xs) = [ "["++(renderSchemaDataAsJsonP1 x)++"]" ] ++ (renderSchemaDataVect s xs)  

--renderSchemaDataVect s (x :: xs) = [renderSchemaDataAsJsonP1 x] ++ (renderSchemaDataVect s xs)  



renderModelData : {a:KV}-> (m:ModelSchema a) -> (ModelData a m)  -> String
renderModelData m x = printf """[ [%s],  [%s]   ]""" (  joinVect $ renderSchemaDataVect (key m) (data_key x) ) 
                                           (  joinVect $ renderSchemaDataVect (val m) (data_val x) )






{- THIS PART IS ABOUT  JSON ->   SchemaType2 ->  -}


list_json_to_bool : List JSON -> Bool
list_json_to_bool ( (JBoolean x) :: xs) = x

list_json_to_str : List JSON -> String
--list_json_to_str [] = Nothing
list_json_to_str ( (JString x) :: xs) = x

list_json_to_num : List JSON -> Integer
--list_json_to_num [] = Nothing
list_json_to_num ( (JNumber x) :: xs) = the Integer (cast x)

list_json_to_tterm : List JSON -> Tterm
--list_json_to_tterm [] = Nothing
list_json_to_tterm ((JArray ((JNumber dr) :: (JNumber cr) :: x ))::xs) =Tt (the Integer (cast dr)) (the Integer (cast cr))


json2Schema2Data : (s:Schema2 kv) -> List JSON -> (SchemaType2 s)
json2Schema2Data (IField name FBool) x = list_json_to_bool x
json2Schema2Data (IField name FString) x = list_json_to_str x
json2Schema2Data (IFieldAlg name FTtermCarrier) x = list_json_to_tterm x
json2Schema2Data (IFieldAlg name FIntCarrier) x = integer_to_int (list_json_to_num x)
json2Schema2Data (EField name (NSInteger ns)) x = list_json_to_num x
json2Schema2Data (EField name (NSInt ns)) x = integer_to_int (list_json_to_num x)
json2Schema2Data (EField name (NSCode ns)) x = list_json_to_str x
--json2Schema2Data (s1 .|. s2) (JArray []) = ()
json2Schema2Data (s1 .|. s2) (x :: xs) = ( json2Schema2Data s1 [x] , json2Schema2Data s2 xs)


json2ListJSON : JSON -> List JSON
json2ListJSON (JArray xs) = xs
json2ListJSON _ = []


json2Schema2ListData : (s:Schema2 kv) -> JSON -> List (SchemaType2 s)
--json2Schema2ListData s [] = []
json2Schema2ListData s (JArray ( (JArray x)::xs))= [(json2Schema2Data s x)] ++ (json2Schema2ListData s (JArray xs) )

 
--json2kv : JSON -> (List JSON, List JSON)
--json2kv (JArray ((JArray keyD) :: (JArray valD) :: xs) )    =  (keyD ,valD)

json2kv : JSON -> (JSON, JSON)
json2kv (JArray (( keyD) :: ( valD) :: xs) )    =  (keyD ,valD)


--- testing it 



test_json : {a:KV} -> (m:ModelSchema a) -> (ModelData a m) -> String
test_json ms md = renderModelData ms md --items_ModelDataList

--test_json ms md = renderModelData Items_ModelSchema test_ModelData

listJSON_2_kv : List JSON -> (List JSON,List JSON)
listJSON_2_kv (a::b::xs) = (json2ListJSON a, json2ListJSON b)
listJSON_2_kv _ = ([],[])


test_inv_ : {a:KV} -> (m:ModelSchema a) -> (ModelData a m) -> Maybe ( ModelDataList a m  )
test_inv_ ms md = do 
          js <- (parse (test_json ms md))
          let (k,v) =  listJSON_2_kv (json2ListJSON js)
          let ko = [ (json2Schema2Data (key ms) (json2ListJSON x)  ) | x <- ( k )]
          let vo = [ (json2Schema2Data (val ms) (json2ListJSON x)  ) | x <- ( v )]
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






