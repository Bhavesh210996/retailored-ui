import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { useState } from "react";

const EditOrderDialog = (props) => {
    const [isMaximized, setIsMaximized] = useState(true);
    
    const {
        editOrderDetailDialogVisible,
        setEditOrderDetailDialogVisible,
        selectedOrderDetail,
        setSelectedOrderDetail,
        isSavingDetails,
        handleUpdateOrderDetail,
    } = props;

    return(
        <Dialog 
            header="Edit Order Details"
            visible={editOrderDetailDialogVisible}
            onHide={() => setEditOrderDetailDialogVisible(false)}
            maximized={isMaximized}
            onMaximize={(e) => setIsMaximized(e.maximized)}
            className={isMaximized ? 'maximized-dialog' : ''}
            blockScroll
            footer={
              <div>
                <Button 
                  label="Update" 
                  icon="pi pi-check" 
                  onClick={handleUpdateOrderDetail}
                  autoFocus 
                  className="w-full"
                  loading={isSavingDetails} 
                  disabled={isSavingDetails}
                />
              </div>
            }
        >
            {selectedOrderDetail && (
              <div className="p-fluid my-4">
                <div className="field">
                  <label htmlFor="trialDate">Trial Date</label>
                  <Calendar
                    id="trialDate"
                    value={selectedOrderDetail?.trial_date ? new Date(selectedOrderDetail.trial_date) : null}
                    onChange={(e) => {
                      if (!selectedOrderDetail) return;
                      setSelectedOrderDetail({
                        ...selectedOrderDetail,
                        trial_date: e.value ? e.value.toISOString() : null
                      });
                    }}
                    dateFormat="dd/mm/yy"
                    showTime
                    hourFormat="12"
                    showIcon
                    placeholder="Select Trial Date & Time"
                    minDate={new Date()}
                  />
                </div>
    
                <div className="field">
                  <label htmlFor="deliveryDate">Delivery Date</label>
                  <Calendar 
                    id="deliveryDate"
                    value={selectedOrderDetail?.delivery_date ? new Date(selectedOrderDetail.delivery_date) : null}
                    onChange={(e) => {
                      if (!selectedOrderDetail) return;
                      setSelectedOrderDetail({
                        ...selectedOrderDetail,
                        delivery_date: e.value ? e.value.toISOString() : null
                      });
                    }}
                    dateFormat="dd/mm/yy"
                    showTime
                    hourFormat="12"
                    showIcon
                    placeholder="Select Delivery Date & Time"
                    minDate={new Date()}
                  />
                </div>
    
                <div className="field">
                  <label htmlFor="itemAmt">Item Amount</label>
                  <InputNumber 
                    id="itemAmt"
                    value={selectedOrderDetail.item_amt}
                    onValueChange={(e) => setSelectedOrderDetail({
                      ...selectedOrderDetail,
                      item_amt: e.value || 0
                    })}
                    mode="currency" 
                    currency="INR" 
                    locale="en-IN"
                  />
                </div>
    
                <div className="field">
                  <label htmlFor="ordQty">Order Qty</label>
                  <InputNumber 
                    id="ordQty"
                    value={selectedOrderDetail.ord_qty}
                    onValueChange={(e) => setSelectedOrderDetail({
                      ...selectedOrderDetail,
                      ord_qty: e.value || 0
                    })}
                    min={0}
                  />
                </div>
    
                <div className="field">
                  <label htmlFor="desc1">Special Instruction</label>
                  <InputTextarea 
                    id="desc1"
                    value={selectedOrderDetail.desc1 || ''} 
                    onChange={(e) =>
                      setSelectedOrderDetail({
                        ...selectedOrderDetail,
                        desc1: e.target.value,
                      })
                    }
                    rows={4}
                    autoResize
                  />
                </div>
              </div>
            )}
        </Dialog>
    )
}

export default EditOrderDialog;