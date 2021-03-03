module Exchange

import Control.Monad.State
import Data.SortedMap
--import Prelude.Algebra

%access public export

{-
data Asset = AA String
data Partner = PP Integer
data Location = LL String
data Order = O String
data Line = Ln String
data Qty = Q Integer
data UOM = Uom

data CarrierM = MA Asset | MP Partner | MO Order | MQty Qty

data CarrierA = CA Asset | CL Location | CO Order | CQty Qty

data Carrier = V String | N Integer | A String | L String | P String | ZERO
-}

Name : Type
Name = String

SPairs : Type
SPairs = (Name,Name)

data FieldTypes = FInt | FString | FSelection | FDate 

test_selection : List SPairs
test_selection = [("sku1","SKU1"),("sku2","SKU2")]


data FieldDef : FieldTypes -> Type where
     IntsD :       (name : Name) ->  FieldDef FInt
     StrsD :       (name : Name) ->  FieldDef FString
     SelD :        (name : Name) ->  FieldDef FSelection
     DatesD :      (name : Name) ->  FieldDef FDate

test_model : (FieldDef FInt, FieldDef FInt, FieldDef FString)
test_model = ((IntsD "p1"), (IntsD "p2"), (StrsD "line"))
--ModelDef : Type
--ModelDef = List FieldDef FieldTypes


--so_line_def : List (FieldDef FieldTypes)
--so_line_def = [(IntsD "p1") (IntsD "p2") (StrsD "line")]


data FieldVal : FieldTypes -> Type where
     Ints :       (val : Int) ->  FieldVal FInt
     Strs :       (val : String) ->  FieldVal FString
     Selections : (val : SPairs)-> FieldVal FSelection
     Dates :      (val : Int) ->  FieldVal FDate


--ModelVal : Type
--ModelVal = List FieldVal FieldTypes


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

record OrderLineKey where
     constructor MkOrderLineKey
     p1  : Integer  --partner 1
     p2  : Integer  --partner 2
     line : Integer -- line number
     sku1 : Integer  -- sku1
     sku2 : Integer  -- sku2
     price_unit : Integer
--     product_sku1 : Integer
--     product_sku2 : Integer
--   product_uom : UOM
--   tax_id : Integer
--   discount : Integer
record OrderLine where
     constructor MkOrderLine     
     key : OrderLineKey
     qty : Tterm


linekey2string : OrderLineKey -> String
linekey2string (MkOrderLineKey p1 p2 line sku1 sku2 price_unit) = i2s(p1)++i2s(p2)++i2s(line)++i2s(sku1)++i2s(sku2)++i2s(price_unit)

Show OrderLineKey where
     show (MkOrderLineKey p1 p2 line sku1 sku2 price_unit) = "(p1:"++show(p1)++"p2:"++show(p2)++"line:"++show(line)++"sku1:"++show(sku1)++"sku2:"++show(sku2)++"price_unit:"++show(price_unit)

eqstr : String -> String -> Bool
eqstr x y = (==) x y

eqkey : OrderLineKey -> OrderLineKey -> Bool
eqkey k1 k2 = (eqstr r1 r2) where 
            r1 = linekey2string k1
            r2 = linekey2string k2

{-
Eq OrderLineKey where
     (==) (MkOrderLineKey p1 p2 line sku1 sku2 price_unit) (MkOrderLineKey p1' p2' line' sku1' sku2' price_unit')  
         =  p1==p1' && p2==p2' && line==line' && sku1 == sku1' && sku2==sku2' && price_unit==price_unit'

Ord OrderLineKey where
  compare (MkOrderLineKey p1 p2 line sku1 sku2 price_unit) (MkOrderLineKey p1' p2' line' sku1' sku2' price_unit')
      = case compare p1 p1' of   --artist
           EQ => case compare line line' of    --year
                  EQ => case compare p2 p2' of  --title
                      EQ => case compare sku1 sku1' of
                           EQ => case compare sku2 sku2' of
                                EQ => compare price_unit price_unit'
                                diff_sku2 => diff_sku2
                           diff_sku1 => diff_sku1
                      diff_p2 => diff_p2
                  diff_line => diff_line
           diff_p1 => diff_p1
-}
Eq OrderLineKey where
       (==) k1 k2 = eqkey k1 k2

Ord OrderLineKey where
  compare k1 k2 = compare (linekey2string k1) (linekey2string k2)


Show OrderLine where
     show (MkOrderLine key qty) = show(key)++"->"++show(qty)


key_empty : SortedMap OrderLineKey Tterm
key_empty = empty

map_to_kv : SortedMap OrderLineKey Tterm -> List (OrderLineKey,Tterm)
map_to_kv sm = (toList sm)

map_to_lines : List (OrderLineKey,Tterm) -> List OrderLine
map_to_lines [] = []
map_to_lines ( (k,v) :: xs) = [MkOrderLine k v]++map_to_lines xs


interpret1 : List OrderLine -> State (SortedMap OrderLineKey Tterm) (List OrderLine)
interpret1 [] = do
           --put key_empty
           pure []
interpret1 (x :: xs) = do
           i11 <- interpret1 xs
           st <- get
           let k = key x
           let v = qty x
           let sm = insert k v key_empty
           put (merge st sm)
           pure i11

lines_to_map : List OrderLine -> SortedMap OrderLineKey Tterm
lines_to_map xs = execState (interpret1 xs) key_empty


test2 : List OrderLine -> List (OrderLineKey,Tterm)
test2 x =map_to_kv (lines_to_map x)


--interpretEntries : 
{-
record Term where
     constructor MkTerm
     dr : Qty
     cr : Qty
     price : Qty
     p  : Partner
     asset : Asset
     order : Order  
-}

{-
Eq Carrier where
  (==) (V x) (V y) = (x==y)
  (==) (N x) (N y) = (x==y)
  (==) (A x) (A y) = (x==y)
  (==) (L x) (L y) = (x==y)
  (==) (P x) (P y) = (x==y)
  (==) _ _ = False
-}

{-

record AssetChange where
       constructor MkChange
       owner : Carrier
       asset : Carrier
       qty : Carrier




record Exchange where
       constructor MkEx
       p1 : Carrier
       p2 : Carrier
       q1 : Carrier
       a1 : Carrier  -- from
       q2 : Carrier
       a2 : Carrier  -- to
-}


--Eq Exchange where   
--  (==) (MkEx p1 p2 q1 a1 q2 a2) (MkEx x y z w s t) = (p1==x) && (p2==y) ...


-- discount %
       -- tax (inc vat, or ex vat)

{-       
record ChangeItem where
       constructor MkChangeItem
       change : AssetChange
       qty : Carrier
                     
record AssetMoveLine where
       constructor MkMoveLine
       location : Carrier
       asset :    Carrier
       qty   : Carrier

record AssetMove where
       constructor MkMove
       from : AssetMoveLine
       to   : AssetMoveLine
-}

{-



ex2 : Exchange
ex2 = MkEx (P "PJB") (P "Cust") (N 1) (A "$") (N 3) (A "SKU2") 

ex3 : Exchange
ex3 = MkEx (P "PJB") (P "Cust") (N 1) (A "$") (N 7) (A "SKU3") 

ex4 : Exchange
ex4 = MkEx (P "PJB") (P "Cust") (N 1) (A "$") (N 2) (A "SKU3") 

ex5 : Exchange
ex5 = MkEx (P "PJB") (P "Cust") (N 1) (A "SKU3") (N 1) (A "$") 
-}


{-

ex2 : Exchange
ex2 = MkExchange (MkChange (P "PJB") (A "$") (N 1) ) (MkChange (P "Cust") (A "sku1") (N 4))
ex3 : Exchange
ex3 = MkExchange (MkChange (P "PJB") (A "$") (N 1) ) (MkChange (P "Cust") (A "sku2") (N 3))
ex4 : Exchange
ex4 = MkExchange (MkChange (P "PJB") (A "$") (N 1) ) (MkChange (P "Cust") (A "sku3") (N 7))

ex41 : Exchange 
ex41 = MkExchange (MkChange (P "PJB") (A "$") (N 1) ) (MkChange (P "Cust") (A "sku4") (N 1))
-}

-- Local Variables:
-- idris-load-packages: ("contrib" "rationals" "idris_free" "containers")
-- End:
