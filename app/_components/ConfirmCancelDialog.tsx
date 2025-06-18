import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";


const ConfirmCancelDialog = ({setConfirmCancelledVisible, confirmCancelledVisible, handleCancelled, quantity}) => {
    return(
        <Dialog 
            header="Confirm Cancellation"
            visible={confirmCancelledVisible}
            onHide={() => setConfirmCancelledVisible(false)}
            style={{ width: '450px' }}
            modal
            footer={
              <div>
                <Button 
                  label="No" 
                  icon="pi pi-times" 
                  onClick={() => setConfirmCancelledVisible(false)} 
                  className="p-button-text" 
                />
                <Button 
                  label="Yes" 
                  icon="pi pi-check" 
                  onClick={() => {
                    setConfirmCancelledVisible(false);
                    handleCancelled();
                  }} 
                  autoFocus 
                />
              </div>
            }
        >
            <div className="flex align-items-center justify-content-center">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>
                Are you sure you want to mark {quantity} items as cancelled?
              </span>
            </div>
        </Dialog>
    )
}

export default ConfirmCancelDialog;