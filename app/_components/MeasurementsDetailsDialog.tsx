import { formatDate } from "@/demo/utils/helpers";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Skeleton } from "primereact/skeleton";
import { useState } from "react";


interface MeasurementData {
  measurement_date: string;
  measurementDetails: {
    measurement_val: string;
    measurement_main_id: string;
    measurementMaster: {
      id: string;
      measurement_name: string;
      data_type: string;
    };
  }[];
}

interface EditedMeasurement {
    id: string;
    name: string;
    value: string;
}

interface MeasurementsDetailsDialogProps {
    selectedItem: any;
    measurementDialogVisible: boolean;
    measurementData: MeasurementData | null;
    loadingMeasurements: boolean;
    setMeasurementDialogVisible: (visible: boolean) => void;
    setMeasurementData: (data: MeasurementData | null) => void;
    selectedOrder: any;
    isSaving: boolean;
    handleEditMeasurement: () => void;
    editMeasurementDialogVisible: boolean;
    setEditMeasurementDialogVisible: (visible: boolean) => void;
    editedMeasurements: EditedMeasurement[];
    saveEditedMeasurements: () => void;
    handleMeasurementValueChange: (id: string, value: string) => void;
}

const MeasurementsDetailsDialog = (props: MeasurementsDetailsDialogProps) => {
    const [isMaximized, setIsMaximized] = useState(true);
    
    const {
            selectedItem, 
            measurementDialogVisible,
            measurementData, 
            loadingMeasurements, 
            setMeasurementDialogVisible,
            setMeasurementData,
            selectedOrder,
            isSaving,
            handleEditMeasurement,
            editMeasurementDialogVisible,
            setEditMeasurementDialogVisible,
            editedMeasurements,
            saveEditedMeasurements,
            handleMeasurementValueChange
        } = props;

    return(
        <>
            <Dialog 
            header={
              <div className="flex align-items-center w-full">
                <span>Measurement Details</span>
                <Button 
                  icon="pi pi-pencil" 
                  onClick={handleEditMeasurement}
                  className="p-button-rounded p-button-text"
                  disabled={!measurementData}
                  style={{ marginLeft: '0.5rem' }}
                />
              </div>
            }
            visible={measurementDialogVisible} 
            onHide={() => {
              setMeasurementDialogVisible(false);
              setMeasurementData(null);
            }}
            maximized={isMaximized}
            onMaximize={(e) => setIsMaximized(e.maximized)}
            className={isMaximized ? 'maximized-dialog' : ''}
            blockScroll
        >
            {selectedItem && (
              <div className="p-fluid">
                <div className="grid my-2">
                  <div className="col-6 font-bold text-600">Customer Name:</div>
                  <div className="col-6 font-medium text-right">{selectedOrder?.user?.fname}</div>
                  
                <div className="col-6 font-bold text-600">Delivery Date:</div>
                  <div className="col-6 font-medium text-right">
                    {selectedItem?.delivery_date ? formatDate(new Date(selectedItem?.delivery_date)) : 'Not scheduled'}
                  </div>
                  
                  <div className="col-6 font-bold text-600">Trial Date:</div>
                  <div className="col-6 font-medium text-right">
                    {selectedItem?.trial_date ? formatDate(new Date(selectedItem?.trial_date)) : 'Not scheduled'}
                  </div>
                </div>
    
                {loadingMeasurements ? (
                  <div className="surface-100 p-3 border-round my-4">
                    <div className="flex align-items-center gap-3">
                      <Skeleton shape="circle" size="2rem" />
                      <div className="flex flex-column gap-2 w-full">
                        <Skeleton width="100%" height="1.5rem" />
                        <Skeleton width="50%" height="1rem" />
                      </div>
                    </div>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="grid my-3">
                        <div className="col-6">
                          <Skeleton width="80%" height="1.5rem" />
                        </div>
                        <div className="col-6">
                          <Skeleton width="60%" height="1.5rem" className="float-right" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : measurementData && measurementData.measurementDetails?.length > 0 ? (
                  <>
                    <div className="surface-100 p-3 border-round my-4">
                      <h4 className="m-0">Measurements</h4>
                      <p className="text-sm mt-1">
                        Taken on: {new Date(measurementData.measurement_date).toLocaleString()}
                      </p>
                    </div>
    
                    <div className="grid mb-4">
                      {measurementData.measurementDetails.map((detail, index) => (
                        <div key={index} className="col-12 md:col-6">
                          <div className="flex justify-content-between align-items-center p-3 border-bottom-1 surface-border">
                            <span className="font-medium">{detail.measurementMaster.measurement_name}</span>
                            <span className="font-bold">{detail.measurement_val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="surface-100 p-3 border-round my-4 text-center">
                    <i className="pi pi-info-circle text-2xl mb-2" />
                    <p className="m-0">No measurement details available</p>
                  </div>
                )}
    
                <div className="surface-50 p-3 border-round">
                  <h5 className="mt-0 mb-3">Stitch Options</h5>
                  {loadingMeasurements ? (
                    <div className="grid">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="col-6">
                          <Skeleton width="80%" height="1.5rem" className="mb-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid">
                      <div className="col-6 font-bold text-600">Collar:</div>
                      <div className="col-6 font-medium text-right">
                        {measurementData ? 'Classic' : 'No details available'}
                      </div>
                      
                      <div className="col-6 font-bold text-600">Sleeve:</div>
                      <div className="col-6 font-medium text-right">
                        {measurementData ? 'Full' : 'No details available'}
                      </div>
                      
                      <div className="col-6 font-bold text-600">Cuffs:</div>
                      <div className="col-6 font-medium text-right">
                        {measurementData ? 'Squared' : 'No details available'}
                      </div>
                      
                      <div className="col-6 font-bold text-600">Pocket Type:</div>
                      <div className="col-6 font-medium text-right">
                        {measurementData ? 'Classic' : 'No details available'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            </Dialog>

            <Dialog 
                header="Edit Measurement Details"
                visible={editMeasurementDialogVisible}
                onHide={() => setEditMeasurementDialogVisible(false)}
                maximized={isMaximized}
                onMaximize={(e) => setIsMaximized(e.maximized)}
                className={isMaximized ? 'maximized-dialog' : ''}
                blockScroll
                footer={
                  <div>
                    <Button 
                      label="Update" 
                      icon="pi pi-check" 
                      onClick={saveEditedMeasurements}
                      autoFocus
                      className="w-full"
                      loading={isSaving} 
                      disabled={isSaving}
                    />
                  </div>
                }
            >
                <div className="p-fluid">
                  {editedMeasurements.map((measurement) => {
                    const measurementDetail = measurementData?.measurementDetails.find(
                      detail => detail.measurementMaster.id === measurement.id
                    );

                    const dataType = measurementDetail?.measurementMaster.data_type || 'text';

                    return (
                      <div key={measurement.id} className="field my-3">
                        <label htmlFor={`measurement-${measurement.id}`} className="font-bold block mb-1">
                          {measurement.name} <span className="text-500 font-normal">({dataType})</span>
                        </label>
                        <InputText
                          id={`measurement-${measurement.id}`}
                          value={measurement.value}
                          onChange={(e) => handleMeasurementValueChange(measurement.id, e.target.value)}
                          className="w-full"
                        />
                      </div>
                    );
                  })}
                </div>
            </Dialog>
        </>
    )
}

export default MeasurementsDetailsDialog;