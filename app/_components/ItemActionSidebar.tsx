import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Sidebar } from "primereact/sidebar";


const ItemActionSidebar = (props) => {
    const {
        setItemActionSidebarVisible,
        itemActionSidebarVisible,
        selectedDetail,
        handleStatusQuantityChange,
        quantity,
        setConfirmCancelledVisible,
        setConfirmDeliveredVisible
    } = props;
    return(
        <Sidebar 
            visible={itemActionSidebarVisible}
            onHide={() => setItemActionSidebarVisible(false)}
            position="bottom"
            style={{ 
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
            }}
            className="custom-item-action-sidebar"
            header={
              <div className="sticky top-0 bg-white z-1 p-3 surface-border flex justify-content-between align-items-center">
                <span className="font-bold text-xl mr-2">
                  {/* {selectedDetail?.material?.name || 'Item Actions'} */}
                </span>
                <span className="text-sm text-500">
                  Max: {selectedDetail ? selectedDetail.ord_qty - selectedDetail.delivered_qty - selectedDetail.cancelled_qty : 0}
                </span>
              </div>
            }
            blockScroll
        >
            {selectedDetail && (
              <div className="p-3">
                <div className="field mb-4">
                  <label className="font-bold block mb-2">Quantity</label>
                  <div className="flex align-items-center justify-content-between bg-gray-100 p-2 border-round">
                    <Button
                      icon="pi pi-minus" 
                      onClick={() => handleStatusQuantityChange(quantity - 1)}
                      className="p-button-rounded p-button-text"
                      disabled={quantity <= 1}
                    />
                    <InputText 
                      value={String(quantity)}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value) || 1;
                        const maxQty = selectedDetail.ord_qty - selectedDetail.delivered_qty - selectedDetail.cancelled_qty;
                        handleStatusQuantityChange(Math.min(newValue, maxQty));
                      }}
                      className="text-center mx-2 bg-white"
                      style={{ width: '60px' }}
                      keyfilter="int"
                    />
                    <Button 
                      icon="pi pi-plus" 
                      onClick={() => handleStatusQuantityChange(quantity + 1)}
                      className="p-button-rounded p-button-text"
                      disabled={quantity >= (selectedDetail.ord_qty - selectedDetail.delivered_qty - selectedDetail.cancelled_qty)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 w-full">
                  <Button 
                    label="Cancelled" 
                    icon="pi pi-times" 
                    onClick={() => setConfirmCancelledVisible(true)}
                    className="flex-grow-1 p-button-danger"
                  />
                  <Button 
                    label="Delivered" 
                    icon="pi pi-check" 
                    onClick={() => setConfirmDeliveredVisible(true)}
                    className="flex-grow-1 p-button-success"
                  />
                </div>
              </div>
            )}
        </Sidebar>
    )
}

export default ItemActionSidebar;