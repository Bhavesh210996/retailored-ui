import SalesOrderButtons from "./SalesOrderButtons"
import { Divider } from "primereact/divider";
import { ProgressSpinner } from "primereact/progressspinner";
import { useCallback, useEffect, useState } from "react";
import { JobOrderService } from "@/demo/service/job-order.service";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "@capacitor/toast";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { SalesOrderService } from "@/demo/service/sales-order.service";
import { formatDate, formatDateTime } from "@/demo/utils/helpers";
import StatusSideBar from "./StatusSideBar";
import MeasurementsDetailsDialog from "./MeasurementsDetailsDialog";
import ItemActionSidebar from "./ItemActionSidebar";
import ConfirmCancelDialog from "./ConfirmCancelDialog";
import ConfirmDeliveryDialog from "./ConfirmDeliveryDialog";
import EditOrderDialog from "./EditOrderDialog";

interface Order {
  id: string;
  user_id: string;
  docno: string;
  order_date: string;
  customer: string;
  ord_amt: number;
  amt_paid: number;
  amt_due: number;
  ord_qty: number;
  delivered_qty: number;
  cancelled_qty: number;
  tentitive_delivery_date: string;
  delivery_date: string;
  desc1: string | null;
  ext: string;
  user: {
    id: string;
    fname: string;
    admsite_code: number;
  }
  orderStatus: {
    id: string;
    status_name: string;
  } | null;
  orderDetails: {
    id: string;
    order_id: string;
    measurement_main_id: string;
    image_url: string[] | null;
    material_master_id: string;
    trial_date: string | null;
    delivery_date: string | null;
    item_amt: number;
    ord_qty: number;
    delivered_qty: number;
    cancelled_qty: number;
    desc1: string | null;
    ext: string;
    item_ref: string;
    orderStatus: {
      id: string;
      status_name: string;
    } | null;
    material: {
        id: string;
        name: string;
    }
    jobOrderDetails: {
      adminSite?: {
        sitename: string;
      };
    }[];
  }[];
}

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
interface SalesOrderDetailsProps {
  selectedOrder: Order;
  fetchOrderDetails: (orderId: string) => Promise<void>;
}

const SalesOrderDetails = ({selectedOrder, fetchOrderDetails} : SalesOrderDetailsProps) => {
    const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
    const [paymentModes, setPaymentModes] = useState<{id: string, mode_name: string}[]>([]);
    const [isMaximized, setIsMaximized] = useState(true);
    const [visible, setVisible] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<any>(null);
    const [selectedDetailsDialogVisible, setSelectedDetailsDialogVisible] = useState(false);
    const [statusSidebarVisible, setStatusSidebarVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Order['orderDetails'][0] | null>(null);
    const [measurementDialogVisible, setMeasurementDialogVisible] = useState(false);
    const [loadingMeasurements, setLoadingMeasurements] = useState(false);
    const [measurementData, setMeasurementData] = useState<MeasurementData | null>(null);
    const [editMeasurementDialogVisible, setEditMeasurementDialogVisible] = useState(false);
    const [editedMeasurements, setEditedMeasurements] = useState<{id: string, name: string, value: string}[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [itemActionSidebarVisible, setItemActionSidebarVisible] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [confirmCancelledVisible, setConfirmCancelledVisible] = useState(false);
    const [confirmDeliveredVisible, setConfirmDeliveredVisible] = useState(false);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order['orderDetails'][0] | null>(null);
    const [editOrderDetailDialogVisible, setEditOrderDetailDialogVisible] = useState(false);
    const [isSavingDetails, setIsSavingDetails] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        reference: ''
    });
    const { amt_paid, amt_due } = selectedOrder || {};

    const getStatusSeverity = (status?: string): 'success' | 'info' | 'warning' | 'danger' | null | undefined => {
      switch (status) {
        case 'Completed': return 'success';
        case 'In Progress': return 'info';
        case 'Pending': return 'warning';
        case 'Cancelled': return 'danger';
        case 'Partial': return 'warning';
        case 'Unknown': return 'info';
        default: return null;
      }
    };
    useEffect(() => {
        if(selectedOrder){
            fetchPaymentHistory(selectedOrder?.id || '');
        }
    }, [selectedOrder])

    const availableStatuses = [
      { id: '1', name: 'Pending' },
      { id: '2', name: 'In Progress' },
      { id: '5', name: 'Ready for Trial' },
      { id: '3', name: 'Completed' },
      { id: '4', name: 'Cancelled' }
    ];
    const fetchPaymentModes = useCallback(async () => {
      try {
        const modes = await JobOrderService.getPaymentModes();
        setPaymentModes(modes);
      } catch (error) {
        console.error('Error fetching payment modes:', error);
      }
    }, []);

    const handlePaymentClick = () => {
      if (selectedOrder) {
        setPaymentForm({
            amount: amt_due.toString(),
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: '',
            reference: ''
        });
        setPaymentDialogVisible(true);
        fetchPaymentModes();
      }
    };

    const handlePaymentSubmit = async () => {
      if (!selectedOrder || !paymentForm.amount || !paymentForm.paymentDate || !paymentForm.paymentMethod) {
        await Toast.show({
          text: 'Please fill all required fields',
          duration: 'short',
          position: 'bottom'
        });
        return;
      }
    
      try {
        const paymentData = {
          user_id: Number(selectedOrder.user?.id),
          order_id: Number(selectedOrder.id),
          admsite_code: selectedOrder.user?.admsite_code,
          payment_date: paymentForm.paymentDate,
          payment_mode: paymentForm.paymentMethod,
          payment_ref: paymentForm.reference || null,
          payment_amt: parseFloat(paymentForm.amount),
        };
      
        await JobOrderService.createPaymentMain(paymentData);

        await Toast.show({
          text: 'Payment recieved successfully',
          // duration: 'short',
          position: 'bottom'
        });
      
        setPaymentForm({
          amount: '',
          paymentDate: new Date().toISOString().split('T')[0],
          reference: '',
          paymentMethod: ''
        });
        setVisible(false);
        setPaymentDialogVisible(false);
        fetchPaymentHistory(selectedOrder.id || '');
        //   await fetchOrders(1, pagination.perPage);
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to record payment';
        await Toast.show({
          text: errorMessage,
          duration: 'short',
          position: 'bottom'
        });
        console.error('Error:', err);
      }
    };
    const fetchPaymentHistory = async (orderId: string) => {
      try {
        setLoadingPaymentHistory(true);
        const response = await SalesOrderService.getOrderInfoByOrderId(orderId);
        setPaymentHistory(response.data);
      } catch (error) {
        console.error('Error fetching payment history:', error);
        await Toast.show({
          text: 'Failed to load payment history',
          duration: 'short',
          position: 'bottom'
        });
      } finally {
        setLoadingPaymentHistory(false);
      }
    };

    const handleViewPopup = (itemId: string) => {
      const item = selectedOrder?.orderDetails?.find(detail => detail.id === itemId);
      if (item) {
          setSelectedDetail(item);
          setSelectedDetailsDialogVisible(true);
      } else {
          Toast.show({
              text: 'Item not found',
              duration: 'short',
              position: 'bottom'
          });
      }
    }

    const handleItemStatusUpdate = async (statusId: number) => {
      if (!selectedDetail || !selectedOrder) return;
  
      try {
        setLoading(true);
        await SalesOrderService.updateSalesOrderStatus(selectedDetail.id, {
          status_id: statusId,
        });
  
        const newStatus = availableStatuses.find(s => parseInt(s.id) === statusId)?.name;
  
        await Toast.show({
          text: `Item status updated to ${newStatus || 'selected status'}`,
          duration: 'short',
          position: 'bottom'
        });
        // handleViewPopup(selectedDetail.id),
        await Promise.all([
          fetchOrderDetails(selectedOrder.id),
          // fetchOrders(pagination.currentPage, pagination.perPage)
        ]);
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to update item status';
        await Toast.show({
          text: errorMessage,
          duration: 'short',
          position: 'bottom'
        });
        console.error('Error:', err);
      } finally {
        setLoading(false);
        setStatusSidebarVisible(false);
        setSelectedDetailsDialogVisible(false);
      }
    };

    const fetchMeasurements = async (OrderID: number) => {
      setLoadingMeasurements(true);
      try {
        const response = await SalesOrderService.getOrderMeasurements(OrderID);
        
        if (!response) {
          setMeasurementData(null);
          return;
        }
  
        const measurementData = response?.orderDetail?.measurementMain || null;
        
        setMeasurementData(measurementData);
      } catch (error) {
        setMeasurementData(null);
      } finally {
        setLoadingMeasurements(false);
      }
    };

    const handleEditMeasurement = () => {
      if (!measurementData) return;
      
      const measurementsToEdit = measurementData.measurementDetails.map(detail => ({
        id: detail.measurementMaster.id,
        name: detail.measurementMaster.measurement_name,
        value: detail.measurement_val
      }));

      setEditedMeasurements(measurementsToEdit);
      setEditMeasurementDialogVisible(true);
    };

    const handleViewMeasurement = (item: Order['orderDetails'][0]) => {
      setSelectedItem(item);
      setMeasurementDialogVisible(true);
      if (item.id) {
        fetchMeasurements(Number(item.id));
      }
    };

    const saveEditedMeasurements = async () => {
      try {
        if (!selectedItem?.id || !measurementData) return;
    
        setIsSaving(true);
    
        const id = Number(measurementData.measurementDetails[0]?.measurement_main_id);
    
        const measurementUpdates = editedMeasurements.map((item) => ({
          measurement_main_id: id,
          measurement_master_id: Number(item.id),
          measurement_val: item.value,
        }));
    
        await SalesOrderService.updateMeasurementsDetails(id, measurementUpdates);
    
        await Toast.show({
          text: 'Measurements updated successfully',
          duration: 'short',
          position: 'bottom',
        });
    
        fetchMeasurements(Number(selectedItem.id));
        setEditMeasurementDialogVisible(false);
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to update measurements';
        await Toast.show({
          text: errorMessage,
          duration: 'short',
          position: 'bottom'
        });
        console.error('Error:', err);
      } finally {
        setIsSaving(false);
      }
    };

    const handleMeasurementValueChange = (id: string, value: string) => {
      setEditedMeasurements(prev => 
        prev.map(item => 
          item.id === id ? { ...item, value } : item
        )
      );
    };

    const openItemActionSidebar = (detail: Order['orderDetails'][0]) => {
      setSelectedDetail(detail);
      const maxQty = detail.ord_qty - detail.delivered_qty - detail.cancelled_qty;
      setQuantity(maxQty);
      setItemActionSidebarVisible(true);
    };
    
    const handleStatusQuantityChange = (value: number) => {
      if (!selectedDetail) return;
      const maxQty = selectedDetail.ord_qty - selectedDetail.delivered_qty - selectedDetail.cancelled_qty;
      setQuantity(Math.min(Math.max(1, value), maxQty));
    };

    const handleCancelled = async () => {
      if (!selectedDetail || !selectedOrder) return;
      
      try {
        await SalesOrderService.markOrderCancelled(
          selectedOrder.id,
          quantity
        );

        await Toast.show({
          text: 'Item marked as cancelled',
          duration: 'short',
          position: 'bottom'
        });

        await fetchOrderDetails(selectedOrder.id);
        setItemActionSidebarVisible(false);
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to update cancellation status';
        await Toast.show({
          text: errorMessage,
          duration: 'short',
          position: 'bottom'
        });
        console.error('Error:', err);
      }
    };
    const handleDelivered = async () => {
      if (!selectedDetail || !selectedOrder) return;
      
      try {
        await SalesOrderService.markOrderDelivered(
          selectedOrder.id,
          quantity
        );

        await Toast.show({
          text: 'Item marked as delivered',
          duration: 'short',
          position: 'bottom'
        });

        await fetchOrderDetails(selectedOrder.id);
        setItemActionSidebarVisible(false);
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to update delivery status';
        await Toast.show({
          text: errorMessage,
          duration: 'short',
          position: 'bottom'
        });
        console.error('Error:', err);
      }
    };

    const handleEditOrderDetail = (detail: Order['orderDetails'][0]) => {
      setSelectedOrderDetail(detail);
      setEditOrderDetailDialogVisible(true);
    };
    const handleUpdateOrderDetail = async () => {
      if (!selectedOrderDetail || !selectedOrder || !selectedOrderDetail?.id) {
        await Toast.show({
          text: 'Invalid order details for update',
          duration: 'short',
          position: 'bottom'
        });
        return;
      }

      try {
        setIsSavingDetails(true);

        await SalesOrderService.updateOrderDetails(
          selectedOrderDetail.id,
          {
            order_id: Number(selectedOrderDetail.order_id),
            measurement_main_id: Number(selectedOrderDetail.measurement_main_id),
            material_master_id: Number(selectedOrderDetail.material_master_id),
            trial_date: formatDateTime(selectedOrderDetail.trial_date),
            delivery_date: formatDateTime(selectedOrderDetail.delivery_date),
            item_amt: selectedOrderDetail.item_amt,
            ord_qty: selectedOrderDetail.ord_qty,
            desc1: selectedOrderDetail.desc1,
            admsite_code: selectedOrder?.user?.admsite_code.toString() || null
          }
        );

        await Toast.show({
          text: 'Order details updated successfully',
          duration: 'short',
          position: 'bottom'
        });

        await fetchOrderDetails(selectedOrder.id);
        // await fetchOrders(pagination.currentPage, pagination.perPage);
        setEditOrderDetailDialogVisible(false);
        setSelectedDetailsDialogVisible(false);
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to update order details';
        await Toast.show({
          text: errorMessage,
          duration: 'short',
          position: 'bottom'
        });
        console.error('Error:', err);
      } finally {
        setIsSavingDetails(false);
      }
    };
    return (
        <>
          <div className="flex flex-column justify-content-between h-full">
            <div>
                <div className="p-3 border-round bg-gray-100 w-full mb-5">
                    <div className="flex justify-content-between mb-4">
                      <span className="font-bold text-lg">Name</span>
                      <span className="text-lg text-blue-600">{selectedOrder?.user?.fname}</span>
                    </div>
                    <div className="flex justify-content-between mb-4">
                      <span className="text-lg text-color-secondary">Phone Number</span>
                      <span className="text-lg">1234567890</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span className="font-bold text-lg">Order Number</span>
                      <span className="font-medium text-lg text-blue-600">{selectedOrder?.docno}</span>
                    </div>
                </div>

                <Divider />

                <h5 className="text-lg font-semibold text-gray-700 m-0 mb-3">Order Details</h5>

                <>
                {selectedOrder?.orderDetails?.map((item) => (
                    <div key={item.id}>
                        <div className='flex justify-content-between align-items-center mb-2 border-1 border-round p-4 w-full'>
                          <div className='text-primary font-medium text-lg'><span>#{item.material?.name || 'Not Available'}</span></div>
                          <div className='flex gap-5 align-items-center'>
                            <i className="pi pi-print" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
                            <button onClick={() => handleViewPopup(item.id)}
                              type="button"
                              className="text-lg text-blue-600 hover:text-blue-800 underline border-none bg-transparent cursor-pointer">
                                View
                            </button>
                          </div>
                        </div>
                        <div className="p-3 border-round bg-gray-100 w-full mb-5">
                          <div className="flex justify-content-between mb-5">
                            <span className="font-bold text-lg">#{item.material?.name || 'Not Available'}</span>
                            <span className="text-lg">₹{item.item_amt || 0}</span>
                          </div>
                          <div className="flex justify-content-between mb-2">
                            <span className="text-lg text-color-secondary">Stitching Cost</span>
                            <span className="text-lg">{item.ord_qty || 1} × ₹{item.item_amt || 0} = ₹{item.ord_qty * item.item_amt}</span>
                          </div>
                          <div className="flex justify-content-between pt-2 mt-2">
                            <span className="font-bold text-lg">Total:</span>
                            <span className="font-bold text-lg">₹{item.ord_qty * item.item_amt}</span>
                          </div>
                        </div>
                    </div>
                ))}
                </>
                  
                <div className="p-3 border-round w-full" style={{ backgroundColor: '#eef4ff' }}>
                    <div className="flex justify-content-between mb-2">
                        <span className="text-lg text-color-secondary">Advance Amount</span>
                        <span className="text-lg text-primary font-semibold">₹{amt_paid}</span>
                    </div>
                    <div className="flex justify-content-between">
                        <span className="text-lg font-bold">Balance Due</span>
                        <span className="text-lg font-bold text-red-500">₹{amt_due}</span>
                    </div>
                </div>
                <div>
                    <div className='flex gap-3 align-items-center'>
                        <i className="pi pi-money-bill" style={{ fontSize: '1.5rem'}}></i>
                        <h5 className="text-lg font-bold text-gray-700">Transactions</h5>
                    </div>
                {loadingPaymentHistory ? (
                    <div className="flex justify-content-center p-4">
                      <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                    </div>
                ) : paymentHistory.length > 0 ? (
                    <div className="flex flex-column gap-2 p-2">
                        {paymentHistory.map((payment, index) => (
                          <div key={index} className="flex justify-content-between align-items-center border-1 surface-border p-3 border-round">
                            <div className="text-lg">
                              <div className="text-500">Date</div>
                              <div className="font-medium">{new Date(payment.payment_date).toLocaleDateString('en-IN')}</div>
                            </div>
                            <div className="text-lg text-right">
                              <div className="text-500">Amount</div>
                              <div className="font-medium">₹{payment.payment_amt}</div>
                            </div>
                            <div className="text-lg text-right">
                              <div className="text-500">Method</div>
                              <div className="font-medium">
                                {payment.paymentMode?.mode_name || payment.payment_type || 'Unknown'}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    ) : (
                        <div className="flex flex-column align-items-center justify-content-center p-5">
                            <i className="pi pi-info-circle text-2xl mb-2"></i>
                            <p className="text-500 m-0">No payment history found</p>
                        </div>
                  )}
                </div>
            </div>
            <SalesOrderButtons selectedOrder={selectedOrder} clickReceivePayments={handlePaymentClick}/>
          
            <Dialog 
                header="Receive Payment"
                visible={paymentDialogVisible}
                onHide={() => setPaymentDialogVisible(false)}
                maximized={isMaximized}
                onMaximize={(e) => setIsMaximized(e.maximized)}
                className={isMaximized ? 'maximized-dialog' : ''}
                blockScroll
            >
                <div className="p-fluid">
                    <div className="field my-4">
                      <label htmlFor="amount" className="font-bold block mb-2">
                        Payment Amount (₹)
                      </label>
                      <InputText
                        id="amount" 
                        type="number" 
                        className="w-full" 
                        placeholder="Enter amount"
                        value={paymentForm.amount}
                        onChange={(e) => {
                          const enteredAmount = parseFloat(e.target.value) || 0;
                          const maxAllowed = selectedOrder?.amt_due || 0;
                          if (enteredAmount <= maxAllowed) {
                            setPaymentForm({...paymentForm, amount: e.target.value});
                          } else {
                            Toast.show({
                              text: `Amount cannot exceed ₹${maxAllowed}`,
                              duration: 'short',
                              position: 'bottom'
                            });
                            setPaymentForm({...paymentForm, amount: maxAllowed.toString()});
                          }
                        }}
                        max={selectedOrder?.amt_due}
                      />
                    </div>
                    
                    <div className="field mb-4">
                      <label htmlFor="paymentDate" className="font-bold block mb-2">
                        Payment Date
                      </label>
                      <Calendar
                        id="paymentDate"
                        value={new Date(paymentForm.paymentDate)}
                        onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.value?.toISOString().split('T')[0] || ''})}
                        dateFormat="dd-mm-yy"
                        showIcon
                        className="w-full"
                      />
                    </div>
                    
                    <div className="field mb-4">
                      <label htmlFor="paymentMethod" className="font-bold block mb-2">
                        Payment Method
                      </label>
                      <Dropdown
                        id="paymentMethod"
                        value={paymentForm.paymentMethod}
                        options={paymentModes?.map(mode => ({
                          label: mode.mode_name,
                          value: mode.id
                        }))}
                        optionLabel="label"
                        placeholder={paymentModes.length ? "Select payment method" : "Loading payment methods..."}
                        className="w-full"
                        onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.value})}
                        disabled={!paymentModes.length}
                      />
                    </div>
                    
                    <div className="field mb-4">
                      <label htmlFor="reference" className="font-bold block mb-2">
                        Reference/Note
                      </label>
                      <InputText 
                        id="reference" 
                        className="w-full" 
                        placeholder="Enter reference or note"
                        value={paymentForm.reference}
                        onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex justify-content-end gap-2 mt-4">
                      <Button 
                        label="Cancel" 
                        icon="pi pi-times" 
                        className="p-button-secondary"
                        onClick={() => {
                          setPaymentDialogVisible(false);
                          setPaymentForm({
                            amount: '',
                            paymentDate: new Date().toISOString().split('T')[0],
                            reference: '',
                            paymentMethod: ''
                          });
                        }}
                      />
                      <Button 
                        label="Confirm" 
                        icon="pi pi-check" 
                        className="p-button-success"
                        onClick={handlePaymentSubmit}
                        disabled={!paymentForm.amount || !paymentForm.paymentDate || !paymentForm.paymentMethod || parseFloat(paymentForm.amount) > (selectedOrder?.amt_due || 0)}
                      />
                    </div>
                </div>
            </Dialog>

            <Dialog 
                visible={selectedDetailsDialogVisible}
                onHide={() => setSelectedDetailsDialogVisible(false)}
            >
                <div key={selectedDetail?.id} className="mb-4 surface-50 p-3 border-round">
                    <div className="grid">
                      <div className="col-6">
                        <div className="field">
                          <label>Item Ref</label>
                          <p className="m-0 font-medium">{selectedDetail?.item_ref || 'Not Available'}</p>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="field">
                          <label>Job Order No</label>
                          <p className="m-0 font-medium">{selectedDetail?.order_id}</p>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="field">
                          <label>Item Name</label>
                          <p className="m-0 font-medium">{selectedDetail?.material?.name || 'Not Available'}</p>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="field">
                          <label>Jobber Name</label>
                          <p className="m-0 font-medium">{selectedDetail?.jobOrderDetails?.[0]?.adminSite?.sitename || 'Not assigned'}</p>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="field">
                          <label>Trial Date</label>
                          <p className="m-0 font-medium">
                            {selectedDetail?.trial_date ? formatDate(new Date(selectedDetail?.trial_date)) : 'Not scheduled'}
                          </p>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="field">
                          <label>Amount</label>
                          <p className="m-0 font-medium">₹ {selectedDetail?.item_amt || 0}</p>
                        </div>
                      </div>
                      <div className="col-12 mt-2">
                        <div className="grid align-items-start">
                          <div className="col-9">
                            <div className="field">
                              <label>Notes</label>
                              <p className="m-0 font-medium">{selectedDetail?.desc1 || 'No Notes Available'}</p>
                            </div>
                          </div>
                          <div className="col-3 flex justify-content-end pt-4">
                            <Button 
                              icon="pi pi-pencil" 
                              onClick={() => handleEditOrderDetail(selectedDetail)}
                              className="p-button-rounded p-button"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-12 mt-2">
                        <Button
                          label={`Status (${selectedDetail?.orderStatus?.status_name || 'Unknown'})`}
                          icon="pi pi-sync"
                          className="w-full"
                          onClick={() => {
                            setSelectedDetail(selectedDetail);
                            setStatusSidebarVisible(true);
                          }}
                          severity={getStatusSeverity(selectedDetail?.orderStatus?.status_name) || undefined}
                        />
                      </div>

                      {selectedDetail?.image_url && selectedDetail?.image_url.length > 0 && (
                        <div className="col-12 mt-2">
                          <Button 
                            label={`View Images (${selectedDetail?.image_url.length})`} 
                            icon="pi pi-image" 
                            className="p-button-outlined"
                            // onClick={() => handleImagePreview(selectedDetail.image_url)}
                          />
                        </div>
                      )}

                      <div className="col-12 mt-2">
                        <Button 
                          label="View Measurement Details" 
                          icon="pi pi-eye" 
                          className="w-full p-button-outlined"
                          onClick={() => handleViewMeasurement(selectedDetail)}
                        />
                      </div>

                      <div className="col-12 mt-2">
                        <Button 
                          label="Update Status"
                          icon="pi pi-pencil" 
                          onClick={() => openItemActionSidebar(selectedDetail)}
                          className="w-full"
                        />
                      </div>
                      <Divider />
                    </div>
                </div>

            </Dialog>
            <StatusSideBar
              availableStatuses={availableStatuses}
              handleItemStatusUpdate={handleItemStatusUpdate}
              getStatusSeverity={getStatusSeverity}
              statusSidebarVisible={statusSidebarVisible}
              setStatusSidebarVisible={setStatusSidebarVisible}
            />

            <MeasurementsDetailsDialog 
              measurementDialogVisible={measurementDialogVisible}
              selectedItem={selectedItem} 
              measurementData={measurementData} 
              loadingMeasurements={loadingMeasurements} 
              setMeasurementDialogVisible={setMeasurementDialogVisible} 
              setMeasurementData={setMeasurementData} 
              selectedOrder={selectedOrder}
              isSaving={isSaving}
              handleEditMeasurement={handleEditMeasurement}
              editMeasurementDialogVisible={editMeasurementDialogVisible}
              setEditMeasurementDialogVisible={setEditMeasurementDialogVisible}
              editedMeasurements={editedMeasurements}
              saveEditedMeasurements={saveEditedMeasurements}
              handleMeasurementValueChange={handleMeasurementValueChange}
            />

            <ItemActionSidebar 
              setItemActionSidebarVisible={setItemActionSidebarVisible}
              itemActionSidebarVisible={itemActionSidebarVisible}
              selectedDetail={selectedDetail}
              handleStatusQuantityChange={handleStatusQuantityChange}
              quantity={quantity}
              setConfirmCancelledVisible={setConfirmCancelledVisible}
              setConfirmDeliveredVisible={setConfirmDeliveredVisible}
            />
            <ConfirmCancelDialog 
              setConfirmCancelledVisible={setConfirmCancelledVisible}
              confirmCancelledVisible={confirmCancelledVisible}
              handleCancelled={handleCancelled}
              quantity={quantity}
            />

            <ConfirmDeliveryDialog 
              confirmDeliveredVisible={confirmDeliveredVisible}
              setConfirmDeliveredVisible={setConfirmDeliveredVisible}
              quantity={quantity}
              handleDelivered={handleDelivered}
            />

            <EditOrderDialog 
              editOrderDetailDialogVisible={editOrderDetailDialogVisible}
              setEditOrderDetailDialogVisible={setEditOrderDetailDialogVisible}
              selectedOrderDetail={selectedOrderDetail}
              setSelectedOrderDetail={setSelectedOrderDetail}
              isSavingDetails={isSavingDetails}
              handleUpdateOrderDetail={handleUpdateOrderDetail}
              selectedOrder={selectedOrder}
              fetchOrderDetails={fetchOrderDetails}
            />
            </div>
        </>
    )
}

export default SalesOrderDetails;