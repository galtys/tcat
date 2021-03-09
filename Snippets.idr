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


renderSchemaDataVect : (s:Schema2) -> Vect size (SchemaType2 s) -> String
renderSchemaDataVect s [] = ""
renderSchemaDataVect s (x :: xs) = ("["++renderSchemaDataAsJsonP1 x++"]" ) ++ a where
               a = if ( length xs==0 ) then "" else ","
               


renderModelData : (m:ModelSchema) -> (ModelData m)  -> String
renderModelData m x = printf """[%s,%s]""" (renderSchemaDataVect (key m) (data_key x)) 
                                                           (renderSchemaDataVect (val m) (data_val x))


list_json_to_bool : List JSON -> Bool
list_json_to_bool ( (JBoolean x) :: xs) = x

list_json_to_str : List JSON -> String
list_json_to_str ( (JString x) :: xs) = x

list_json_to_num : List JSON -> Integer
list_json_to_num ( (JNumber x) :: xs) = the Integer (cast x)

list_json_to_tterm : List JSON -> Tterm
list_json_to_tterm ((JArray ((JNumber dr) :: (JNumber cr) :: x ))::xs) = Tt (the Integer (cast dr)) (the Integer (cast cr))

--(JArray (JNumber dr) :: (JNumber cr) :: xs ) = Tt (the Integer (cast dr)) (the Integer (cast cr))


json2Schema2Data : (s:Schema2) -> List JSON -> (SchemaType2 s)
json2Schema2Data (IField name FBool) x = list_json_to_bool x
json2Schema2Data (IField name FString) x = list_json_to_str x
json2Schema2Data (IField name FTterm) x = list_json_to_tterm x
json2Schema2Data (EField name ns) x = list_json_to_num x
--json2Schema2Data (s1 .|. s2) (JArray []) = ()
json2Schema2Data (s1 .|. s2) (x :: xs) = ( json2Schema2Data s1 [x] , json2Schema2Data s2 xs)





--renderSchemaDataVect (key m) (data_key x)
-- renderSchemaDataAsJsonP (data_val x)

--renderModelData m x = [ renderSchemaDataAsJsonP xx | xx <- (data_key x)]

--renderModelData x = x --[ renderSchemaDataAsJsonP xx | xx <- data_key x] --, renderSchemaDataAsJsonP (data_val x))

-- Local Variables:
-- idris-load-packages: ("contrib")
-- End:
 
