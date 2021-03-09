module Snippets

import Printf
--import Exchange
import DataStore
import Data.Vect as DV
import Language.JSON
import Language.JSON.Data


%access public export

{-
test_val : (SchemaType OrderLineKey1)
test_val = (1,7,1,"1",100,188)

test_key : String
test_key = display_as_key  test_val
-}


tterm2json : Tterm -> String
tterm2json (Tt dr cr) = printf """[%d,%d]""" dr cr

--op = if (symbol_op == Create) then "Create" else "Delete"
--                       op_json=printf """{"i":%d,"op":"%s"}""" i op

-- assumption: column(field) names are unique
renderSchemaDataAsJsonP : (SchemaType2 schema) -> String
renderSchemaDataAsJsonP {schema = (IField name FTterm)} item = printf """ {"%s":%s} """ name (tterm2json item)
renderSchemaDataAsJsonP {schema = (IField name FBool)} item = printf """ {"%s":%s} """ name val where
                      val = if (item == True) then "true" else "false"
renderSchemaDataAsJsonP {schema = (IField name FString)} item = printf """ {"%s":"%s"} """ name item 
renderSchemaDataAsJsonP {schema = (EField name ns)} item
                 = let ret = printf """ {"%s":%d} """ name item in
                       ret
renderSchemaDataAsJsonP {schema = (y .|. z)} (iteml,itemr) = (renderSchemaDataAsJsonP iteml)++
                                                           "," ++
                                                           (renderSchemaDataAsJsonP itemr)

renderSchemaDataAsJsonP1 : (SchemaType2 schema) -> String
renderSchemaDataAsJsonP1 {schema = (IField name FTterm)} item = printf """ %s """ (tterm2json item)
renderSchemaDataAsJsonP1 {schema = (IField name FBool)} item = printf """ %s """ val where
                      val = if (item == True) then "true" else "false"
renderSchemaDataAsJsonP1 {schema = (IField name FString)} item = printf """ "%s" """ item 
renderSchemaDataAsJsonP1 {schema = (EField name ns)} item
                 = let ret = printf """ %d """ item in
                       ret
renderSchemaDataAsJsonP1 {schema = (y .|. z)} (iteml,itemr) = (renderSchemaDataAsJsonP1 iteml)++
                                                           "," ++
                                                           (renderSchemaDataAsJsonP1 itemr)

joinVect : (Vect size String) -> String
joinVect [] = ""
joinVect (x :: xs) = x ++ a ++ (joinVect xs) where
                    a = if ( length xs==0 ) then "" else ","


--joinVect (x:xs) = "" -- 


renderSchemaDataVect : (s:Schema2) -> Vect size (SchemaType2 s) -> Vect size String
renderSchemaDataVect s [] = []
renderSchemaDataVect s (x :: xs) = [ "["++(renderSchemaDataAsJsonP1 x)++"]" ] ++ (renderSchemaDataVect s xs)  

--renderSchemaDataVect s (x :: xs) = [renderSchemaDataAsJsonP1 x] ++ (renderSchemaDataVect s xs)  

               


renderModelData : (m:ModelSchema) -> (ModelData m)  -> String
renderModelData m x = printf """[ [%s],  [%s]   ]""" (  joinVect $ renderSchemaDataVect (key m) (data_key x) ) 
                                           (  joinVect $ renderSchemaDataVect (val m) (data_val x) )


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
--list_json_to_tterm _ = Nothing

--(JArray (JNumber dr) :: (JNumber cr) :: xs ) = Tt (the Integer (cast dr)) (the Integer (cast cr))


json2Schema2Data : (s:Schema2) -> List JSON -> (SchemaType2 s)
json2Schema2Data (IField name FBool) x = list_json_to_bool x
json2Schema2Data (IField name FString) x = list_json_to_str x
json2Schema2Data (IField name FTterm) x = list_json_to_tterm x
json2Schema2Data (EField name ns) x = list_json_to_num x
--json2Schema2Data (s1 .|. s2) (JArray []) = ()
json2Schema2Data (s1 .|. s2) (x :: xs) = ( json2Schema2Data s1 [x] , json2Schema2Data s2 xs)


json2ListJSON : JSON -> List JSON
json2ListJSON (JArray xs) = xs
json2ListJSON _ = []

{-
json2ListJSON JNull = ?json2ListJSON_rhs_1
json2ListJSON (JBoolean x) = ?json2ListJSON_rhs_2
json2ListJSON (JNumber x) = ?json2ListJSON_rhs_3
json2ListJSON (JString x) = ?json2ListJSON_rhs_4
json2ListJSON (JObject xs) = ?json2ListJSON_rhs_6
-}

--json2Schema2Data s _ = Nothing

--list2vect : (s:Schema2) -> (size :Nat) -> List (SchemaType2 s) -> Maybe (Vect size (SchemaType2 s))
--list2vect s size [] = Nothing
--list2vect s size (x :: xs) = ?ret_2

json2Schema2ListData : (s:Schema2) -> JSON -> List (SchemaType2 s)
--json2Schema2ListData s [] = []
json2Schema2ListData s (JArray ( (JArray x)::xs))= [(json2Schema2Data s x)] ++ (json2Schema2ListData s (JArray xs) )


--json2kv : JSON -> (List JSON, List JSON)
--json2kv (JArray ((JArray keyD) :: (JArray valD) :: xs) )    =  (keyD ,valD)

json2kv : JSON -> (JSON, JSON)
json2kv (JArray (( keyD) :: ( valD) :: xs) )    =  (keyD ,valD)


_test_json2 :JSON
_test_json2 = JArray [JArray [JBoolean False, JString "res", JArray [JNumber 3.0, JNumber 0.0]],
JArray [JBoolean False, JString "r", JArray [JNumber 0.0, JNumber 3.0]],
JArray [JBoolean False, JString "il", JArray [JNumber 1.0, JNumber 0.0]],
JArray [JBoolean False, JString "l", JArray [JNumber 0.0, JNumber 7.0]]]




{-
json2ModelData : (m:ModelSchema) -> ( JSON, JSON) -> Maybe (ModelData m)
json2ModelData m (keyD,valD)
       = let kk = json2Schema2ListData (key m) keyD
             dk = (fromList kk)
             
             vv = (json2Schema2ListData (val m) valD)
             dv = (fromList vv)
             sz = (length dv)  in
             
         Just (MkMD sz dk dv) 

json2ModelData m _ = Nothing
-}

--json2ModelData2 : (m:ModelSchema) -> Maybe JSON -> Maybe (ModelData m)

--renderSchemaDataVect (key m) (data_key x)
-- renderSchemaDataAsJsonP (data_val x)

--renderModelData m x = [ renderSchemaDataAsJsonP xx | xx <- (data_key x)]

--renderModelData x = x --[ renderSchemaDataAsJsonP xx | xx <- data_key x] --, renderSchemaDataAsJsonP (data_val x))

-- Local Variables:
-- idris-load-packages: ("contrib")
-- End:
 
