import { Button } from "primereact/button";
import { useState } from "react";

const SalesOrderButtons = ({ selectedOrder, clickReceivePayments}) => {
    return (
        <div>
            <div className="grid">
                <div className='col-6 text-center'>
                  <Button
                  style={{ border: '#d2d2d8', backgroundColor: "#ffffff", color: "#0ea5e9"}}
                    className='border'
                    label="Send Bill"
                    icon="pi pi-whatsapp"
                  />
                </div>
                <div className='col-6 text-center'>
                  <Button
                    style={{ border: '#d2d2d8', backgroundColor: "#ffffff", color: "#0ea5e9" }}
                    label="Print Bill"
                    icon="pi pi-print"
                  />
                </div>
                <div className='col-12'>
                  <Button
                    label="Receive Payment"
                    icon="pi pi-wallet"
                    className="w-full p-button-info"
                    onClick={clickReceivePayments}
                    disabled={selectedOrder?.amt_due === 0 || selectedOrder?.amt_due === undefined}
                  />
                </div>
            </div>
        </div>
    )
}

export default SalesOrderButtons;