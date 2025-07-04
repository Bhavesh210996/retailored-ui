/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from '@capacitor/toast';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { Skeleton } from 'primereact/skeleton';
import { useDebounce } from 'primereact/hooks'; 
import { ReportsService } from '@/demo/service/reports.service';
import { SalesOrderService } from '@/demo/service/sales-order.service';
import FullPageLoader from '@/demo/components/FullPageLoader';
import { Avatar } from 'primereact/avatar';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useLongPress } from '@/demo/hooks/useLongPress';
import useMobileDetect from '@/demo/hooks/useMobileDetect';

interface JobOrderStatus {
  id: string;
  job_order_main_id: string;
  status: string;
  status_name: string;
}

interface PendingOrderItem {
  id: string;
  order_id: string;
  customerID: string;
  customerName: string;
  productID: string;
  productName: string;
  productRef: string;
  deliveryDate: string;
  admsite_code: string;
  statusId: number;
  status: string;
  jobOrderStatus: JobOrderStatus[];
  last_jobId: string | null;
}

interface PendingOrdersResponse {
  data: PendingOrderItem[];
  paginatorInfo: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    hasMorePages: boolean;
  };
}

const PendingSalesReport = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<PendingOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0,
    hasMorePages: true
  });
  const [statusSidebarVisible, setStatusSidebarVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PendingOrderItem | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PendingOrderItem | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastOrderRef = useRef<HTMLDivElement>(null);
  const actionPanelRef = useRef<OverlayPanel | null>(null);

  const { onPointerDown, onPointerUp } = useLongPress(
    (e: {}, item: PendingOrderItem) => {
      setSelectedItem(item);
      actionPanelRef.current?.show(e);
    },
    (e: {}, item: PendingOrderItem) => {
      setSelectedItem(item);
      viewSalesOrder(item.order_id)
    },
    600
  );
  const isMobile = useMobileDetect();
  const availableStatuses = [
    { id: 1, name: 'Pending' },
    { id: 2, name: 'In Progress' },
    { id: 3, name: 'Completed' },
    { id: 4, name: 'Cancelled' }
  ];

  const fetchPendingOrders = useCallback(async (page: number, perPage: number, loadMore = false) => {
    try {
      if (loadMore) {
        setIsFetchingMore(true);
      } else {
        setLoading(true);
      }

      const response: PendingOrdersResponse = await ReportsService.getPendingSalesOrders(
        page,
        perPage,
        debouncedSearchTerm
      );

      if (loadMore) {
        setOrders(prev => [...prev, ...response.data]);
      } else {
        setOrders(response.data);
      }

      setPagination({
        currentPage: response.paginatorInfo.currentPage,
        perPage: response.paginatorInfo.perPage,
        total: response.paginatorInfo.total,
        hasMorePages: response.paginatorInfo.hasMorePages
      });
    } catch (error) {
      console.error('Error fetching pending sales orders:', error);
      await Toast.show({
        text: 'Failed to load pending orders',
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
    fetchPendingOrders(1, pagination.perPage);
  }, [fetchPendingOrders, pagination.perPage, debouncedSearchTerm]);

  useEffect(() => {
    if (!pagination.hasMorePages || loading || isFetchingMore) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        fetchPendingOrders(pagination.currentPage + 1, pagination.perPage, true);
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
  }, [pagination, loading, isFetchingMore, fetchPendingOrders]);

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'danger';
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleCreateViewJO = (item: PendingOrderItem) => {
    const { order_id, jobOrderStatus } = item;
    
    if (jobOrderStatus.length === 0) {
      router.push(`/pages/orders/job-order?id=${order_id}&completed=false&source=pending-sales`);
    } else {
      router.push(`/pages/orders/job-order?id=${order_id}&source=pending-sales`);
    }
  };

  const openStatusChangeDialog = (item: PendingOrderItem) => {
    setSelectedItem(item);
    setSelectedStatus(item.statusId);
    setStatusSidebarVisible(true);
  };

  const handleStatusChange = async (statusId: number) => {
    if (!selectedItem) return;

    try {
      setIsSaving(true);
      
      await SalesOrderService.updateSalesOrderStatus(
        selectedItem.id,
        { status_id: statusId }
      );

      await Toast.show({
        text: 'Status updated successfully',
        duration: 'short',
        position: 'bottom'
      });

      await fetchPendingOrders(1, pagination.perPage);
      setStatusSidebarVisible(false);
    } catch (error) {
      console.error('Error updating status:', error);
      await Toast.show({
        text: 'Failed to update status',
        duration: 'short',
        position: 'bottom'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (item: PendingOrderItem) => {
    setItemToDelete(item);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      setIsSaving(true);
      
      await ReportsService.deleteSalesOrderItem(itemToDelete.id);

      await Toast.show({
        text: 'Item deleted successfully',
        duration: 'short',
        position: 'bottom'
      });

      await fetchPendingOrders(1, pagination.perPage);
    } catch (error) {
      console.error('Error deleting item:', error);
      await Toast.show({
        text: 'Failed to delete item',
        duration: 'short',
        position: 'bottom'
      });
    } finally {
      setIsSaving(false);
      setDeleteConfirmVisible(false);
    }
  };

  const viewSalesOrder = (orderId: string) => {
    router.push(`/pages/orders/sales-order/${orderId}`);
  };

  if (loading && !isFetchingMore && !debouncedSearchTerm) {
    return (
      <div className="flex flex-column p-3 lg:p-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3 w-full">
          <Skeleton width="10rem" height="2rem" />
          <Skeleton width="100%" height="2.5rem" className="md:w-20rem" />
        </div>
  
        <div className="grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="col-12 md:col-6 lg:col-4">
              <Card className="shadow-2 border-round-xl p-3">
                <div className="flex justify-content-between align-items-center mb-3">
                  <div className="flex align-items-center gap-2">
                    <Skeleton shape="circle" size="3rem" />
                    <div className="flex flex-column gap-1">
                      <Skeleton width="8rem" height="1rem" />
                      <Skeleton width="6rem" height="0.75rem" />
                    </div>
                  </div>
                  <Skeleton width="4rem" height="1.5rem" />
                </div>

                <Skeleton width="10rem" height="1.25rem" className="mb-2" />
                <Skeleton width="6rem" height="1rem" className="mb-3" />

                <Divider className="my-2" />

                <div className="flex flex-column gap-2 mb-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-content-between">
                      <Skeleton width="7rem" height="1rem" />
                      <Skeleton width="6rem" height="1rem" />
                    </div>
                  ))}
                </div>

                <Divider className="my-2" />

                <div className="flex flex-column gap-2">
                  <Skeleton width="100%" height="2rem" />
                  <Skeleton width="100%" height="2rem" />
                  <div className="flex gap-2">
                    <Skeleton width="100%" height="2rem" />
                    <Skeleton width="20%" height="2rem" />
                  </div>
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
      {isSaving && <FullPageLoader />}
        <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
          <h2 className="text-2xl m-0">Pending Sales Orders Report</h2>
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
        </div>
      <div>
        {orders.length > 0 ? (
          orders.map((item, index) => (
            <div 
              key={`${item.order_id}-${item.id}`} 
              className="col-12 md:col-6 lg:col-4"
              ref={index === orders.length - 1 ? lastOrderRef : null}
              style={{ minWidth: 280}}
            >
            <Card className="shadow-2 border-round-xl p-3" 
              style={{border: "2px solid #d3bfa8"}} 
              onPointerDown={(e) => onPointerDown(e, item)}
              onPointerUp={(e) => onPointerUp(e, item)}
              onContextMenu={(e) => e.preventDefault()}
              >
                <div className="flex justify-content-between align-items-center mb-3">
                  <div className="flex align-items-center gap-2">
                    <Avatar label={item.customerName?.charAt(0)} style={{backgroundColor:"#e6d6c4", border: "2px solid #d3bfa8"}} size="xlarge" shape="square" />
                    <div>
                      
                      <div className="text-lg font-medium"><span className="pi pi-user"></span> {item.customerName}</div>
                      <div className="text-sm text-color-secondary">Order No: {item.order_id}</div>
                    </div>
                  </div>
                  <Tag value={item.status || 'Stitching'} severity="secondary" />
                </div>

                <div className='flex justify-content-between'>
                  <div className="text-md font-semibold mb-2">{item.productName}</div>
                  <Tag 
                    value={item.status}
                    severity={getStatusSeverity(item.status)} 
                    className="mb-3"
                    rounded
                    />
                </div>

                <Divider className="my-2" />

                <div className="text-sm mb-3">
                  <div className='flex justify-content-between mb-3'>
                    <div className="flex justify-content-between">
                      <span><i className="pi pi-calendar mr-2"></i>Trial:</span>
                      <span></span>
                    </div>
                    <div className="flex justify-content-between">
                      <span><i className="pi pi-calendar mr-2"></i>Delivery:</span>
                      <span>{item.deliveryDate ? formatDate(item.deliveryDate) : 'Not scheduled'}</span>
                    </div>
                  </div>
                  <div className='flex justify-content-between'>
                    <div className="flex justify-content-between">
                      <span><i className="pi pi-calendar mr-2"></i>Received:</span>
                      <span>{item.deliveryDate ? formatDate(item.deliveryDate) : 'Not scheduled'}</span>
                    </div>
                  </div>
                </div>
                      
                <Divider className="my-2" />
              </Card>

            </div>
            ))
        ) : (
          <div className="col-12">
            <div className="p-4 text-center surface-100 border-round">
              <i className="pi pi-search text-3xl mb-1" />
              <h4>No pending orders found</h4>
            </div>
          </div>
        )}

        <OverlayPanel ref={actionPanelRef}>
            {selectedItem && (
              <div className="flex flex-column gap-2" style={{ minWidth: '200px' }}>
                <Button
                  label={selectedItem.jobOrderStatus.length > 0 ? 'View Job Order' : 'Create Job Order'}
                  icon={selectedItem.jobOrderStatus.length > 0 ? 'pi pi-eye' : 'pi pi-plus'}
                  onClick={() => {
                    handleCreateViewJO(selectedItem);
                    actionPanelRef.current.hide();
                  }}
                  className={`w-full ${selectedItem.jobOrderStatus.length > 0 ? 'p-button-info' : 'p-button-warning'}`}
                />

                <Button
                  label="Change Status"
                  icon="pi pi-cog"
                  onClick={() => {
                    openStatusChangeDialog(selectedItem);
                    actionPanelRef.current.hide();
                  }}
                  className="w-full p-button-secondary"
                />

                <Button
                  icon="pi pi-trash"
                  label="Delete"
                  onClick={() => {
                    confirmDelete(selectedItem);
                    actionPanelRef.current.hide();
                  }}
                  className="w-full p-button-danger"
                  disabled={
                    selectedItem.jobOrderStatus.length > 0 &&
                    selectedItem.jobOrderStatus[selectedItem.jobOrderStatus.length - 1].status_name === 'Completed'
                  }
                />
              </div>
            )}
          </OverlayPanel>
      </div>

      {isFetchingMore && (
        <div className="flex justify-content-center mt-3">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-spinner pi-spin" />
            <span>Loading more orders...</span>
          </div>
        </div>
      )}

      <Sidebar 
        visible={statusSidebarVisible} 
        onHide={() => setStatusSidebarVisible(false)}
        position="bottom"
        style={{ 
          width: '100%',
          height: 'auto',
          maxHeight: '62vh',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
        }}
        header={
          <div className="sticky top-0 bg-white z-1 p-3 surface-border flex justify-content-between align-items-center">
            <span className="font-bold text-xl">Update Item Status</span>
          </div>
        }
        className="p-0"
      >
        <div className="p-3">
          <div className="grid">
            {availableStatuses.map(status => (
              <div key={status.id} className="col-12 md:col-6 lg:col-4 p-2">
                <Button
                  label={status.name}
                  onClick={() => handleStatusChange((status.id))}
                  severity={getStatusSeverity(status.name) || undefined}
                  className="w-full p-3 text-lg justify-content-start p-button-outlined"
                  icon={
                    status.name === 'Completed' ? 'pi pi-check-circle' :
                    status.name === 'In Progress' ? 'pi pi-spinner' :
                    status.name === 'Pending' ? 'pi pi-clock' :
                    status.name === 'Cancelled' ? 'pi pi-times-circle' :
                    'pi pi-info-circle'
                  }
                  disabled={
                    (status.id) === selectedItem?.statusId || 
                    ((status.id) === 3 && (
                      !selectedItem?.jobOrderStatus?.length || 
                      selectedItem.jobOrderStatus[selectedItem.jobOrderStatus.length - 1].status_name !== 'Completed'
                    ))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </Sidebar>

      <Dialog 
        header="Confirm Delete" 
        visible={deleteConfirmVisible} 
        onHide={() => setDeleteConfirmVisible(false)}
        style={{ width: '90vw', maxWidth: '500px' }}
      >
        <div className="flex flex-column gap-3 mt-2">
          <p>
            {itemToDelete && orders.filter(o => o.order_id === itemToDelete.order_id).length === 1 
              ? "This is the only item in the Sales Order. Deleting this will delete the entire Sales Order. Continue?"
              : "Are you sure you want to delete this item?"}
          </p>
          
          <div className="flex justify-content-end gap-2 mt-3">
            <Button 
              label="Cancel" 
              icon="pi pi-times" 
              onClick={() => setDeleteConfirmVisible(false)}
              className="p-button-text"
            />
            <Button 
              label="Delete" 
              icon="pi pi-trash" 
              onClick={handleDeleteItem}
              className="p-button-danger"
              loading={isSaving}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default PendingSalesReport;