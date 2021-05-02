module Main

import Data.Vect
import Printf
import Data.SortedMap
import Control.Monad.State
import Language.JSON
import Language.JSON.Data

%access public export

--data Tterm = Tt Integer Integer

record Tterm where
  constructor Tt
  dr : Integer
  cr : Integer

tadd : Tterm -> Tterm -> Tterm
tadd (Tt dr1 cr1) (Tt dr2 cr2) = (Tt dr cr) where
     dr = dr1+dr2
     cr = cr1+cr2

subs : Integer -> Integer -> Integer
subs x y = (x-y)

tmin : Tterm -> Integer
tmin (Tt dr cr) = (min dr cr)

trep : Tterm -> Tterm
trep xt@(Tt dr cr) = (Tt dr1 cr1 ) where
     dr1 = subs dr (tmin xt)
     cr1 = subs cr (tmin xt)

integer_to_int : Integer -> Int
integer_to_int x = the Int (cast (the Nat (cast x)))

t2integer : Tterm -> Integer
t2integer (Tt dr cr) = subs dr cr

t2int : Tterm -> Int
t2int x = integer_to_int (t2integer x)

integer2t : Integer -> Tterm
integer2t x = case x == 0 of
          True => (Tt 0 0)
          False => case (x > 0) of
                  True => (Tt x 0)
                  False => (Tt 0 (abs(x)))

tmul : Tterm -> Tterm -> Tterm
tmul t1 t2 = integer2t (   (t2integer t1)*(t2integer t2)   )

i2s : Integer -> String
i2s x = the String (cast x)
     
Semigroup Tterm where
     (<+>) a b = tadd a b

Show Tterm where
     show (Tt x y) = show(x) ++ "//" ++ show(y)

data SymbolOP = Create | Delete | Empty

implementation Show SymbolOP where
  show Create = "Create"
  show Delete = "Delete"
  show Empty = "Empty"

Eq SymbolOP where
     (==) Create Create = True
     (==) Delete Delete = True
     (==) Empty Empty = True
     (==)     _     _ = False
     (/=) x y = not (x==y)

Eq Tterm where
     (==) (Tt dr1 cr1) (Tt dr2 cr2) = ( (dr1+cr2)==(cr1+dr2) )

tinv: Tterm -> Tterm
tinv (Tt dr cr) = Tt cr dr

inv: SymbolOP -> SymbolOP
inv Create = Delete
inv Delete = Create
inv Empty  = Empty

Semigroup SymbolOP where
  (<+>) Create Create = Create
  (<+>) Create Delete = Empty
  (<+>) Create Empty =  Create
  (<+>) Delete Create = Empty
  (<+>) Delete Delete = Delete
  (<+>) Delete Empty =  Delete
  (<+>) Empty Create =  Create
  (<+>) Empty Delete =  Delete
  (<+>) Empty Empty =   Empty


infixr 5 .|.
infixr 5 .+.

{-
record FieldArgs where
  constructor FA
  name : String
  rw : Bool
-}

data SymbolType : Type where  -- symbol type
     NSInt : String -> SymbolType
     NSNat : String -> SymbolType
     NSCode : String -> SymbolType  --asset, owner, location, address


data FieldDefKey : Type where
     FBool :  FieldDefKey
     FString : FieldDefKey
     --FInt
     --FUUID
     -- FM2O : (ns : NS) -> FieldDefKey -- abstraction
     
     ---FM2M  -- abstraction and modeling
     
--     FTterm :  FieldDefKey
     
data FieldDefVal : Type where  --Algebra Carriers 
     FTtermV :  FieldDefVal
     FSop    :  FieldDefVal
     -- Date
     -- DateTime
     
data KV = Key | Val

data Schema2 : KV -> Type where
     IField : (name:String) -> (ft: FieldDefKey) -> Schema2 Key
     EField : (name:String) -> (ns :String)-> Schema2 Key -- id implementation
     IFieldV : (name:String) -> (ft: FieldDefVal) -> Schema2 Val  -- algebra -- vector name's
     --EFieldUser : (name:String) -> (ns :String)-> Schema2 Key -- code implementation
     (.|.) : (s1 : Schema2 Key) -> (s2 :Schema2 Key) -> Schema2 Key 
     (.+.) : (s1 : Schema2 Val) -> (s2 :Schema2 Val) -> Schema2 Val

--Eq (Schema2 Key) where
--     (==) x y = ?reteq



SchemaType2 : Schema2 kv-> Type
SchemaType2 (IField name FBool)= Bool
SchemaType2 (IField name FString )= String
--SchemaType2 (IField name FTterm ) = Tterm
SchemaType2 (IFieldV name FTtermV) = Tterm
SchemaType2 (IFieldV name FSop) = SymbolOP
SchemaType2 (EField name ns ) = Integer
SchemaType2 (x .|. y) = (SchemaType2 x, SchemaType2 y)
SchemaType2 (x .+. y) = (SchemaType2 x, SchemaType2 y)

SchemaTypeVal : Schema2 Val -> Type
SchemaTypeVal (IFieldV name FTtermV) = Tterm
SchemaTypeVal (IFieldV name FSop) = SymbolOP
SchemaTypeVal (s1 .+. s2) = (SchemaTypeVal s1, SchemaTypeVal s2)

schema2ZeroVal : (s:Schema2 kv) -> (SchemaType2 s)
schema2ZeroVal (IField name FBool) = False
--schema2ZeroVal (IField name FTterm ) = (Tt 0 0)
schema2ZeroVal (IField name FString ) =  ""
schema2ZeroVal (IFieldV name FTtermV ) = (Tt 0 0)
schema2ZeroVal (IFieldV name FSop ) = Empty
schema2ZeroVal (EField name ns) = 0
schema2ZeroVal (x .|. y) = (schema2ZeroVal x,schema2ZeroVal y)
schema2ZeroVal (x .+. y) = (schema2ZeroVal x,schema2ZeroVal y)

public export 
eqSchema2 : (SchemaType2 schema) -> (SchemaType2 schema) -> Bool
eqSchema2 {schema = (IField name FBool)} item1 item2 = (item1 == item2)
eqSchema2 {schema = (IField name FString)} item1 item2 = (item1 == item2)
--eqSchema2 {schema = (IField name FTterm)} item1 item2 = (item1 == item2)
eqSchema2 {schema = (IFieldV name FTtermV)} item1 item2 = (item1 == item2)
eqSchema2 {schema = (IFieldV name FSop)} item1 item2 = (item1 == item2)
eqSchema2 {schema = (EField name ns)} item1 item2 = (item1 == item2)
eqSchema2 {schema = (y .|. z)} (i1l,i1r) (i2l,i2r) = (eqSchema2 i1l i2l) && (eqSchema2  i1r i2r)
eqSchema2 {schema = (y .+. z)} (i1l,i1r) (i2l,i2r) = (eqSchema2 i1l i2l) && (eqSchema2  i1r i2r)

public export
invSchema2 : (SchemaType2 schema) -> (SchemaType2 schema)
invSchema2 {schema = (IFieldV name FTtermV)} item1 = tinv (item1)
invSchema2 {schema = (IFieldV name FSop)} item1 = inv (item1)
invSchema2 {schema = (y .+. z)} (iteml,itemr) = (invSchema2 iteml, invSchema2 itemr)

public export -- semigroup operation
addSchema2Vals : (SchemaType2 schema) -> (SchemaType2 schema) -> (SchemaType2 schema)
addSchema2Vals {schema = (IField name FBool)} item1 item2 = (item1 || item2)
addSchema2Vals {schema = (IField name FString)} item1 item2 = item1 <+> item2
--addSchema2Vals {schema = (IField name FTterm)} item1 item2 = item1 <+> item2  -- For Tterm, add
addSchema2Vals {schema = (IFieldV name FTtermV)} item1 item2 = item1 <+> item2  -- For Tterm, add
addSchema2Vals {schema = (IFieldV name FSop)} item1 item2 = item1 <+> item2  -- For Tterm, add
addSchema2Vals {schema = (EField name ns)} item1 item2 = if ((item2== 0) || (item1==0)) then (item1 + item2) else item2
addSchema2Vals {schema = (y .|. z)} (i1l,i1r) (i2l,i2r) = ( addSchema2Vals i1l i2l, addSchema2Vals i1r i2r)



public export -- semigroup operation
mulSchema2Vals : (SchemaType2 schema) -> (SchemaType2 schema) -> (SchemaType2 schema)

--mulSchema2Vals {schema = (IField name FTterm)} item1 item2 =   tmul item1 item2  -- For Tterm, add
mulSchema2Vals {schema = (IFieldV name FTtermV)} item1 item2 = tmul item1 item2  -- For Tterm, add


mulSchema2Vals {schema = (IField name FBool)} item1 item2 = (item1 && item2)
mulSchema2Vals {schema = (IField name FString)} item1 item2 = item1 <+> item2
mulSchema2Vals {schema = (IFieldV name FSop)} item1 item2 = item1 <+> item2  -- For Tterm, add
mulSchema2Vals {schema = (EField name ns)} item1 item2 = if ((item2== 0) && (item1==0)) then (item1 * item2) else item2

mulSchema2Vals {schema = (y .|. z)} (i1l,i1r) (i2l,i2r) = ( mulSchema2Vals i1l i2l, mulSchema2Vals i1r i2r)


record ModelSchema (a:KV) where
     constructor MkModelSchema
     key : Schema2 Key
     val : Schema2 a
     name : String
--     rw : Schema2 kv -> Bool


record ModelData (a:KV) (m: (ModelSchema a))  where
     constructor MkMD
     size : Nat
     data_key : Vect size (SchemaType2 (key m ) )
     data_val : Vect size (SchemaType2 (val m ) )


--record Pokus (m:ModelSchema) where
--     constructor MkPokus
     -- rwk : (key m) -> Bool

record ModelDataList (a:KV) (m:ModelSchema a) where
     constructor MkMDList
     name : String
     --default_key : (SchemaType2 (key m))    -- as ZERO element?
     --default_value : (SchemaType2 (val m)) -- Acting as ZERO element?
--     zero_val : (SchemaType2 (val m)) can be calculated from m
     keyL : List (SchemaType2 (key m))
     valL : List (SchemaType2 (val m))

_f_val : String -> Tterm 
_f_val "p1" = Tt 4 0
_f_val "p2" = Tt 1 0
_f_val "p3" = Tt 7 0
_f_val _    = Tt 0 0

test_kv : List (String,Tterm)
test_kv = [("p1",Tt 4 0), ("p2", Tt 1 0), ("p3",Tt 7 0)]

interpret : List (String,Tterm) -> State (SortedMap String Tterm) ()
interpret [] = pure ()
interpret (x@(k,v) :: xs)= do
      _xs <- interpret xs
      st <- get
      let sm = insert k v empty
      put (merge st sm)
      pure ()

_map_to_lambda : SortedMap String Tterm -> (String -> Tterm)
_map_to_lambda kvm 
      = (\k => case (Data.SortedMap.lookup k kvm) of
                  Nothing => (Tt 0 0) 
                  (Just x) => x)

muf37 : String -> Tterm 
muf37 = _map_to_lambda (execState (interpret test_kv) empty)



{-
record DataStore where
  constructor MkData
  schema : Schema
  size : Nat
  items : Vect size (SchemaType schema)


addToStore : (store : DataStore) -> SchemaType (schema store) -> DataStore
addToStore (MkData schema size store) newitem = MkData schema _ (addToData store)
  where
    addToData : Vect oldsize (SchemaType schema) -> Vect (S oldsize) (SchemaType schema)
    addToData [] = [newitem]
    addToData (x :: xs) = x :: addToData xs

setSchema : (store : DataStore) -> Schema -> Maybe DataStore
setSchema store schema = case size store of
                              Z => Just (MkData schema _ [])
                              S k => Nothing

data Command : Schema -> Type where
     SetSchema : Schema -> Command schema
     Add : SchemaType schema -> Command schema
     Get : Integer -> Command schema
     Quit : Command schema


parsePrefix : (schema : Schema) -> String -> Maybe (SchemaType schema, String)
parsePrefix (SString _name )input = getQuoted (unpack input)
  where
    getQuoted : List Char -> Maybe (String, String)
    getQuoted ('"' :: xs)
        = case span (/= '"') xs of
               (quoted, '"' :: rest) => Just (pack quoted, ltrim (pack rest))
               _ => Nothing
    getQuoted _ = Nothing

parsePrefix (SInt _name) input = case span isDigit input of
                              ("", rest) => Nothing
                              (num, rest) => Just (cast num, ltrim rest)
parsePrefix (schemal .+. schemar) input
    = case parsePrefix schemal input of
           Nothing => Nothing
           Just (l_val, input') =>
                case parsePrefix schemar input' of
                     Nothing => Nothing
                     Just (r_val, input'') => Just ((l_val, r_val), input'')

parseBySchema : (schema : Schema) -> String -> Maybe (SchemaType schema)
parseBySchema schema x = case parsePrefix schema x of
                              Nothing => Nothing
                              Just (res, "") => Just res
                              Just _ => Nothing



parseSchema : List String -> Maybe Schema
parseSchema ("String" :: xs)
    = case xs of
           [] => Just (SString ("s1"))
           _ => case parseSchema xs of
                     Nothing => Nothing
                     Just xs_sch => Just ((SString "sn") .+. xs_sch)
parseSchema ("Int" :: xs)
    = case xs of
           [] => Just (SInt "i1")
           _ => case parseSchema xs of
                     Nothing => Nothing
                     Just xs_sch => Just ((SInt "in")  .+. xs_sch)
parseSchema _ = Nothing


parseCommand : (schema : Schema) -> String -> String -> Maybe (Command schema)
parseCommand schema "add" rest = case parseBySchema schema rest of
                                      Nothing => Nothing
                                      Just restok => Just (Add restok)
parseCommand schema "get" val = case all isDigit (unpack val) of
                                    False => Nothing
                                    True => Just (Get (cast val))
parseCommand schema "quit" "" = Just Quit
parseCommand schema "schema" rest
    = case parseSchema (words rest) of
           Nothing => Nothing
           Just schemaok => Just (SetSchema schemaok)
parseCommand _ _ _ = Nothing


parse : (schema : Schema) -> (input : String) -> Maybe (Command schema)
parse schema input = case span (/= ' ') input of
                          (cmd, args) => parseCommand schema cmd (ltrim args)

display : SchemaType schema -> String
display {schema = (SString s1)} item = s1++":"++(show item)
display {schema = (SInt s2)} item = s2++":"++(show item)
display {schema = (y .+. z)} (iteml, itemr) = display iteml ++ ", " ++
                                              display itemr





getEntry : (pos : Integer) -> (store : DataStore) ->
           Maybe (String, DataStore)
getEntry pos store
    = let store_items = items store in
          case integerToFin pos (size store) of
               Nothing => Just ("Out of range\n", store)
               Just id => Just (display (index id (items store) ) ++ "\n", store)

processInput : DataStore -> String -> Maybe (String, DataStore)
processInput store input
    = case parse (schema store) input of
           Nothing => Just ("Invalid command\n", store)
           Just (Add item) =>
              Just ("ID " ++ show (size store) ++ "\n", addToStore store item)
           Just (SetSchema schema') =>
              case setSchema store schema' of
                   Nothing => Just ("Can't update schema when entries in store\n", store)
                   Just store' => Just ("OK\n", store')
           Just (Get pos) => getEntry pos store
           Just Quit => Nothing
-}

--main : IO ()
--main = replWith (MkData ((SString "f1") .+. (SString "f2").+. (SInt "f3")) _ []) "Command: " processIn

-- Local Variables:
-- idris-load-packages: ("contrib")
-- End:

