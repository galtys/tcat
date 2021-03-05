module Exchange

import Control.Monad.State
import Data.SortedMap
--import Prelude.Algebra
import DataStore

%access public export

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

-- String -> index
OrderLineKey1 : Schema
OrderLineKey1 = ((SInt (FA "p1" False) )  .+.(SInt (FA "p2" False)  ).+.(SInt (FA "line" False) ).+.
                 (SString (FA "sku1" True) ).+.(SInt (FA "sku2" False)  ).+.(SInt (FA "price_unit" False) ) )

test_val : (SchemaType OrderLineKey1)
test_val = (1,7,1,"1",100,188)

test_key : String
test_key = display_as_key  test_val

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
     --key : OrderLineKey
     key : (SchemaType OrderLineKey1)
     qty : Tterm



Show OrderLine where
     show (MkOrderLine key qty) = show(key)++"->"++show(qty)


-- Local Variables:
-- idris-load-packages: ("contrib" "rationals" "idris_free" "containers")
-- End:
