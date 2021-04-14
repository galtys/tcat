module OrderState

--import Data.SortedMap

Key : Type
Key = String

data FlagRW = RO | RW

pricelist: Nat
pricelist = 3

price : Nat -> Nat
price qty = pricelist*qty

record Pricelist where
  constructor MkP
  k : Nat -- but it will never increase
  price : Nat

record OrderState where
  constructor MkOS
  k : Nat
  rw : FlagRW
  qty : Nat  -- user input
  sub : Nat  -- calculated

record WHS where
  constructor MkWHS
  k : Nat
  procure :  Nat  -- qty from order
  done :     Nat  -- user input
  bkorders : Nat  -- calculated
  
record Invoice where
  k : Nat
  qty : Nat     -- qty from whs done
  sub : Nat     -- calculated
  
record Payment where
  k : Nat
  tbp : Nat     -- from invoice sub
  paid : Nat    -- user input

s1 : OrderState
s1 = MkOS 0 1 (price 1)
-------------------------------------------------------
 
State : Type
State = (Nat, FlagRW)

UI = EditButton | CommitButton | SetRouttingButton

data OrderCmd : Type ->
                State ->
                State ->
                Type where
     Edit     : OrderCmd ()   (k, RO) (k,   RW)
     Commit   : OrderCmd ()   (k, RW) (S k, RO)
     SetRoute : OrderCmd ()   s1 s2 

     Subtotal : OrderCmd ()   s1 s2
     Total    : OrderCmd ()   s1 s2
     
     
     
