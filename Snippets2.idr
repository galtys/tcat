module Snippets2

import Printf
import DataStore
import JSIO

%access public export

(>>) : Monad m => m a -> m b -> m b
(>>) x y = x >>= (\_ => y)


--msgTypes : Schema2 Key


keyItems : Schema2 Key
keyItems = (EField "sku" (NSCode "asset") ) .|. (EField "cy" (NSCode "asset"))

keyTotal : Schema2 Key
keyTotal = (EField "cy" (NSCode "asset"))

msgType : Schema2 Key
msgType = (EField "uid" (NSCode "user") ) .|. (EField "msgt" (NSCode "msgt")) .|. (IField "t" FDateTime) 

versionType : Schema2 Key
versionType = (EField "version" (NSSeq "version"))


fxType : Schema2 Key
fxType = (EField "p1" (NSCode "partner") ) .|. (EField "p2" (NSCode "partner"))

versionNode : Schema2Tree Key
versionNode = S2Name "version" (S2Node versionType)

msgNode : Schema2Tree Key
msgNode = S2Name "msg" (S2Node msgType)

fxNode : Schema2Tree Key
fxNode =  S2Name "fx" (S2Node fxType)

itemsNode : Schema2Tree Key
itemsNode = S2Name "items" (S2Node keyItems)

deliveryNode : Schema2Tree Key
deliveryNode = S2Name "delivery" (S2Node (EField "l1" (NSCode "location") ))

billingNode : Schema2Tree Key
billingNode = S2Name "billing" (S2Node (EField "l2" (NSCode "location") ))

exNode : Schema2Tree Key
exNode = S2Name "exchange" (fxNode :: itemsNode)


moveNode : Schema2Tree Key
moveNode = S2Name "move" (fxNode :: (S2Node (EField "sku" (NSCode "asset") )) )

payNode : Schema2Tree Key
payNode = S2Name "pay" (fxNode :: (S2Node (EField "cy" (NSCode "asset") )) )


orderNode : Schema2Tree Key
orderNode = S2Name "order" (exNode :: deliveryNode :: billingNode)

invoiceNode : Schema2Tree Key
invoiceNode = S2Name "invoice" (exNode :: deliveryNode :: billingNode)


pickingNode : Schema2Tree Key
pickingNode = S2Name "picking" ( moveNode :: deliveryNode)

paymentNode : Schema2Tree Key
paymentNode = S2Name "payment" ( payNode :: billingNode)


--- Messages
orderMsgNode : Schema2Tree Key
orderMsgNode = S2Name "order_msg" (msgNode :: orderNode)

orderVersionMsgNode : Schema2Tree Key
orderVersionMsgNode = S2Name "order_msg_v" (orderMsgNode :: versionNode)



invoiceMsgNode : Schema2Tree Key
invoiceMsgNode = S2Name "invoice_msg" (msgNode :: invoiceNode)

pickingMsgNode : Schema2Tree Key
pickingMsgNode = S2Name "picking" (msgNode :: pickingNode)

paymentMsgNode : Schema2Tree Key
paymentMsgNode = S2Name "payment" (msgNode :: paymentNode)

qtyType : Schema2 Val
qtyType = IFieldAlg "qty" FIntCarrier

priceUnitType : Schema2 Val
--priceUnitType = IFieldAlg "price_unit <- pricelist[order/exchange/items].price_unit" FIntCarrier
priceUnitType = IFieldAlg "price_unit" FIntCarrier

priceType : Schema2 Val
priceType = IFieldAlg "price=qty*price_unit" FIntCarrier


qtyNode : Schema2Tree Val
qtyNode = S2Name "qty" (S2Node qtyType)

priceUnitNode : Schema2Tree Val
priceUnitNode = S2Name "price_unit" (S2Node priceUnitType)

--priceUnitNode : Schema2Tree Val
--priceUnitNode = S2Name "price_unit" (S2Node priceUnitType)

priceNode : Schema2Tree Val
priceNode = S2Name "price" (S2Node priceType)

orderValNode : Schema2Tree Val
orderValNode = S2Name "order" (qtyNode :: priceUnitNode :: priceNode)

orderVersionMsgVector : Vector
orderVersionMsgVector = MkVector orderVersionMsgNode orderValNode

orderMsgVector : Vector
orderMsgVector = MkVector orderMsgNode orderValNode

data MachineCmd : Type -> Vector -> Vector -> Type where
    InitVector : MachineCmd () v1 v2
    EditVector : MachineCmd () v1 v2
    CommitVector : MachineCmd () v1 v2
    Display : String -> MachineCmd () v1 v1    
    Pure : ty -> MachineCmd ty v1 v1
    (>>=) : MachineCmd a v1 v2 ->
            (a -> MachineCmd b v2 v3) ->
            MachineCmd b v1 v3
data MachineIO : Vector -> Type where
    Do : MachineCmd a v1 v2 ->
         (a -> Inf (MachineIO v2)) -> MachineIO v1
         
namespace MachineDo
    (>>=) : MachineCmd a v1 v2 ->
          (a -> Inf (MachineIO v2)) -> MachineIO v1
    (>>=) = Do

drop_key : (c:String) -> (Schema2 Key) -> (Schema2 Key)
drop_key c ( x@(EField n1 ns1) .|. y@(EField n2 ns2)) = case (c==n1) of 
                                                              True => y
                                                              False => case (c==n2) of 
                                                                        True => x
                                                                        False => (x .|. y)
drop_key c ( x .|. y ) = (drop_key c x) .|. (drop_key c y)
drop_key c f = f

{-
convert_s2 : (sb: Schema2 Key) -> (SchemaType2 si) -> (SchemaType2 sb)
convert_s2 (IField namex FBool) {si = (IField name FBool) } item = item
convert_s2 (IField namex FString) {si = (IField name FString) } item = item
convert_s2 (EField namex ns) {si = (EField name ns2) } item = item
convert_s2 sb {si = (y .|. z)} it = convert_s2 sb it
-}
namespace convert_s3LR_drop_col
  convert_s3 : (sb: Schema2 Key) -> (SchemaType2 si) -> (SchemaType2 sb)
  convert_s3 (IField namex FBool) {si = (IField name FBool) } item = item
  convert_s3 (IField namex FString) {si = (IField name FString) } item = item
  convert_s3 (IField namex FDateTime) {si = (IField name FDateTime) } item = item
  convert_s3 (IField namex (Fm2o  (NSInteger ns) ) ) {si = (IField name (Fm2o (NSInteger ns2))) } item = item
  convert_s3 (IField namex (Fm2o  (NSInt ns) ) ) {si = (IField name (Fm2o (NSInt ns2))) } item = item  
  convert_s3 (IField namex (Fm2o  (NSSeq ns) ) ) {si = (IField name (Fm2o (NSSeq ns2))) } item = item    
  convert_s3 (IField namex (Fm2o (NSCode ns)) ) {si = (IField name (Fm2o (NSCode ns2))) } item = item 
  convert_s3 (EField namex (NSInteger ns)) {si = (EField name (NSInteger ns2) ) } item = item
  convert_s3 (EField namex (NSInt ns)) {si = (EField name (NSInt ns2) ) } item = item  
  convert_s3 (EField namex (NSSeq ns)) {si = (EField name (NSSeq ns2) ) } item = item    
  convert_s3 (EField namex (NSCode ns)) {si = (EField name (NSCode ns2) ) } item = item
  convert_s3 sb {si = (y .|. z)} it = convert_s3 sb it
--  convert_s3 sb {si = (KeyName1 name y)} it = convert_s3 sb it
--  convert_s3 sb {si = (KeyName2 name y z)} it = convert_s3 sb it    

    
  convert_sL : (sb: Schema2 Key) -> (SchemaType2 si) -> (SchemaType2 sb)
  convert_sL (IField namex FBool) {si = (IField name FBool) } item = item
  convert_sL (IField namex FString) {si = (IField name FString) } item = item
  convert_sL (IField namex FDateTime) {si = (IField name FDateTime) } item = item  
  convert_sL (IField namex (Fm2o (NSInteger ns)) ) {si = (IField name (Fm2o (NSInteger ns2))) } item = item 
  convert_sL (IField namex (Fm2o (NSInt ns)) ) {si = (IField name (Fm2o (NSInt ns2))) } item = item   
  convert_sL (IField namex (Fm2o (NSSeq ns)) ) {si = (IField name (Fm2o (NSSeq ns2))) } item = item     
  convert_sL (IField namex (Fm2o (NSCode ns)) ) {si = (IField name (Fm2o (NSCode ns2))) } item = item  
  convert_sL (EField namex (NSInteger ns) ) {si = (EField name (NSInteger ns2) )} item = item
  convert_sL (EField namex (NSInt ns) ) {si = (EField name (NSInt ns2) )} item = item  
  convert_sL (EField namex (NSSeq ns) ) {si = (EField name (NSSeq ns2) )} item = item    
  convert_sL (EField namex (NSCode ns)) {si = (EField name (NSCode ns2)) } item = item  
--  convert_sL sb {si = (KeyName1 name y)} iR = convert_sL sb iR
--  convert_sL sb {si = (KeyName2 name y z)} (iL,iR) = convert_sL sb iR
  convert_sL sb {si = (y .|. z)} (iL,iR) = convert_sL sb iR

  convert_sR : (sb: Schema2 Key) -> (SchemaType2 si) -> (SchemaType2 sb)
  convert_sR (IField namex FBool) {si = (IField name FBool) } item = item
  convert_sR (IField namex FString) {si = (IField name FString) } item = item
  convert_sR (IField namex FDateTime) {si = (IField name FDateTime) } item = item  
  convert_sR (IField namex (Fm2o (NSInteger ns)  ) ) {si = (IField name (Fm2o (NSInteger ns2) )) } item = item 
  convert_sR (IField namex (Fm2o (NSInt ns)  ) ) {si = (IField name (Fm2o (NSInt ns2) )) } item = item   
  convert_sR (IField namex (Fm2o (NSCode ns)  ) ) {si = (IField name (Fm2o (NSCode ns2) )) } item = item   
  convert_sR (EField namex (NSInteger ns)  ) {si = (EField name (NSInteger ns2) ) } item = item
  convert_sR (EField namex (NSInt ns)  ) {si = (EField name (NSInt ns2) ) } item = item  
  convert_sR (EField namex (NSSeq ns)  ) {si = (EField name (NSSeq ns2) ) } item = item    
  convert_sR (EField namex (NSCode ns)  ) {si = (EField name (NSCode ns2) ) } item = item  
--  convert_sR sb {si = (KeyName1 name y)} iL = convert_sR sb iL
--  convert_sR sb {si = (KeyName2 name y z)} (iL,iR) = convert_sR sb iL
  convert_sR sb {si = (y .|. z)} (iL,iR) = convert_sR sb iL
      
  drop_col : (sb: Schema2 Key) -> (c:String) -> (SchemaType2 sk) -> (SchemaType2 sb )
  drop_col  sb c {sk= (y@(EField n1 ns1) .|. z@(EField n2 ns2 ) ) } item  = ret where 
    ret = case (c==n1) of
        True => convert_sL sb item
        False => case (c==n2) of
            True => convert_sR sb item
            False => convert_s3 sb item --(il,ir)

----------- schema

valItems : Schema2 Val
valItems = (IFieldAlg "qty" FTtermCarrier)

priceItems : Schema2 Val
priceItems = (IFieldAlg "price" FTtermCarrier)

subtotalItems : Schema2 Val
subtotalItems = (IFieldAlg "subtotal" FTtermCarrier)

Items_ModelSchema : ModelSchema
Items_ModelSchema = MkModelSchema keyItems valItems "items"

Pricelist_ModelSchema : ModelSchema
Pricelist_ModelSchema = MkModelSchema keyItems priceItems "pricelist"

Subtotal_ModelSchema : ModelSchema
Subtotal_ModelSchema = MkModelSchema keyItems subtotalItems "subtotal"

Total_ModelSchema : ModelSchema
Total_ModelSchema = MkModelSchema keyTotal subtotalItems "total"


public export
render_number_input : String -> Integer ->  String
render_number_input c_id val= printf """<input type="number" class="form-control" value="%d" id="%s">""" val c_id


namespace render_with_ids
  -- using td tags
  public export
  render_number_in_td_tag2 : String -> Integer -> String
  render_number_in_td_tag2 p_id v = printf   """<td id="%s" dataval="%d">%d</td>""" p_id v v

  --public export
  --render_number_in_td_tag2 : String -> Integer -> String
  --render_number_in_td_tag2 p_id v = printf   """<td id="%s" data-val="%d">%d</td>""" p_id v v

  public export
  render_text_in_td_tag2 : String -> String -> String
  render_text_in_td_tag2 p_id v   = printf   """<td id="%s" dataval="%s">%s</td>""" p_id v v
   
  public export
  render_tterm_in_td_tag2 : String -> Tterm -> String
  render_tterm_in_td_tag2 p_id v = printf """<td id="%s" datadr="%d" datacr="%d">%d</td>""" p_id (dr v) (cr v) (t2integer v)
  
  public export
  cell_id : String -> String -> String
  cell_id p_id name = p_id ++ "_"++name
  
  public export
  cell_input_id : String -> String -> String
  cell_input_id p_id name = (cell_id p_id name) ++ "_input_tag"
  
  public export
  renderDataWithSchema2 : String -> (SchemaType2 schema) -> List String
  renderDataWithSchema2 p_id {schema = (IField name FBool)}   True  = [render_text_in_td_tag2   (cell_id p_id name) "True"]
  renderDataWithSchema2 p_id {schema = (IField name FBool)}   False = [render_text_in_td_tag2   (cell_id p_id name) "False"]
  renderDataWithSchema2 p_id {schema = (IField name FString)} item  = [render_text_in_td_tag2   (cell_id p_id name) item]
  renderDataWithSchema2 p_id {schema = (IField name FDateTime)} item  = [render_number_in_td_tag2   (cell_id p_id name) (int2integer item)]    
  renderDataWithSchema2 p_id {schema = (IField name (Fm2o (NSInteger ns) ))} item  = [render_number_in_td_tag2   (cell_id p_id name) item]
  renderDataWithSchema2 p_id {schema = (IField name (Fm2o (NSInt ns) ))} item  = [render_number_in_td_tag2   (cell_id p_id name) (int2integer item)]  
  renderDataWithSchema2 p_id {schema = (IField name (Fm2o (NSSeq ns) ))} item  = [render_number_in_td_tag2   (cell_id p_id name) (int2integer item)]  
  
  renderDataWithSchema2 p_id {schema = (IField name (Fm2o (NSCode ns) ))} item  = [render_text_in_td_tag2   (cell_id p_id name) item]  
--  renderDataWithSchema2 p_id {schema = (IField name FTterm)}  item  = [render_tterm_in_td_tag2  (cell_id p_id name) item]
  renderDataWithSchema2 p_id {schema = (IFieldAlg name FTtermCarrier)}  item  = [render_tterm_in_td_tag2  (cell_id p_id name) item]
  renderDataWithSchema2 p_id {schema = (IFieldAlg name FIntCarrier)}  item  = [render_number_in_td_tag2  (cell_id p_id name) (int2integer item)]  
  renderDataWithSchema2 p_id {schema = (IFieldAlg name FOPcarrier)}  item  = [render_text_in_td_tag2  (cell_id p_id name) (show item)]    
  renderDataWithSchema2 p_id {schema = (EField name (NSInteger ns))}      item  = [render_number_in_td_tag2 (cell_id p_id name) item]
  renderDataWithSchema2 p_id {schema = (EField name (NSInt ns))}      item  = [render_number_in_td_tag2 (cell_id p_id name) (int2integer item)]  
  renderDataWithSchema2 p_id {schema = (EField name (NSSeq ns))}      item  = [render_number_in_td_tag2 (cell_id p_id name) (int2integer item)]  
  
  renderDataWithSchema2 p_id {schema = (EField name (NSCode ns))}      item  = [render_text_in_td_tag2 (cell_id p_id name) item]
    
  renderDataWithSchema2 p_id {schema = (y .|. z)} (iteml, itemr) = (renderDataWithSchema2 p_id iteml) ++ (renderDataWithSchema2 p_id itemr)
  renderDataWithSchema2 p_id {schema = (y .+. z)} (iteml, itemr) = (renderDataWithSchema2 p_id iteml) ++ (renderDataWithSchema2 p_id itemr)



namespace render_wo_ids
  -- using td tags
  public export
  render_number_in_td_tag2 : Integer -> String
  render_number_in_td_tag2 v = printf   """<td>%d</td>""" v

  --public export
  --render_number_in_td_tag2 : String -> Integer -> String
  --render_number_in_td_tag2 p_id v = printf   """<td id="%s" data-val="%d">%d</td>""" p_id v v

  public export
  render_text_in_td_tag2 : String -> String
  render_text_in_td_tag2 v   = printf   """<td>%s</td>""" v
   
  public export
  render_tterm_in_td_tag2 : Tterm -> String
  render_tterm_in_td_tag2 v = printf """<td>%d</td>""" (t2integer v)
    
  public export
  renderDataWithSchema2 : (SchemaType2 schema) -> List String
  renderDataWithSchema2 {schema = (IField name FBool)}   True  = [render_text_in_td_tag2 "True"]
  renderDataWithSchema2 {schema = (IField name FBool)}   False = [render_text_in_td_tag2 "False"]
  renderDataWithSchema2 {schema = (IField name FString)} item  = [render_text_in_td_tag2 item]
  renderDataWithSchema2 {schema = (IField name FDateTime)} item  = [render_number_in_td_tag2 (int2integer item)]  
  renderDataWithSchema2 {schema = (IField name (Fm2o (NSInteger ns) ))} item  = [render_number_in_td_tag2 item]
  renderDataWithSchema2 {schema = (IField name (Fm2o (NSInt ns) ))} item  = [render_number_in_td_tag2 (int2integer item)]  
  renderDataWithSchema2 {schema = (IField name (Fm2o (NSSeq ns) ))} item  = [render_number_in_td_tag2 (int2integer item)]    
  renderDataWithSchema2 {schema = (IField name (Fm2o (NSCode ns) ))} item  = [render_text_in_td_tag2 item]  
--  renderDataWithSchema2 {schema = (IField name FTterm)}  item  = [render_tterm_in_td_tag2 item]
  renderDataWithSchema2 {schema = (IFieldAlg name FTtermCarrier)}  item  = [render_tterm_in_td_tag2 item]
  renderDataWithSchema2 {schema = (IFieldAlg name FIntCarrier)}  item  = [render_number_in_td_tag2 (int2integer item)]
  renderDataWithSchema2 {schema = (IFieldAlg name FOPcarrier)}  item  = [render_text_in_td_tag2 (show item)]
  renderDataWithSchema2 {schema = (EField name (NSInteger ns) )}      item  = [render_number_in_td_tag2 item]
  renderDataWithSchema2 {schema = (EField name (NSInt ns) )}      item  = [render_number_in_td_tag2 (int2integer item)]  
  renderDataWithSchema2 {schema = (EField name (NSSeq ns) )}      item  = [render_number_in_td_tag2 (int2integer item)]    
  renderDataWithSchema2 {schema = (EField name (NSCode ns) )}      item  = [render_text_in_td_tag2 item]  
  renderDataWithSchema2 {schema = (y .|. z)} (iteml, itemr) = (renderDataWithSchema2 iteml) ++ (renderDataWithSchema2 itemr)
  renderDataWithSchema2 {schema = (y .+. z)} (iteml, itemr) = (renderDataWithSchema2 iteml) ++ (renderDataWithSchema2 itemr)
  
public export
get_cell_keys : String -> (s:Schema2 kv) -> List String
get_cell_keys p_id (IField name fd)  = [cell_id p_id name]
get_cell_keys p_id (IFieldAlg name fd)  = [cell_id p_id name]
get_cell_keys p_id (EField name ns)  = [cell_id p_id name]
get_cell_keys p_id (y .|. z)  = (get_cell_keys p_id y) ++ (get_cell_keys p_id z)
get_cell_keys p_id (y .+. z)  = (get_cell_keys p_id y) ++ (get_cell_keys p_id z)

public export
make_cells_editable : String -> (s:Schema2 kv) -> JS_IO ()
make_cells_editable p_id (IFieldAlg name FTtermCarrier)  = do
                   let _cell_id = cell_id p_id name
                   let _cell_input_id = cell_input_id p_id name
                   qty <- get_qty_int _cell_id
                   let qty_integer = (the Integer (cast qty))
                   let input_element = render_number_input _cell_input_id qty_integer
                   update_element_text (cell_id p_id name) ""
                   insert_beforeend _cell_id input_element
make_cells_editable p_id (IFieldAlg name FIntCarrier)  = do
                   let _cell_id = cell_id p_id name
                   let _cell_input_id = cell_input_id p_id name
                   qty <- get_qty_int _cell_id
                   --let qty_integer = (the Integer (cast qty))
                   let input_element = render_number_input _cell_input_id (int2integer qty)
                   update_element_text (cell_id p_id name) ""
                   insert_beforeend _cell_id input_element

make_cells_editable p_id (IField name fd)  = pure ()
make_cells_editable p_id (EField name fd)  = pure ()
make_cells_editable p_id (y .|. z)  = do 
                                    make_cells_editable p_id y
                                    make_cells_editable p_id z
make_cells_editable p_id (y .+. z)  = do 
                                    make_cells_editable p_id y
                                    make_cells_editable p_id z

public export
make_cells_ro : String -> (s:Schema2 kv) -> JS_IO ()
make_cells_ro p_id (IFieldAlg name FTtermCarrier)  = do
                   let _cell_id = cell_id p_id name
                   let _cell_input_id = cell_input_id p_id name
                   -- need to get into the input tag
                   qty <- get_qty_int_value2 _cell_input_id
                   let qty_string = (the String (cast qty))
                   update_element_text (cell_id p_id name) qty_string
make_cells_ro p_id (IFieldAlg name FIntCarrier)  = do
                   let _cell_id = cell_id p_id name
                   let _cell_input_id = cell_input_id p_id name
                   -- need to get into the input tag
                   qty <- get_qty_int_value2 _cell_input_id
                   let qty_string = (the String (cast qty))
                   update_element_text (cell_id p_id name) qty_string
                   
make_cells_ro p_id (IField name fd)  = pure ()
make_cells_ro p_id (EField name fd)  = pure ()
make_cells_ro p_id (y .|. z)  = do 
                                    make_cells_ro p_id y
                                    make_cells_ro p_id z



public export  -- read <td>%s</td> when cells are read-only
read_cells : String -> (s:Schema2 kv) -> JS_IO (SchemaType2 s)
read_cells p_id (IField name FBool) = do
                   let _cell_id = cell_id p_id name
                   v <- get_element_text _cell_id
                   pure (if (v=="True") then True else False)
read_cells p_id (IField name FString) = do
                   let _cell_id = cell_id p_id name                                      
                   v <- get_element_text _cell_id
                   pure v
read_cells p_id (IField name FDateTime) = do
                   let _cell_id = cell_id p_id name
                   qty <- get_qty_int _cell_id
                   pure qty
read_cells p_id (IFieldAlg name FTtermCarrier)  = do
                   let _cell_id = cell_id p_id name
                   qty <- get_qty_int _cell_id
                   let qty_integer = the Integer (cast qty)
                   pure (integer2t qty_integer)                   
read_cells p_id (IFieldAlg name FIntCarrier)  = do
                   let _cell_id = cell_id p_id name
                   qty <- get_qty_int _cell_id
                   pure qty
                   --let qty_integer = the Integer (cast qty)
                   --pure (integer2t qty_integer)                   
                   
read_cells p_id (EField name (NSInteger ns) )  = do
                   let _cell_id = cell_id p_id name
                   v <- get_qty_int _cell_id
                   let qty_integer = the Integer (cast v)                   
                   pure qty_integer
read_cells p_id (EField name (NSInt ns) )  = do
                   let _cell_id = cell_id p_id name
                   v <- get_qty_int _cell_id
                   pure v
read_cells p_id (EField name (NSSeq ns) )  = do
                   let _cell_id = cell_id p_id name
                   v <- get_qty_int _cell_id
                   pure v
                   --let qty_integer = the Integer (cast v)                   
                   --pure qty_integer
read_cells p_id (EField name (NSCode ns) )  = do
                   let _cell_id = cell_id p_id name
                   v <- get_element_text _cell_id
                   --let qty_integer = the Integer (cast v)                   
                   pure v
                   
read_cells p_id (y .|. z)  =  do
                   r_y <- read_cells p_id y
                   r_z <- read_cells p_id z
                   pure (r_y,r_z)

public export
read_cells_row : List String -> (s:Schema2 kv) -> JS_IO (List (SchemaType2 s))
read_cells_row [] s = pure []
read_cells_row (x :: xs) s_kv = do
       row <- read_cells x s_kv
       ret <- read_cells_row xs s_kv
       pure ([row] ++ ret)

public export
read_cells_attr : String -> (s:Schema2 kv) -> JS_IO (SchemaType2 s)
read_cells_attr p_id (IField name FBool) = do
                   let _cell_id = cell_id p_id name
                   v <- get_text_dataval _cell_id
                   pure (if (v=="True") then True else False)
read_cells_attr p_id (IField name FString) = do
                   let _cell_id = cell_id p_id name                                      
                   v <- get_text_dataval _cell_id
                   pure v
                   
read_cells_attr p_id (IFieldAlg name FTtermCarrier)  = do
                   let _cell_input_id = cell_id p_id name
                   dr <- get_qty_int_datadr _cell_input_id
                   cr <- get_qty_int_datacr _cell_input_id 
                   let dr_integer = the Integer (cast dr)
                   let cr_integer = the Integer (cast cr)
                   pure (Tt dr_integer cr_integer)
                   
read_cells_attr p_id (IFieldAlg name FIntCarrier)  = do
                   let _cell_input_id = cell_id p_id name
                   dr <- get_qty_int_datadr _cell_input_id
                   --cr <- get_qty_int_datacr _cell_input_id 
                   --let dr_integer = the Integer (cast dr)
                   --let cr_integer = the Integer (cast cr)
                   --pure (Tt dr_integer cr_integer)
                   pure dr
read_cells_attr p_id (IField name FDateTime)  = do
                   let _cell_input_id = cell_id p_id name
                   dr <- get_qty_int_datadr _cell_input_id
                   --cr <- get_qty_int_datacr _cell_input_id 
                   --let dr_integer = the Integer (cast dr)
                   --let cr_integer = the Integer (cast cr)
                   --pure (Tt dr_integer cr_integer)
                   pure dr
                   
read_cells_attr p_id (EField name (NSInteger ns) )  = do
                   let _cell_id = cell_id p_id name
                   v <- get_qty_int_dataval _cell_id
                   let qty_integer = the Integer (cast v)                   
                   pure qty_integer
read_cells_attr p_id (EField name (NSInt ns) )  = do
                   let _cell_id = cell_id p_id name
                   v <- get_qty_int_dataval _cell_id
                   pure v
read_cells_attr p_id (EField name (NSSeq ns) )  = do
                   let _cell_id = cell_id p_id name
                   v <- get_qty_int_dataval _cell_id
                   pure v
                   --let qty_integer = the Integer (cast v)                   
                   --pure qty_integer
                   
read_cells_attr p_id (EField name (NSCode ns) )  = do
                   let _cell_id = cell_id p_id name
                   v <- get_text_dataval _cell_id
                   pure v
                   
read_cells_attr p_id (y .|. z)  =  do
                   r_y <- read_cells_attr p_id y
                   r_z <- read_cells_attr p_id z
                   pure (r_y,r_z)
read_cells_attr p_id (y .+. z)  =  do
                   r_y <- read_cells_attr p_id y
                   r_z <- read_cells_attr p_id z
                   pure (r_y,r_z)

public export
read_cells_attr_row : List String -> (s:Schema2 kv) -> JS_IO (List (SchemaType2 s))
read_cells_attr_row [] s = pure []
read_cells_attr_row (x :: xs) s_kv = do
       row <- read_cells_attr x s_kv
       ret <- read_cells_attr_row xs s_kv
       pure ([row] ++ ret)

public export
set_cells_attr : String -> (SchemaType2 schema) -> JS_IO ()
set_cells_attr p_id {schema=(IField name FBool)} True= do
                   let _cell_id = cell_id p_id name
                   set_text_dataval _cell_id "True"
                   
set_cells_attr p_id {schema=(IField name FBool)} False= do
                   let _cell_id = cell_id p_id name
                   set_text_dataval _cell_id "False"
                   
set_cells_attr p_id {schema=(IField name FString)} item = do
                   let _cell_id = cell_id p_id name
                   set_text_dataval _cell_id item
set_cells_attr p_id {schema=(IFieldAlg name FTtermCarrier)} item= do
                   let _cell_id = cell_id p_id name
                   set_qty_int_datadr _cell_id (integer_to_int (dr item))
                   set_qty_int_datacr _cell_id (integer_to_int (cr item))
                   
set_cells_attr p_id {schema=(IFieldAlg name FIntCarrier)} item= do
                   let _cell_id = cell_id p_id name
                   set_qty_int_datadr _cell_id item --(integer_to_int (dr item))
                   --set_qty_int_datacr _cell_id (integer_to_int (cr item))
set_cells_attr p_id {schema=(IField name FDateTime)} item= do
                   let _cell_id = cell_id p_id name
                   set_qty_int_datadr _cell_id item --(integer_to_int (dr item))
                   
set_cells_attr p_id {schema=(EField name (NSInteger ns) )} item = do
                   let _cell_id = cell_id p_id name
                   set_qty_int_dataval _cell_id (integer_to_int item)
set_cells_attr p_id {schema=(EField name (NSInt ns) )} item = do
                   let _cell_id = cell_id p_id name
                   set_qty_int_dataval _cell_id ( item)
set_cells_attr p_id {schema=(EField name (NSSeq ns) )} item = do
                   let _cell_id = cell_id p_id name
                   set_qty_int_dataval _cell_id ( item)

                                      
set_cells_attr p_id {schema=(EField name (NSCode ns) )} item = do
                   let _cell_id = cell_id p_id name
                   set_text_dataval _cell_id item --(integer_to_int item)
                   
set_cells_attr p_id {schema=(y .|. z)} (il,ir) = do
                   set_cells_attr p_id il
                   set_cells_attr p_id ir
                   
set_cells_attr p_id {schema=(y .+. z)} (il,ir) = do
                   set_cells_attr p_id il
                   set_cells_attr p_id ir

--public export
--set_cells_attr_row : List String, (SchemaType2 schema) -> JS_IO ()
--set_cells_attr_row []  = pure ()
--set_cells_attr_row (x :: xs) s_kv = do
          

public export
update_cells_td : String -> (SchemaType2 schema) -> JS_IO ()
update_cells_td p_id {schema=(IField name FBool)} True= do
                   let _cell_id = cell_id p_id name
                   update_element_text _cell_id "True"
update_cells_td p_id {schema=(IField name FBool)} False= do
                   let _cell_id = cell_id p_id name
                   update_element_text _cell_id "False"
update_cells_td p_id {schema=(IField name FString)} item = do
                   let _cell_id = cell_id p_id name
                   update_element_text _cell_id item
update_cells_td p_id {schema=(IFieldAlg name FTtermCarrier)} item= do
                   let _cell_id = cell_id p_id name
                   update_element_text _cell_id (printf "%d" (t2integer item))
                   
update_cells_td p_id {schema=(IFieldAlg name FIntCarrier)} item= do
                   let _cell_id = cell_id p_id name
                   update_element_text _cell_id (printf "%d" (int2integer item))
update_cells_td p_id {schema=(IField name FDateTime)} item= do
                   let _cell_id = cell_id p_id name
                   update_element_text _cell_id (printf "%d" (int2integer item))

update_cells_td p_id {schema=(EField name (NSInteger ns) )} item = do
                   let _cell_id = cell_id p_id name
                   set_qty_int_dataval p_id (integer_to_int item)
update_cells_td p_id {schema=(EField name (NSInt ns) )} item = do
                   let _cell_id = cell_id p_id name
                   set_qty_int_dataval p_id item
update_cells_td p_id {schema=(EField name (NSSeq ns) )} item = do
                   let _cell_id = cell_id p_id name
                   set_qty_int_dataval p_id item

update_cells_td p_id {schema=(y .|. z)} (il,ir) = do
                   set_cells_attr p_id il
                   set_cells_attr p_id ir
update_cells_td p_id {schema=(y .+. z)} (il,ir) = do
                   set_cells_attr p_id il
                   set_cells_attr p_id ir

public export
update_cells : String -> (SchemaType2 schema) -> JS_IO ()
update_cells p_id item = do
                   update_cells_td p_id item
                   set_cells_attr  p_id item



-------------------- render
public export
schema2thead2 : Schema2 kv-> String
schema2thead2 sch = ret where
  schema2th : Schema2 kv -> List String
  schema2th (IField name FBool)  =  [printf "<th>%s</th>" name ]
  schema2th (IField name FString) = [printf "<th>%s</th>" name ]
  schema2th (IField name (Fm2o rel)) = [printf "<th>%s</th>" name ]  
--  schema2th (IField name FTterm ) = [printf "<th>%s</th>" name ]     --SchemaType2 (IField name FTterm ) = Tterm
  schema2th (IFieldAlg name FTtermCarrier ) = [printf "<th>%s</th>" name ]     --SchemaType2 (IField name FTterm ) = Tterm  
  schema2th (IFieldAlg name FIntCarrier ) = [printf "<th>%s</th>" name ] 
  schema2th (IField name FDateTime ) = [printf "<th>%s</th>" name ]   
  schema2th (IFieldAlg name FOPcarrier ) = [printf "<th>%s</th>" name ]
  schema2th (EField name (NSInteger ns) ) = [printf "<th>%s[%s]</th>" name ns]
  schema2th (EField name (NSInt ns) ) = [printf "<th>%s[%s]</th>" name ns]  
  schema2th (EField name (NSSeq ns) ) = [printf "<th>%s[%s]</th>" name ns]  
  schema2th (EField name (NSCode ns) ) = [printf "<th>%s[%s]</th>" name ns]
  schema2th (s1 .|. s2) = (schema2th s1) ++ (schema2th s2)
  schema2th (s1 .+. s2) = (schema2th s1) ++ (schema2th s2)
  ths : String
  ths = concat $ schema2th sch
  ret = printf "%s" ths



public export
renderDataAsKey : (SchemaType2 schema) -> String
renderDataAsKey {schema = (IField name FBool)}   True = "True"
renderDataAsKey {schema = (IField name FBool)}   False = "False"
renderDataAsKey {schema = (IField name FString)} item = item
renderDataAsKey {schema = (IField name (Fm2o (NSInteger ns)) )} item = the String (cast item)
renderDataAsKey {schema = (IField name (Fm2o (NSInt ns)) )} item = the String (cast item)
renderDataAsKey {schema = (IField name (Fm2o (NSSeq ns)) )} item = the String (cast item)
renderDataAsKey {schema = (IField name (Fm2o (NSCode ns)) )} item = item
--renderDataAsKey {schema = (IField name FTterm)}  item = the String (cast (t2integer item))
renderDataAsKey {schema = (IFieldAlg name FTtermCarrier)}  item = the String (cast (t2integer item))
renderDataAsKey {schema = (IFieldAlg name FIntCarrier)}  item = the String (cast item)
renderDataAsKey {schema = (IField name FDateTime)}  item = the String (cast item)
renderDataAsKey {schema = (IFieldAlg name FOPcarrier)}  item = show item
renderDataAsKey {schema = (EField name (NSInteger ns) )}      item = the String (cast item)
renderDataAsKey {schema = (EField name (NSInt ns) )}      item = the String (cast item)
renderDataAsKey {schema = (EField name (NSSeq ns) )}      item = the String (cast item)
renderDataAsKey {schema = (EField name (NSCode ns))}      item = item
renderDataAsKey {schema = (y .|. z)} (iteml, itemr) = (renderDataAsKey iteml) ++ (renderDataAsKey itemr)

public export
runjsio : (ty) -> List (JS_IO ty) -> JS_IO ty
runjsio ty [] = pure ty
runjsio ty (x::xs) = do
   ret <- x
   runjsio ty xs
   pure ret
   
  
namespace tab_widget
   public export
   id_att_format : String
   id_att_format = """ id="%s" """
   
   public export
   id_att : String -> String
   id_att x = printf id_att_format x
   
   public export
   _composite : String
   _composite = """
          <div id="%s" class="sticky-top">
	  </div>   
   """

   public export
   _amendments : String
   _amendments = """
          <div id="%s">
	  </div>   
   """
   
         
   public export
   _tf : String
   _tf = """
            <!-- Content Edit Table -->
            <div class="card border-dark  mt-3">
              <div class="card-header">
              <h4>%s</h4>
              </div>
            <div class="card-body">
              <table class="customers">
                <thead>
                    %s
                </thead>
                <tbody %s>
                </tbody>
              </table>
            </div>

            <div class="card_footer" %s>
            <div/>
              
            </div>
          </div>  <!-- /.card -->
            """
            
   public export
   _tf_wo_ids : String
   _tf_wo_ids = """
            <!-- Content Amendments -->
            <div class="card border-dark  mt-3">
              <div class="card-header">
              <h4>%s</h4>
              </div>
            <div class="card-body">
              <table class="customers">
                <thead>
                    %s
                </thead>
                <tbody>
                    %s
                </tbody>
              </table>
            </div>

            </div>
          </div>  <!-- /.card -->
            """
            
            
   public export            
   _button : String
   _button = """
             <button class="btn btn-primary" id="%s">%s</button>
         """  -- _button_id label
   public export
   get_composite_id_mdl_name : String -> String -> String  --parent_id, ModelDataList name
   get_composite_id_mdl_name p_id mdl_name = (p_id ++ "__composite__" ++ mdl_name)
         
   public export 
   get_composite_id : String -> (m:ModelSchema) -> (ModelDataList m) -> String
   get_composite_id p_id m y = get_composite_id_mdl_name p_id (name y) --(p_id ++ "__composite__" ++ (name y))

   public export
   get_table_id : String ->  String  --this is to reference the table body
   get_table_id p_id  = ( p_id  ++ "__table" )

   public export
   get_card_footer_id : String -> String
   get_card_footer_id p_id = p_id ++ "__card_footer"
   
   public export
   get_edit_button_id : String -> String
   get_edit_button_id p_id = p_id ++ "__edit_button"

   public export
   get_commit_button_id : String -> String
   get_commit_button_id p_id = p_id ++ "__commit_button"      

   public export
   get_whs_route_button_id : String -> String
   get_whs_route_button_id p_id = p_id ++ "__commit_whs_route"      

   public export
   get_whs_done_button_id : String -> String
   get_whs_done_button_id p_id = p_id ++ "__commit_whs_done"    

   public export
   get_row_id : String -> (SchemaType2 schema) -> String
   get_row_id p_id  item = p_id++ "_row"++(renderDataAsKey item)

   public export
   update_cells_ke1 : String -> (sv:Schema2 Val) -> (SchemaType2 sv) -> JS_IO ()
   update_cells_ke1 rid sv x_val = do
          current <- read_cells rid sv
          update_cells rid (addSchema2Vals current x_val)
          
   public export  -- with ids
   insert_rows2 : String -> (m:ModelSchema) -> (ModelDataList m) -> JS_IO ()
   insert_rows2 p_id m mdl = do
      
      let muf = do
          x <- (zip (keyL mdl) (valL mdl))
          let x_key = (fst x)
          let x_val = (snd x)
          let rid = (get_row_id p_id x_key)
          let k =  concat (render_with_ids.renderDataWithSchema2 rid x_key)
          let v =  concat (render_with_ids.renderDataWithSchema2 rid x_val)
          let row = printf "<tr id=%s>%s %s</tr>" rid k v
          let ret = do
                     ke <- key_exist rid
                     if (ke==1) then update_cells_ke1 rid (val m) x_val
                                else insert_beforeend p_id row
          pure ret
      runjsio () muf

   public export  -- wo ids
   render_rows_wo_ids : (m:ModelSchema) -> ModelDataList m -> String
   render_rows_wo_ids m mdl 
     = let row_k = [ concat (render_wo_ids.renderDataWithSchema2 x)  | x <-(keyL mdl)]
           row_v = [ concat (render_wo_ids.renderDataWithSchema2 x)  | x <-(valL mdl)]
           rows_zip = zip row_k row_v
           ret = concat [ (printf "<tr> %s %s </tr>" k v) | (k,v) <- rows_zip] in
        ret
        
   public export
   _read_cells : (s:Schema2 Key) -> List String -> JS_IO (Maybe (List (SchemaType2 s)) )
   _read_cells s [] = pure Nothing
   _read_cells s (p_id::xs) = do
              c <- read_cells p_id s
              ret <- _read_cells s xs
              case ret of
                  Nothing => pure (Just [c])
                  (Just x) => pure (Just ([c]++x))
   public export
   get_table_row_ids: String -> List String -> JS_IO (List String)
   get_table_row_ids table_id [] = do
      r_id <- firstElementChild table_id
      get_table_row_ids table_id [r_id]
      
   get_table_row_ids table_id (x::xs) = do
      r_id <- nextElementSibling x
      if (r_id=="") then
         pure ( reverse ([x]++xs) )
      else
         get_table_row_ids table_id ([r_id,x]++xs)
   
   public export
   on_table_edit: String -> (m:ModelSchema) -> ModelDataList m -> JS_IO ()
   on_table_edit parent_tag_id m mdl = do
      let _composite_id = get_composite_id parent_tag_id m mdl
      let _composite_table_id = get_table_id _composite_id      
      row_ids <- get_table_row_ids _composite_table_id []
            
      let row_k =   [ get_cell_keys x (key m) | x <- row_ids]
      let row_v =   [ get_cell_keys x (val m) | x <- row_ids]
      runjsio () [ make_cells_editable x (val m) | x <- row_ids]
      toggle_hide_show_element (get_edit_button_id _composite_id)
      toggle_hide_show_element (get_commit_button_id _composite_id)
      
   public export
   insert_table_wo_ids : String -> (m:ModelSchema) -> ModelDataList m -> JS_IO ()
   insert_table_wo_ids p_id m mdl = do
      let x = render_rows_wo_ids m mdl
      let head_m = printf "<tr>%s %s</tr>" (schema2thead2 (key m)) (schema2thead2 (val m))
      let th_html = printf _tf_wo_ids (name mdl) head_m x
--      insert_beforeend p_id th_html
      insert_afterbegin p_id th_html
      
   public export  --main init
   table_amendments : String -> String -> (m:ModelSchema) -> ModelDataList m -> JS_IO ()
   table_amendments title parent_tag_id m mdl = do
   
      -- Amendments
      let _amendments_id = parent_tag_id --get_amendments_id parent_tag_id m mdl      
--      let _amendments_html = ( printf _amendments _amendments_id )
--      insert_beforeend parent_tag_id _amendments_html
--      insert_beforeend _amendments_id (printf "<h2>%s</h2>" title)
--      insert_afterbegin parent_tag_id _amendments_html

      insert_table_wo_ids _amendments_id m mdl      
      insert_afterbegin _amendments_id (printf "<h4>%s</h4>" title)
                          

   public export
   convert_2sub : (sb: Schema2 Val) -> (SchemaType2 si) -> (SchemaType2 sb)
   convert_2sub (IFieldAlg namex FTtermCarrier) {si = (IFieldAlg name FTtermCarrier) } item = item
   convert_2sub (IFieldAlg namex FIntCarrier) {si = (IFieldAlg name FIntCarrier) } item = item   
   convert_2sub sb {si = (y .|. z)} it = convert_2sub sb it --(convert_items2sub sb it1, convert_items2sub sb it2)

   public export
   insert_table : String -> String -> (m:ModelSchema) -> ModelDataList m -> JS_IO ()
   insert_table _composite_id _footer_id m mdl = do

      let _composite_table_id = get_table_id _composite_id
      let head_m = printf "<tr>%s %s</tr>" (schema2thead2 (key m)) (schema2thead2 (val m))
      
      let _th_html = printf _tf (name mdl) head_m (id_att _composite_table_id ) (_footer_id)
      insert_beforeend _composite_id _th_html  --(table_card table_composite_id THeader) 
      insert_rows2 _composite_table_id m mdl

   public export
   insert_rows_x : String -> (m:ModelSchema) -> ModelDataList m -> JS_IO ()
   insert_rows_x parent_tag_id m mdl = do   
      let _composite_id = get_composite_id parent_tag_id m mdl
      let _composite_table_id = get_table_id _composite_id
      insert_rows2 _composite_table_id m mdl
      
      tab_widget.table_amendments (printf "Amendment:%s" parent_tag_id) "amendments" m mdl
      
   public export
   insert_rows_calc : String -> (m:ModelSchema ) -> ModelDataList m -> JS_IO ()
   insert_rows_calc parent_tag_id m mdl = do   
      let _composite_id = get_composite_id parent_tag_id m mdl
      let _composite_table_id = get_table_id _composite_id
      insert_rows2 _composite_table_id m mdl
      
      tab_widget.table_amendments (printf "Calculation:%s" parent_tag_id) "amendments_calc" m mdl
      

   calc_order_t : String -> String -> (m_sub:ModelSchema ) -> (t_sub:ModelSchema ) -> JS_IO ()
   calc_order_t sub_id tot_id m_sub m_t = do
      let subtotal_id = get_table_id (get_composite_id_mdl_name sub_id "subtotal")  --tag id , mdl
      let t_id = get_table_id (get_composite_id_mdl_name tot_id "order_total")
      
      subtotal_ids <- get_table_row_ids subtotal_id []
      t_ids <-get_table_row_ids t_id []
      
      subtotal_k <- read_cells_row subtotal_ids (key m_sub)
      subtotal_v <- read_cells_attr_row subtotal_ids (val m_sub)
      
      t_k <- read_cells_row t_ids (key m_t)
      t_v <- read_cells_attr_row t_ids (val m_t)
      
      let xx = [ (drop_col (key m_t) "sku" i) | i <- subtotal_k]
      
      let t_inv = [ (invSchema2 av) | av <- t_v ]
      
      let ss = [ convert_2sub (val m_t) s | s <- subtotal_v ]
      
      let amend = MkMDList "order_total" (t_k ++ xx )
                                         (t_inv ++  ss)
      
      insert_rows_calc tot_id m_t amend
      
      pure ()      
                  
   public export 
   calc_order_subtotals : String -> String -> String -> (m_items:ModelSchema ) -> (m_price:ModelSchema ) -> (m_sub:ModelSchema ) -> JS_IO ()
   calc_order_subtotals items_id sub_id tot_id m_items m_price m_sub = do
      let order1_id = get_table_id (get_composite_id_mdl_name items_id "items")   -- tag id, mdl order1
      let pricelist_id = get_table_id (get_composite_id_mdl_name "pricelist" "pricelist")
      let subtotal_id = get_table_id (get_composite_id_mdl_name sub_id "subtotal")  -- subtotal
      -- tot_id "order_total"
      items_ids <- get_table_row_ids order1_id []
      pricelist_ids <- get_table_row_ids pricelist_id []
      subtotal_ids <- get_table_row_ids subtotal_id []    
      
      console_log $ show items_ids
      console_log $ show pricelist_ids
            
      items_k <- read_cells_row items_ids (key m_items)
      items_v <- read_cells_attr_row items_ids (val m_items)
      
      pricelist_k <- read_cells_row pricelist_ids (key m_price)
      pricelist_v <- read_cells_attr_row pricelist_ids (val m_price)
      
      let i_s = [ convert_2sub (val m_sub) i | i <- items_v ]
      let p_s = [ convert_2sub (val m_sub) i | i <- pricelist_v ]     
            
      let qty_price = [ x | x <- zip i_s p_s]
      
      let new_sub = [ (mulSchema2Vals (fst x) (snd x)) | x <- qty_price ]
      
      console_log $ show (length new_sub)
      
      subtotal_k <- read_cells_row subtotal_ids (key m_sub)
      subtotal_v <- read_cells_attr_row subtotal_ids (val m_sub)
      let subtotal_inv = [ (invSchema2 av) | av <- subtotal_v ]
      
      let amend = MkMDList "subtotal" (subtotal_k ++ subtotal_k )
                                      (subtotal_inv ++ new_sub )
      
      insert_rows_calc sub_id m_sub amend
      
      calc_order_t sub_id tot_id Subtotal_ModelSchema Total_ModelSchema
      pure ()

   public export
   on_table_commit: String -> (m:ModelSchema) -> ModelDataList m -> JS_IO ()
   on_table_commit parent_tag_id m mdl = do
      let _composite_id = get_composite_id parent_tag_id m mdl
--      let _amendments_id = get_amendments_id parent_tag_id m mdl            
      let _composite_table_id = get_table_id _composite_id      
                        
      toggle_hide_show_element (get_edit_button_id _composite_id)
      toggle_hide_show_element (get_commit_button_id _composite_id)
--      toggle_hide_show_element (get_whs_route_button_id _composite_id)
            
      row_ids <- get_table_row_ids _composite_table_id []
      --_cells_ro (val m) row_ids
      runjsio () [make_cells_ro x (val m) | x <- row_ids]

      row_cells_k <- read_cells_row row_ids (key m)
      row_cells_v <- read_cells_row row_ids (val m)
      row_cells_attr_v <- read_cells_attr_row row_ids (val m)
      let zero_v = (schema2ZeroVal (val m))
      
      let upd = do
          x <- zip row_cells_v row_ids
          let u = set_cells_attr (snd x) (fst x)
          pure u
      runjsio () upd
      let df = [ addSchema2Vals v (invSchema2 av)|  (v,av) <- zip row_cells_v row_cells_attr_v]
      let df2 = [x | x <- zip row_ids df]      
      let df3 = [ x | x <- df2 , not (eqSchema2 (snd x) zero_v) ]      
      let (df3k, df3v) = unzip df3
      
      rowk <- read_cells_row df3k (key m)            
                    
      let amend = MkMDList (name mdl) rowk df3v
      if (length df3v) > 0 then
         --insert_table_wo_ids _amendments_id m amend
         table_amendments (printf "Amendment:%s" parent_tag_id) "amendments" m amend   --1
      else
         pure ()

      calc_order_subtotals "order1" "subtotal" "order_total" Items_ModelSchema Pricelist_ModelSchema Subtotal_ModelSchema
      
   public export  --main init
   table_composite : Bool -> String -> String -> (m:ModelSchema ) -> ModelDataList m -> JS_IO ()
   table_composite show_edit title parent_tag_id m mdl = do
      
      -- Composite
      let _composite_id = get_composite_id parent_tag_id m mdl      
      let _composite_html = ( printf _composite _composite_id )      
      insert_beforeend parent_tag_id _composite_html
      insert_beforeend _composite_id (printf "<h4>%s</h4>" title)

      let _edit_button =    get_edit_button_id _composite_id
      let _commit_button =  get_commit_button_id _composite_id      
            
      let _footer_id = get_card_footer_id _composite_id       
      
      insert_table _composite_id (id_att _footer_id) m mdl                 

      if show_edit then
        ( (insert_beforeend _footer_id (printf _button _edit_button "Edit")) >>
          (insert_beforeend _footer_id (printf _button _commit_button "Commit")) >>
          (onClick ("#" ++ _edit_button) (on_table_edit parent_tag_id m mdl)) >> 
          (onClick ("#" ++ _commit_button) (on_table_commit parent_tag_id m mdl)) >>
          (toggle_hide_show_element (_commit_button)) )
      else
         pure ()

   public export
   on_set_backorders: String -> (m:ModelSchema ) -> ModelDataList m -> JS_IO ()
   on_set_backorders parent_tag_id m mdl = do
      -- backorders      
      let whsb_tab_id = get_table_id (get_composite_id "warehouse_backorders" m mdl)
      whsb_row_ids <- get_table_row_ids whsb_tab_id []
      
      whsb_row_cells_k <- read_cells_row whsb_row_ids (key m)
      whsb_row_cells_attr_v <- read_cells_attr_row whsb_row_ids (val m)
      let whsb_inv = [ (invSchema2 av) | av <- whsb_row_cells_attr_v ] 

      -- read whs 
      let whs2_tab_id = get_table_id (get_composite_id "warehouse" m mdl)
      whs2_row_ids <- get_table_row_ids whs2_tab_id []
      
      whs2_row_cells_k <- read_cells_row whs2_row_ids (key m)
      whs2_row_cells_attr_v <- read_cells_attr_row whs2_row_ids (val m)
      let whs2_inv = [ (invSchema2 av) | av <- whs2_row_cells_attr_v ] 

      -- read whs done
      let whs3_tab_id = get_table_id (get_composite_id "warehouse_done" m mdl)
      whs3_row_ids <- get_table_row_ids whs3_tab_id []
      
      whs3_row_cells_k <- read_cells_row whs3_row_ids (key m)
      whs3_row_cells_attr_v <- read_cells_attr_row whs3_row_ids (val m)
      
      let whs3_inv = [ (invSchema2 av) | av <- whs3_row_cells_attr_v ] 

      --let amendb = MkMDList (name mdl) ( whsb_row_cells_k      ++ whs2_row_cells_k       ++ whs3_row_cells_k)  
      --                                 ( whsb_row_cells_attr_v ++ whs2_inv  ++ whs3_row_cells_attr_v)
                                       
      let amendb = MkMDList (name mdl) ( whsb_row_cells_k   ++ whs2_row_cells_k       ++ whs3_row_cells_k  )  
                                       ( whsb_inv    ++ whs2_row_cells_attr_v ++ whs3_inv)
                                       
      insert_rows_calc "warehouse_backorders" m amendb
            
      pure ()

   public export
   on_table_set_whs_route: String -> (m:ModelSchema ) -> ModelDataList m -> JS_IO ()
   on_table_set_whs_route parent_tag_id m mdl = do
      let _composite_id = get_composite_id parent_tag_id m mdl
--      let _amendments_id = get_amendments_id parent_tag_id m mdl            
      let _composite_table_id = get_table_id _composite_id      
      console_log "updating whs route"
      row_ids <- get_table_row_ids _composite_table_id []
      
      row_cells_k <- read_cells_row row_ids (key m)
      row_cells_attr_v <- read_cells_attr_row row_ids (val m)      
      --let order_items = MkMDList (name mdl) row_cells_k row_cells_attr_v
                  
      let whs_tab_id = get_table_id (get_composite_id "warehouse" m mdl)
      whs_row_ids <- get_table_row_ids whs_tab_id []
      
      whs_row_cells_k <- read_cells_row whs_row_ids (key m)
      whs_row_cells_attr_v <- read_cells_attr_row whs_row_ids (val m)
      
--      let current_whs_route = MkMDList (name mdl) whs_row_cells_k whs_row_cells_attr_v
      let whs_inv = [ (invSchema2 av) | av <- whs_row_cells_attr_v ]
      
      let amend = MkMDList (name mdl) (row_cells_k ++ whs_row_cells_k)  (row_cells_attr_v ++ whs_inv )

      insert_rows_calc "warehouse" m amend
      on_set_backorders parent_tag_id m mdl

   public export
   on_table_whs_done: String -> (m:ModelSchema ) -> ModelDataList  m -> JS_IO ()
   on_table_whs_done parent_tag_id m mdl = do
      let _composite_id = get_composite_id parent_tag_id m mdl
--      let _amendments_id = get_amendments_id parent_tag_id m mdl            
      let _composite_table_id = get_table_id _composite_id      
      console_log "updating whs done"
  
      on_set_backorders parent_tag_id m mdl 
      calc_order_subtotals "warehouse_done" "invoice_subtotal" "invoice_total" Items_ModelSchema Pricelist_ModelSchema Subtotal_ModelSchema     
    

   public export
   add_whs_button : String -> (m:ModelSchema ) -> ModelDataList m -> JS_IO ()
   add_whs_button parent_tag_id m mdl = do
      let _composite_id = get_composite_id parent_tag_id m mdl      
      let _footer_id = get_card_footer_id _composite_id
      let _whs_route_button = get_whs_route_button_id _composite_id      
      insert_beforeend _footer_id (printf _button _whs_route_button "Update Whs")      
      
      onClick ("#" ++ _whs_route_button) (on_table_set_whs_route parent_tag_id m mdl)
      
   
   public export
   add_whs_done_button : String -> (m:ModelSchema ) -> ModelDataList m -> JS_IO ()
   add_whs_done_button parent_tag_id m mdl = do
      let _composite_id = get_composite_id parent_tag_id m mdl      
      let _footer_id = get_card_footer_id _composite_id
      let _whs_done_button = get_whs_done_button_id _composite_id      
      insert_beforeend _footer_id (printf _button _whs_done_button "Done & Invoice")      
      
      onClick ("#" ++ _whs_done_button) (on_table_whs_done parent_tag_id m mdl)

-- Local Variables:
-- idris-load-packages: ("contrib")
-- End:
