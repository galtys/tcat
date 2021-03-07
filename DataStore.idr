module Main

import Data.Vect
import Printf
%access public export

       
--data Schema = SString | SInt | (.+.) Schema Schema

data Tterm = Tt Integer Integer

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

i2s : Integer -> String
i2s x = the String (cast x)
     
Semigroup Tterm where
     (<+>) a b = tadd a b
     
Show Tterm where
     show (Tt x y) = show(x) ++ "//" ++ show(y)

data SymbolOP = Create | Delete

Semigroup SymbolOP where
     (<+>) Create Create = Create
     (<+>) Create Delete = Delete
     (<+>) Delete Create = Create
     (<+>) Delete Delete = Delete

record FieldArgs where
  constructor FA
  name : String
  rw : Bool

infixr 6 .+.
infixr 5 .->.

data Schema : Type where
     SString : (fargs : FieldArgs) -> Schema
     SInt :    (fargs : FieldArgs) -> Schema
     STterm :  (fargs : FieldArgs) -> Schema
     SSymbolOP : (fargs : FieldArgs) -> Schema
     (.+.) : (s1 : Schema) -> (s2 : Schema) -> Schema 
     (.->.) : (s1 : Schema) -> (s2 : Schema) -> Schema 
     
SchemaType : Schema -> Type
SchemaType (SString name)= String
SchemaType (SInt name )= Integer
SchemaType (STterm name ) = Tterm
SchemaType (SSymbolOP name) = SymbolOP
SchemaType (x .+. y) = (SchemaType x, SchemaType y)
SchemaType (x .->. y) = ( (SchemaType x) -> (SchemaType y))

-- String -> index
OrderLineKey1 : Schema
OrderLineKey1 = (SString (FA "sku1" False) ) .+. 
                (SInt (FA "price_unit" False) ) .+. 
                (SString (FA "sku2" False) )

OrderLineKey2 : Schema
OrderLineKey2 = (SString (FA "sku1" False) ) .->. 
                (SInt (FA "price_unit" False) ) .+. 
                (SString (FA "sku2" False) )

Items2 : Schema
Items2 =  (SString (FA "sku1" False) ) .->. 
          (STterm  (FA "qty" True) )


--(SInt (FA "p1" False) )  .+.(SInt (FA "p2" False)  ).+.(SInt (FA "line" False) ).+.

{-
record OrderLineKey where
     constructor MkOrderLineKey
     p1  : Integer  --partner 1
     p2  : Integer  --partner 2
     line : Integer -- line number
     sku1 : Integer  -- sku1
     sku2 : Integer  -- sku2
     price_unit : Integer
-}
--     product_sku1 : Integer
--     product_sku2 : Integer
--   product_uom : UOM
--   tax_id : Integer
--   discount : Integer

record OrderLine where
     constructor MkOrderLine     
     --key : OrderLineKey
     key : (SchemaType OrderLineKey1)
     qty : Tterm --(SchemaType )



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
--main = replWith (MkData ((SString "f1") .+. (SString "f2").+. (SInt "f3")) _ []) "Command: " processInput
{-
-}
