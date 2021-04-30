module Main


%access public export

{-
public export
Functor Taccount where
  map func (Ta x y) = Ta dr cr where
      dr = func(x)
      cr = func(y)
  map func (Tm x y) = Tm dr cr where
      dr = func(x)
      cr = func(y)            
  map func (Plus x y) = Plus (func x) (func y)
  map func (Mult x y) = Mult (func x) (func y)
-}
--  map func (Term x) = Term (func x)

data Ring  =  RZero
             |ROne
             | RAdd  Ring Ring
             | RMul Ring Ring
             | RNeg Ring
             | Sym String
             | Const Int

{-                    
  map func (RMul x y) = RMul u v where
                    u = func x
                    v = func y
  map func (RNeg x) = RNeg u where
                    u = func x
  map func (Sym x) =    Sym u where
                    u = func x
-}
expr1 : Ring 
expr1 = RMul (RAdd (Const 4) (Const 5)) (Sym "price")

--sub : Ring String
--sub = RAdd RZero (RMul (Sym "price") (Sym "qty") )

ctx : String -> Int
ctx "price" = 7
ctx "qty" = 2
ctx _ = 0


ev_expr : Ring -> Int
ev_expr RZero = 0
ev_expr ROne = 1
ev_expr (RAdd x y) = ev_expr(x)+ev_expr(y)
ev_expr (RMul x y) = ev_expr(x)*ev_expr(y)
ev_expr (RNeg x) = -1*ev_expr(x)
ev_expr (Sym x) = ctx x
ev_expr (Const x) = x

