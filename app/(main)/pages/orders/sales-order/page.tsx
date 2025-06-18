/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/navigation';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { Skeleton } from 'primereact/skeleton';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Sidebar } from 'primereact/sidebar';
import { Dropdown } from 'primereact/dropdown';
import { useSearchParams } from 'next/navigation';
import { SalesOrderService } from '@/demo/service/sales-order.service';
import { JobOrderService } from '@/demo/service/job-order.service';
import FullPageLoader from '@/demo/components/FullPageLoader';
import { useState, useEffect, useRef, useCallback, use } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDebounce } from 'use-debounce';
import { Galleria } from 'primereact/galleria';
import { Toast } from '@capacitor/toast';
import { formatDate } from '@/demo/utils/helpers';

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

const SalesOrder = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isMaximized, setIsMaximized] = useState(true);
  const [visible, setVisible] = useState(false);
  const [editOrderDetailDialogVisible, setEditOrderDetailDialogVisible] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order['orderDetails'][0] | null>(null);
  const [measurementData, setMeasurementData] = useState<MeasurementData | null>(null);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const [editMeasurementDialogVisible, setEditMeasurementDialogVisible] = useState(false);
  const [editedMeasurements, setEditedMeasurements] = useState<{id: string, name: string, value: string}[]>([]);
  const [statusSidebarVisible, setStatusSidebarVisible] = useState(false);
  const [measurementDialogVisible, setMeasurementDialogVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Order['orderDetails'][0] | null>(null);
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [paymentModes, setPaymentModes] = useState<{id: string, mode_name: string}[]>([]);
  const [paymentHistorySidebarVisible, setPaymentHistorySidebarVisible] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);
  const [itemActionSidebarVisible, setItemActionSidebarVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Order['orderDetails'][0] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [confirmDeliveredVisible, setConfirmDeliveredVisible] = useState(false);
  const [confirmCancelledVisible, setConfirmCancelledVisible] = useState(false);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [images, setImages] = useState<{itemImageSrc: string}[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
    hasMorePages: true
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    reference: ''
  });
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const source = searchParams.get('source');
  const observer = useRef<IntersectionObserver | null>(null);
  const lastOrderRef = useRef<HTMLDivElement>(null);

  const fetchOrders = useCallback(async (page: number, perPage: number, loadMore = false) => {
    try {
      if (loadMore) {
        setIsFetchingMore(true);
      } else {
        setLoading(true);
      }

      const response = await SalesOrderService.getSalesOrders(page, perPage, debouncedSearchTerm);
      const newOrders = response.data.map((res: any) => ({
        ...res,
        customer: res.user.fname,
        delivery_date: res.tentitive_delivery_date,
        orderDetails: []
      }));

      if (loadMore) {
        setOrders(prev => [...prev, ...newOrders]);
      } else {
        setOrders(newOrders);
      }

      setPagination({
        currentPage: response.pagination.currentPage,
        perPage: response.pagination.perPage,
        total: response.pagination.total,
        hasMorePages: response.pagination.hasMorePages
      });
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      setError('Failed to fetch orders');
      await Toast.show({
        text: 'Failed to load orders',
        duration: 'short',
        position: 'bottom'
      });
    } finally {
      if (loadMore) {
        setIsFetchingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (!source) {
      fetchOrders(1, pagination.perPage);
    }
  }, [fetchOrders, pagination.perPage, debouncedSearchTerm]);


  useEffect(() => {
    if (!pagination.hasMorePages || loading || isFetchingMore) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        fetchOrders(pagination.currentPage + 1, pagination.perPage, true);
      }
    };

    if (lastOrderRef.current) {
      observer.current = new IntersectionObserver(observerCallback, {
        root: null,
        rootMargin: '20px',
        threshold: 1.0
      });

      observer.current.observe(lastOrderRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [pagination, loading, isFetchingMore, fetchOrders]);


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

  const handleDialogClose = () => {
    setVisible(false);
    if (source) {
      router.push(`/pages/reports/${source}`);
    }
  };
  const openOrderDetails = (orderId: String) => {
    if (orderId) {
      router.push(`sales-order/${orderId}`);
    }
  };

  const itemTemplate = (item: {itemImageSrc: string}) => {
    return (
      <img 
        src={item.itemImageSrc} 
        alt="Preview" 
        style={{ width: '100%', display: 'block' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';
        }}
      />
    );
  };
  
  const thumbnailTemplate = (item: {itemImageSrc: string}) => {
    return (
      <img 
        src={item.itemImageSrc} 
        alt="Thumbnail" 
        style={{ display: 'block', width: '100%' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';
        }}
      />
    );
  };
  
  const handleImagePreview = (images: string | string[] | null) => {
    if (!images) return;
    
    const imageArray = Array.isArray(images) ? images : [images];
    const imageUrls = imageArray.map(filename => ({
      itemImageSrc: filename
    }));
        
    setImages(imageUrls);
    setActiveImageIndex(0);
    setImagePreviewVisible(true);
  };

  const handleAddOrder = () => {
    router.push('/pages/orders/create-order');
  };

  const getPendingAmountSummary = (order: Order) => {
    return `₹${order.amt_due} (₹${order.ord_amt})`;
  };



  if (loading && !isFetchingMore && !debouncedSearchTerm) {
    return (
      <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3 w-full">
          <Skeleton width="10rem" height="2rem" />
          <Skeleton width="100%" height="2.5rem" className="md:w-20rem" />
          <Skeleton width="100%" height="2.5rem" />
        </div>
  
        <div className="grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="col-12 md:col-6 lg:col-4">
              <Card className="h-full">
                <div className="flex flex-column gap-2">
                  <div className="flex justify-content-between align-items-center">
                    <Skeleton width="8rem" height="1.25rem" />
                    <Skeleton width="5rem" height="1.25rem" />
                  </div>
  
                  <Divider className="my-2" />
  
                  <div className="flex flex-column gap-1">
                    <div className="flex justify-content-between">
                      <Skeleton width="6rem" height="1rem" />
                      <Skeleton width="7rem" height="1rem" />
                    </div>
                    <div className="flex justify-content-between">
                      <Skeleton width="6rem" height="1rem" />
                      <Skeleton width="7rem" height="1rem" />
                    </div>
                    <div className="flex justify-content-between">
                      <Skeleton width="6rem" height="1rem" />
                      <Skeleton width="7rem" height="1rem" />
                    </div>
                    <div className="flex justify-content-between">
                      <Skeleton width="6rem" height="1rem" />
                      <Skeleton width="7rem" height="1rem" />
                    </div>
                    <div className="flex justify-content-between">
                      <Skeleton width="8rem" height="1rem" />
                      <Skeleton width="7rem" height="1rem" />
                    </div>
                    <div className="flex justify-content-between">
                      <Skeleton width="8rem" height="1rem" />
                      <Skeleton width="7rem" height="1rem" />
                    </div>
                  </div>
  
                  <Divider className="my-2" />
  
                  <Skeleton width="5rem" height="1rem" />
                  <Skeleton width="100%" height="2rem" className="mt-2" />
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }  

  return (
    <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {(isSaving || isSavingDetails) && <FullPageLoader />}
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <h2 className="text-2xl m-0">Sales Orders</h2>
        <span className="p-input-icon-left p-input-icon-right w-full">
          <i className="pi pi-search" />
          <InputText 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="w-full"
          />
          
          {loading && debouncedSearchTerm ? (
            <i className="pi pi-spin pi-spinner" />
          ) : searchTerm ? (
            <i 
              className="pi pi-times cursor-pointer" 
              onClick={() => {
                setSearchTerm('');
              }}
            />
          ) : null}
        </span>
        <Button 
          label="Create Order" 
          icon="pi pi-plus" 
          onClick={handleAddOrder}
          className="w-full md:w-auto"
          size="small"
        />
      </div>
      
      <div className="grid">
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div 
              key={order.id} 
              className="col-12 md:col-6 lg:col-4"
              ref={index === orders.length - 1 ? lastOrderRef : null}
            >
              <Card className="h-full">
                <div className="flex flex-column gap-2">
                  <div className="flex justify-content-between align-items-center">
                    <span className="font-bold">{order.docno}</span>
                    <Tag 
                      value={order.orderStatus?.status_name || 'Unknown'}
                      severity={getStatusSeverity(order.orderStatus?.status_name)} 
                    />
                  </div>
                  
                  <Divider className="my-2" />
                  
                  <div className="flex flex-column gap-1">
                    <div className="flex justify-content-between">
                      <span className="text-600">Customer:</span>
                      <span>{order.customer}</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span className="text-600">Order Date:</span>
                      <span>{formatDate(new Date(order.order_date))}</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span className="text-600">Delivered:</span>
                      <span>{order.delivered_qty}</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span className="text-600">Payment Pending:</span>
                      <span>{getPendingAmountSummary(order)}</span>
                    </div>
                  </div>
                  
                  <Divider className="my-2" />
                  
                  <div className="flex flex-column gap-1">
                    <span className="text-600">Notes:</span>
                    <p className="m-0 text-sm">{order.desc1 || 'No notes'}</p>
                  </div>
                  
                  <div className="mt-3">
                    <Button 
                      label="View Details" 
                      icon="pi pi-eye"
                      onClick={() => openOrderDetails(order.id)}
                      className="w-full p-button-sm"
                    />
                  </div>
                </div>
              </Card>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="p-4 text-center surface-100 border-round">
              <i className="pi pi-search text-3xl mb-1" />
              <h4>No orders found</h4>
            </div>
          </div>
        )}
      </div>

      {isFetchingMore && (
        <div className="flex justify-content-center mt-3">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-spinner pi-spin" />
            <span>Loading more orders...</span>
          </div>
        </div>
      )}

      <Dialog 
        visible={imagePreviewVisible} 
        onHide={() => setImagePreviewVisible(false)}
        style={{ width: '90vw' }}
      >
        <Galleria
          value={images}
          activeIndex={activeImageIndex}
          onItemChange={(e) => setActiveImageIndex(e.index)}
          showThumbnails={false}
          showIndicators={images.length > 1}
          showItemNavigators={images.length > 1}
          item={itemTemplate}
          thumbnail={thumbnailTemplate}
          style={{ width: '100%' }}
        />
      </Dialog>

    </div>
  );
};

export default SalesOrder;