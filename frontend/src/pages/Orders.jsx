import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import RequestReturn from '../components/RequestReturn';
import axios from 'axios';
import { showToast } from '../utils/toast';


const Orders = () => {
  const {backendUrl, token, currency} = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [realTimeTracking, setRealTimeTracking] = useState({});
  const [loadingTracking, setLoadingTracking] = useState({});
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);

  const loadOrderData = async () => {
    try{
      if(!token){
        return null
      }
      const response = await axios.post(backendUrl + '/api/order/userOrders', {}, {headers: {token}})
      if(response.data.success){
        let allOrderItems = []
        response.data.orders.map((order)=>{
          order.items.map((item)=>{
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            item['orderId'] = order._id
            allOrderItems.push(item)
          })
        })
        setOrderData(allOrderItems.reverse())
        
      }
    }
    catch(error){

    }
  }

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + '/api/order/cancel',
        { orderId },
        { headers: { token } }
      );

      if (response.data.success) {
        showToast.success('Order cancelled successfully');
        await loadOrderData();
      } else {
        showToast.error(response.data.message);
      }
    } catch (error) {
      showToast.error('Failed to cancel order');
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/order/invoice/${orderId}`,
        { 
          headers: { token },
          responseType: 'blob' // Important for file download
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showToast.error('Failed to download invoice');
    }
  };

  const fetchRealTimeTracking = async (orderId) => {
    try {
      setLoadingTracking(prev => ({...prev, [orderId]: true}));
      const response = await axios.post(backendUrl + '/api/order/tracking', 
        { orderId }, 
        { headers: { token } }
      );
      
      if (response.data.success) {
        setRealTimeTracking(prev => ({
          ...prev, 
          [orderId]: response.data.tracking
        }));
      } else {
        // Tracking not available - silent fail
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
    } finally {
      setLoadingTracking(prev => ({...prev, [orderId]: false}));
    }
  }

  const toggleOrderDetails = async (index, orderId) => {
    const isExpanding = expandedOrder !== index;
    setExpandedOrder(isExpanding ? index : null);
    
    // Fetch real-time tracking when expanding
    if (isExpanding && !realTimeTracking[orderId]) {
      await fetchRealTimeTracking(orderId);
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Order Placed': return 'bg-blue-500';
      case 'Packing': return 'bg-yellow-500';
      case 'Shipped': return 'bg-purple-500';
      case 'Out for delivery': return 'bg-orange-500';
      case 'Delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }

  useEffect(()=>{
    loadOrderData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadOrderData()
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, [token])

  return (
    <div className='border-t pt-16'>
      <div className='flex justify-between items-center mb-4'>
        <div className='text-2xl'>
          <Title text1 = {'MY'} text2 = {'ORDERS'}/>
        </div>
        <button 
          onClick={loadOrderData}
          className='bg-black text-white px-6 py-2 text-sm rounded hover:bg-gray-800 transition-colors'
        >
          Refresh Orders
        </button>
      </div>
      <div>
        {orderData.map((item, index)=>(
          <div key={index} className='py-4 border-b text-gray-700'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-start gap-6 text-sm'>
                <img className='w-16 sm:w-20' src={item.images[0]} alt="" />
                <div>
                  <p className='sm:text-base font-medium'>{item.name}</p>
                  <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                    <p>{currency}{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className='mt-1'>Date: <span className='text-gray-400'>{new Date(item.date).toDateString()}</span></p>
                  <p className='mt-1'>Payment: <span className='text-gray-400'>{item.paymentMethod}</span></p>
                </div>
              </div>
              <div className='md:w-1/2 flex justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <p className={`min-w-2 h-2 rounded-full ${getStatusColor(item.status)}`}></p>
                  <p className='text-sm md:text-base'>{item.status}</p>
                </div>
                <div className='flex gap-2'>
                  {!item.payment && item.status !== 'Shipped' && item.status !== 'Out for delivery' && item.status !== 'Delivered' && (
                    <button 
                      onClick={() => cancelOrder(item.orderId)} 
                      className='border border-red-500 text-red-500 px-3 py-2 text-sm font-medium rounded-sm hover:bg-red-50 transition-colors'
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={() => toggleOrderDetails(index, item.orderId)} 
                    className='border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-100 transition-colors'
                  >
                    {expandedOrder === index ? 'Hide Details' : 'Track Order'}
                  </button>
                  {item.payment && (
                    <>
                      <button 
                        onClick={() => downloadInvoice(item.orderId)} 
                        className='border border-green-500 text-green-600 px-3 py-2 text-sm font-medium rounded-sm hover:bg-green-50 transition-colors'
                        title='Download Invoice'
                      >
                        📄 Invoice
                      </button>
                      {item.status === 'Delivered' && (
                        <button 
                          onClick={() => {
                            // Find the full order data
                            const fullOrder = {
                              _id: item.orderId,
                              items: orderData.filter(o => o.orderId === item.orderId),
                              date: item.date
                            };
                            setSelectedOrderForReturn(fullOrder);
                            setReturnDialogOpen(true);
                          }} 
                          className='border border-orange-500 text-orange-600 px-3 py-2 text-sm font-medium rounded-sm hover:bg-orange-50 transition-colors'
                          title='Request Return'
                        >
                          🔄 Return
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tracking Details */}
            {expandedOrder === index && (
              <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                <div className='flex justify-between items-center mb-3'>
                  <h3 className='font-semibold'>Order Tracking</h3>
                  {loadingTracking[item.orderId] && (
                    <span className='text-sm text-gray-500'>Loading tracking...</span>
                  )}
                </div>
                
                {/* Real-Time Tracking Info */}
                {realTimeTracking[item.orderId] && (
                  <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded'>
                    <p className='font-medium text-blue-900 mb-2'>
                      {realTimeTracking[item.orderId].courier?.toUpperCase()} Tracking
                    </p>
                    <p className='text-sm text-gray-700'>
                      <span className='font-medium'>Tracking #:</span> {realTimeTracking[item.orderId].trackingNumber}
                    </p>
                    {realTimeTracking[item.orderId].estimatedDelivery && (
                      <p className='text-sm text-gray-700'>
                        <span className='font-medium'>Est. Delivery:</span> {new Date(realTimeTracking[item.orderId].estimatedDelivery).toLocaleDateString()}
                      </p>
                    )}
                    {realTimeTracking[item.orderId].message && (
                      <p className='text-xs text-gray-600 mt-1'>{realTimeTracking[item.orderId].message}</p>
                    )}
                  </div>
                )}
                
                {/* Real-Time Checkpoints */}
                {realTimeTracking[item.orderId]?.checkpoints && realTimeTracking[item.orderId].checkpoints.length > 0 ? (
                  <div className='space-y-3 mb-4'>
                    <p className='font-medium text-sm text-gray-700'>Delivery History:</p>
                    {realTimeTracking[item.orderId].checkpoints.map((checkpoint, idx) => (
                      <div key={idx} className='flex items-start gap-3 pl-2'>
                        <div className='w-3 h-3 rounded-full bg-blue-500 mt-1'></div>
                        <div className='flex-1'>
                          <p className='font-medium text-sm'>{checkpoint.message}</p>
                          <p className='text-xs text-gray-500'>{checkpoint.location}</p>
                          <p className='text-xs text-gray-400'>{new Date(checkpoint.date).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Default Timeline */
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3'>
                      <div className={`w-3 h-3 rounded-full ${item.status === 'Order Placed' || item.status === 'Packing' || item.status === 'Shipped' || item.status === 'Out for delivery' || item.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className='font-medium'>Order Placed</p>
                        <p className='text-xs text-gray-500'>{new Date(item.date).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className={`w-3 h-3 rounded-full ${item.status === 'Packing' || item.status === 'Shipped' || item.status === 'Out for delivery' || item.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className='font-medium'>Packing</p>
                        <p className='text-xs text-gray-500'>Your order is being prepared</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className={`w-3 h-3 rounded-full ${item.status === 'Shipped' || item.status === 'Out for delivery' || item.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className='font-medium'>Shipped</p>
                        <p className='text-xs text-gray-500'>Your order has been shipped</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className={`w-3 h-3 rounded-full ${item.status === 'Out for delivery' || item.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className='font-medium'>Out for Delivery</p>
                        <p className='text-xs text-gray-500'>Your order is on the way</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className={`w-3 h-3 rounded-full ${item.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className='font-medium'>Delivered</p>
                        <p className='text-xs text-gray-500'>Order has been delivered</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className='mt-4 pt-4 border-t'>
                  <p className='text-sm'><span className='font-medium'>Order ID:</span> {item.orderId}</p>
                  <p className='text-sm'><span className='font-medium'>Payment Status:</span> {item.payment ? 'Paid' : 'Pending'}</p>
                  {!realTimeTracking[item.orderId] && (
                    <button 
                      onClick={() => fetchRealTimeTracking(item.orderId)}
                      className='mt-2 text-sm text-blue-600 hover:underline'
                    >
                      Refresh Tracking Info
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Request Return Dialog */}
      {selectedOrderForReturn && (
        <RequestReturn
          order={selectedOrderForReturn}
          open={returnDialogOpen}
          onClose={() => {
            setReturnDialogOpen(false);
            setSelectedOrderForReturn(null);
          }}
          onSuccess={() => {
            loadOrderData();
          }}
        />
      )}
    </div>
  )
}

export default Orders;
