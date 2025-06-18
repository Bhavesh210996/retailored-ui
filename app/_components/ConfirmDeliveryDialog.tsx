import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

const ConfirmDeliveryDialog = ({confirmDeliveredVisible, setConfirmDeliveredVisible, quantity, handleDelivered}) => {
    return(
        <Dialog 
            header="Confirm Delivery"
            visible={confirmDeliveredVisible}
            onHide={() => setConfirmDeliveredVisible(false)}
            style={{ width: '450px' }}
            modal
            footer={
              <div>
                <Button 
                  label="No" 
                  icon="pi pi-times" 
                  onClick={() => setConfirmDeliveredVisible(false)} 
                  className="p-button-text" 
                />
                <Button 
                  label="Yes" 
                  icon="pi pi-check" 
                  onClick={() => {
                    setConfirmDeliveredVisible(false);
                    handleDelivered();
                  }} 
                  autoFocus 
                />
              </div>
            }
        >
            <div className="flex align-items-center justify-content-center">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>
                Are you sure you want to mark {quantity} items as delivered?
              </span>
            </div>
        </Dialog>
    )
}

export default ConfirmDeliveryDialog;