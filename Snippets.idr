module Snippets

import Printf
--import Exchange
import DataStore
import Data.Vect as DV


%access public export

js1 : String
js1 =  """{
  "key1": [11,89],
  "key2": {
      "key2.1": true,
      "key2.2": {
        "key2.2.1": "bar",
        "key2.2.2": 200
      }
    }
  }"""



{-
test_val : (SchemaType OrderLineKey1)
test_val = (1,7,1,"1",100,188)

test_key : String
test_key = display_as_key  test_val
-}


tterm2json : Tterm -> String
tterm2json (Tt dr cr) = printf """{"dr":%d,"cr":%d}""" dr cr

-- assumption: column(field) names are unique
renderSchemaDataAsJsonP : (SchemaType2 schema) -> String
renderSchemaDataAsJsonP {schema = (IField name FTterm)} item = printf """{"name":"%s","value":%s}""" name (tterm2json item)
renderSchemaDataAsJsonP {schema = (IField name FBool)} item = printf """{"name":"%s","value":%s}""" name val where
                      val = if (item == True) then "true" else "false"
renderSchemaDataAsJsonP {schema = (IField name FString)} item = printf """{"name":"%s","value":"%s"}""" name item 
renderSchemaDataAsJsonP {schema = (EField name ns)} (i,symbol_op) 
                 = let op = if (symbol_op == Create) then "Create" else "Delete"
                       op_json=printf """{"i":%d,"op":"%s"}""" i op
                       ret = printf """{"name":"%s","value":%s}""" name op_json in
                       ret
renderSchemaDataAsJsonP {schema = (y .|. z)} (iteml,itemr) = (renderSchemaDataAsJsonP iteml)++
                                                           "," ++
                                                           (renderSchemaDataAsJsonP itemr)

renderSchemaDataVect : (s:Schema2) -> Vect size (SchemaType2 s) -> String
renderSchemaDataVect s [] = ""
renderSchemaDataVect s (x :: xs) = (renderSchemaDataAsJsonP x ) ++ a where
               a = if ( length xs==0 ) then "" else ","
               


renderModelData : (m:ModelSchema) -> (ModelData m)  -> String
renderModelData m x = printf """{"key":[%s],"val":[%s]}""" (renderSchemaDataVect (key m) (data_key x)) 
                                                           (renderSchemaDataVect (val m) (data_val x))

--renderSchemaDataVect (key m) (data_key x)
-- renderSchemaDataAsJsonP (data_val x)

--renderModelData m x = [ renderSchemaDataAsJsonP xx | xx <- (data_key x)]

--renderModelData x = x --[ renderSchemaDataAsJsonP xx | xx <- data_key x] --, renderSchemaDataAsJsonP (data_val x))

-- Local Variables:
-- idris-load-packages: ("contrib")
-- End:
 
