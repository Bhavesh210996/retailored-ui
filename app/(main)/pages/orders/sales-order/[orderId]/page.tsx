"use client";
import SalesOrderDetails from "@/app/_components/SalesOrderDetails";
import { SalesOrderService } from "@/demo/service/sales-order.service";
import { Skeleton } from "primereact/skeleton";
import { useEffect, useState } from "react";

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

interface SalesOrderDetailsPageProps {
  params: { orderId: string };
}

const SalesOrderDetailsPage = ({ params }: SalesOrderDetailsPageProps) => {
    const [listLoading, setListLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { orderId } = params;
    
    useEffect(() => {
        if (orderId) {
            fetchOrderDetails(orderId);
        }
    }, [orderId]);

    const fetchOrderDetails = async (orderId: string) => {
      try {
        setListLoading(true);
        const res = await SalesOrderService.getSalesOrderById(orderId);
      
        if (res && res.orderDetails) {
          const detailedOrder: Order = res;
          setSelectedOrder(detailedOrder);
        } else {
          setSelectedOrder(null);
          throw new Error('Order details are missing from the response');
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError('Failed to fetch order details');
        setSelectedOrder(null);
      } finally {
        setListLoading(false);
      }
    };

    return (
        <div className="p-3 lg:p-5">
          {listLoading ? (
            <div className="p-fluid mt-3">
              <div className="mb-4">
                <Skeleton width="100%" height="10rem" borderRadius="6px" className="mb-5" />
                <Skeleton width="100%" height="2.5rem" borderRadius="6px" className="mb-5" />
                <Skeleton width="100%" height="20rem" className="mb-1" />
              </div>
  
              <div className="grid">
                <div className="col-12 md:col-4 mb-2">
                  <Skeleton width="100%" height="2.5rem" borderRadius="6px" />
                </div>
                <div className="col-12 md:col-4 mb-2">
                  <Skeleton width="100%" height="2.5rem" borderRadius="6px" />
                </div>
                <div className="col-12 md:col-4 mb-2">
                  <Skeleton width="100%" height="2.5rem" borderRadius="6px" />
                </div>
              </div>
            </div>
          ) : selectedOrder ? (
            <SalesOrderDetails selectedOrder={selectedOrder} fetchOrderDetails={fetchOrderDetails}/>
            ) : (
                <div className="flex justify-content-center align-items-center" style={{ height: '200px' }}>
                  <p>No order details available</p>
                </div>
          )}
        </div>
    );
}

export default SalesOrderDetailsPage;