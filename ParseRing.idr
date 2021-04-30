module Main

import Text.Lexer
import public Text.Parser.Core
import public Text.Parser


%default total

public export
data ExpressionToken = Number Integer
         | Operator String
         | OParen
         | CParen
         | Comment String
         | ExprSymbol String
         | EndInput

public export         
data Ring  =  RZero
             |ROne
             |RComment String
             | RAdd  Ring Ring
             | RMul Ring Ring
             | RNeg Ring
             | RSym String
             | RConst Integer
                  
                                    
export
Show ExpressionToken where
  show (Number x) = "number " ++ show x
  show (Operator x) = "operator " ++ x
  show OParen = "("
  show CParen = ")"
  show (ExprSymbol x) = "symbol " ++ show x 
  show EndInput = "end of input"
  show (Comment x) = "comment " ++ show x
  
export
Show (TokenData ExpressionToken) where
  show (MkToken l c t) = "line=" ++ show l ++ " col=" ++ show c ++ "tok=" ++ show t


||| from https://github.com/edwinb/Idris2/blob/master/src/Parser/Lexer.idr
comment : Lexer
comment = is '-' <+> is '-' <+> many (isNot '\n')

||| integer arithmetic operators plus, minus and multiply.
export
opChars : String
opChars = "+-*"

||| possible variable characters
export
symChars : String
symChars = "abcdefgijklmnopq"


operator : Lexer
operator = some (oneOf opChars)

toInt' : String -> Integer
toInt' = cast

expressionTokens : TokenMap ExpressionToken
expressionTokens =
   [(digits, \x => Number (toInt' x)),
   (operator, \x => Operator x),
   (is '(' ,\x => OParen),
   (is ')' ,\x => CParen),
   (spaces, Comment),
   (comment, Comment),
   (lowers, \x => ExprSymbol  x)]

{-
||| Description of a language's grammar. The `tok` parameter is the type
||| of tokens, and the `consumes` flag is True if the language is guaranteed
||| to be non-empty - that is, successfully parsing the language is guaranteed
||| to consume some input.
public export
data Grammar : (tok : Type) -> (consumes : Bool) -> Type -> Type where
   Empty : (val : ty) -> Grammar tok False ty
   Terminal : String -> (tok -> Maybe a) -> Grammar tok True a
   NextIs : String -> (tok -> Bool) -> Grammar tok False tok
   EOF : Grammar tok False ()

   Fail : Bool -> String -> Grammar tok c ty
   Commit : Grammar tok False ()
   MustWork : Grammar tok c a -> Grammar tok c a

   SeqEat : Grammar tok True a -> Inf (a -> Grammar tok c2 b) ->
            Grammar tok True b
   SeqEmpty : {c1, c2 : Bool} ->
              Grammar tok c1 a -> (a -> Grammar tok c2 b) ->
              Grammar tok (c1 || c2) b
   Alt : {c1, c2 : Bool} ->
         Grammar tok c1 ty -> Grammar tok c2 ty ->
         Grammar tok (c1 && c2) ty
-}
public export
Rule : Type -> Type
Rule ty = Grammar (TokenData ExpressionToken) True ty


commentSpace : Rule Ring
commentSpace = terminal (\x => case tok x of
                         Comment s => Just (RComment s)
                         _ => Nothing)


export
intLiteral : Rule Ring
intLiteral
  = terminal (\x => case tok x of
                  Number i => Just (RConst i)
                  _ => Nothing)

export
exprSymbol : Rule Ring
exprSymbol
  = terminal (\x => case tok x of
                  ExprSymbol i => Just (RSym i)
                  _ => Nothing)


openParen : Rule Ring
openParen = terminal (\x => case tok x of
                  OParen => Just RZero
                  _ => Nothing)

closeParen : Rule Ring
closeParen = terminal (\x => case tok x of
                   CParen => Just RZero
                   _ => Nothing)
                   
--paren : Rule Integer -> Rule Integer
--paren exp = openParen *> exp <* closeParen                   



||| Matches if this is an operator token and string matches, that is,
||| it is the required type of operator.
op : String -> Rule Ring
op s = terminal (\x => case tok x of
                         (Operator s1) => if s==s1 then Just RZero else Nothing
                         _ => Nothing)


-------------------------------
intLiteralC : Rule Ring
intLiteralC = (intLiteral <* commentSpace) <|> intLiteral

exprSymbolC : Rule Ring
exprSymbolC = (exprSymbol <* commentSpace) <|> exprSymbol




openParenC : Rule Ring
openParenC = (openParen <* commentSpace) <|> openParen

closeParenC : Rule Ring
closeParenC = (closeParen <* commentSpace) <|> closeParen

||| like op but followed by optional comment or space
opC : String -> Rule Ring
opC s = ((op s) <* commentSpace) <|> (op s)

------------------------------




addInt : Ring -> Ring -> Ring
addInt a b = RAdd a b

{-
export
add : Grammar tok c1 Integer ->
      Grammar tok c2 Integer ->
      Grammar tok c3 Integer ->
      Grammar tok ((c1 || c2) || c3) Integer
add x y z = map addInt (x *> y) <*> z
-}

subInt : Ring -> Ring -> Ring
subInt a b = RAdd a (RNeg b)

{-
export
sub : Grammar tok c1 Integer ->
      Grammar tok c2 Integer ->
      Grammar tok c3 Integer ->
      Grammar tok ((c1 || c2) || c3) Integer
sub x y z = map subInt (x *> y) <*> z
-}

multInt : Ring -> Ring -> Ring
multInt a b = RMul a b


{-
export
mult : Grammar tok c1 Integer ->
       Grammar tok c2 Integer ->
       Grammar tok c3 Integer ->
       Grammar tok ((c1 || c2) || c3) Integer
mult x y z = map multInt (x *> y) <*> z
-}



--                INFIX

expr : Rule Ring

factor : Rule Ring
factor = intLiteralC <|> exprSymbolC <|> do
              openParenC
              r <- expr
              closeParenC
              pure r

term : Rule Ring
term = map multInt factor <*> (
        (opC "*")
        *> factor)
     <|> factor

expr = map addInt term <*> (
        (opC "+")
        *> term)
        
     <|> map subInt term <*> (
        (opC "-")
        *> term)
     <|> term

calc : String -> Either (ParseError (TokenData ExpressionToken))
                        (Ring, List (TokenData ExpressionToken))
calc s = parse expr (fst (lex expressionTokens s))

lft : (ParseError (TokenData ExpressionToken)) -> IO ()
lft (Error s lst) = putStrLn ("error:"++s)

{-
rht : (Ring, List (TokenData ExpressionToken)) -> IO ()
rht i = putStrLn ("right " ++ (show i))
-}

main : IO ()
main = do
  putStr "alg>"
  --x <- getLine
  --putStrLn x
  --either lft rht (calc x) -- eliminator for Either
