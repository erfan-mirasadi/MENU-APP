import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  confirmOrderItems,
  startTableSession,
  updateOrderItem,
  deleteOrderItem,
  addOrderItem,
  startPreparingOrder
} from "@/services/waiterService";
import { voidOrderItem, updateOrderItemSecurely } from "@/services/orderService";

export const useOrderDrawerLogic = (session, table, onCheckout) => {
  const [loading, setLoading] = useState(false);
  const [localItems, setLocalItems] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);

  // Void/Edit State
  const [itemToVoid, setItemToVoid] = useState(null);
  const [isBatchEditing, setIsBatchEditing] = useState(false);
  const [batchItems, setBatchItems] = useState([]);

  // Sync with Realtime Session Data
  useEffect(() => {
    if (session?.order_items) {
      const sorted = [...session.order_items].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      setLocalItems(sorted);
    } else {
      setLocalItems([]);
    }
  }, [session?.order_items]);

  // Derived Lists
  const pendingItems = localItems.filter((i) => i.status === "pending");
  const confirmedItems = localItems.filter((i) => i.status === "confirmed");
  const activeItems = localItems.filter((i) => ["preparing", "served"].includes(i.status));

  const totalAmount = localItems.reduce(
    (sum, item) => sum + (item.unit_price_at_order || 0) * item.quantity,
    0
  );

  // Handlers

  const handleStartSession = async () => {
    setLoading(true);
    try {
      await startTableSession(table.id, table.restaurant_id);
      toast.success("Table Started! 🟢");
    } catch (error) { toast.error("Failed to start"); } 
    finally { setLoading(false); }
  };

  const handleCloseTable = async () => {
    setIsPaymentModalOpen(true);
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      await confirmOrderItems(session.id);
      toast.success("Orders Sent to Kitchen! 👨‍🍳");
    } catch (error) { toast.error("Failed to confirm"); } 
    finally { setLoading(false); }
  };

  const handleStartPreparing = async () => {
      setLoading(true);
      try {
          await startPreparingOrder(session.id);
          toast.success("Started Preparing! 🍳", { icon: '👨‍🍳' });
      } catch(e) {
          toast.error("Error: " + (e.message || "Failed"));
      } finally {
          setLoading(false);
      }
  };

  const handleMenuAdd = async (product) => {
    const existingPending = localItems.find(i => 
        (i.product_id === product.id || i.product?.id === product.id) && i.status === "pending"
    );

    if (existingPending) {
        const newQty = existingPending.quantity + 1;
        setLocalItems(prev => prev.map(i => i.id === existingPending.id ? {...i, quantity: newQty} : i));
        try { await updateOrderItem(existingPending.id, { quantity: newQty }); } catch(e){}
    } else {
        const newItem = {
            id: `temp-${Date.now()}`,
            product, product_id: product.id,
            quantity: 1, unit_price_at_order: product.price,
            status: "pending", created_at: new Date().toISOString()
        };
        setLocalItems(prev => [...prev, newItem]);
        try {
            await addOrderItem({
                session_id: session.id,
                product_id: product.id,
                quantity: 1,
                unit_price_at_order: product.price,
                status: "pending"
            });
            toast.success("Item Added");
        } catch(e) {
            setLocalItems(prev => prev.filter(i => i.id !== newItem.id));
        }
    }
  };

  const handleMenuRemove = async (product) => {
      const existing = localItems.find(i => 
        (i.product_id === product.id || i.product?.id === product.id) && i.status !== "cancelled"
      );
      if(!existing) return;

      if(existing.quantity > 1) {
          const newQty = existing.quantity - 1;
          setLocalItems(prev => prev.map(i => i.id === existing.id ? {...i, quantity: newQty} : i));
          try { await updateOrderItem(existing.id, { quantity: newQty }); } catch(e){}
      } else {
          if (existing.status === 'pending') {
               setLocalItems(prev => prev.filter(i => i.id !== existing.id));
               try { await deleteOrderItem(existing.id); } catch(e){}
          } else {
              setItemToVoid(existing);
              setIsVoidModalOpen(true);
          }
      }
  };

  const onUpdateQty = async (itemId, newQty) => {
      if(newQty < 1) return;
      setLocalItems(prev => prev.map(i => i.id === itemId ? {...i, quantity: newQty} : i));
      try { await updateOrderItem(itemId, { quantity: newQty }); } catch(e){}
  };

  const onDeleteItem = async (itemId) => {
      const item = localItems.find(i => i.id === itemId);
      if (!item) return;

      if (item.status === 'pending') {
          setLocalItems(prev => prev.filter(i => i.id !== itemId));
          try { await deleteOrderItem(itemId); toast.success("Removed"); } catch(e){}
      } else {
          setItemToVoid(item);
          setIsVoidModalOpen(true);
      }
  };

  const handleConfirmVoid = async (reason) => {
      if (!itemToVoid) return;
      if (itemToVoid.actionType === 'BATCH_SAVE') {
          await executeBatchUpdate(reason);
          return;
      }
      try {
           await voidOrderItem(itemToVoid.id, reason);
           toast.success("Item Voided");
           setLocalItems(prev => prev.filter(i => i.id !== itemToVoid.id));
      } catch(e) { toast.error(e.message); }
      setIsVoidModalOpen(false);
      setItemToVoid(null);
  };

  const handleStartBatchEdit = () => {
      const active = localItems.filter(i => ["preparing", "served", "confirmed"].includes(i.status)); 
      setBatchItems(JSON.parse(JSON.stringify(active)));
      setIsBatchEditing(true);
  };

  const handleCancelBatchEdit = () => {
      setIsBatchEditing(false);
      setBatchItems([]);
  };

  const handleExecuteBatch = () => {
      const originalActive = localItems.filter(i => ["preparing", "served", "confirmed"].includes(i.status));
      let needsVoid = false;
      const newIds = batchItems.map(i => i.id);
      if (originalActive.some(o => !newIds.includes(o.id))) needsVoid = true;
      if (!needsVoid) {
          for (const newItem of batchItems) {
              const original = originalActive.find(o => o.id === newItem.id);
              if (original && newItem.quantity < original.quantity) {
                   needsVoid = true;
                   break;
              }
          }
      }
      if (needsVoid) {
          setItemToVoid({ actionType: 'BATCH_SAVE' });
          setIsVoidModalOpen(true);
      } else {
          executeBatchUpdate(null);
      }
  };

  const executeBatchUpdate = async (voidReason) => {
      setLoading(true);
      try {
          const originalActive = localItems.filter(i => ["preparing", "served", "confirmed"].includes(i.status));
          const updates = [];
          for (const newItem of batchItems) {
              const original = originalActive.find(o => o.id === newItem.id);
              if (original && newItem.quantity !== original.quantity) {
                  updates.push(updateOrderItemSecurely(newItem.id, newItem.quantity, original.quantity, voidReason || "Batch Update"));
              }
          }
          const newIds = batchItems.map(i => i.id);
          const removed = originalActive.filter(i => !newIds.includes(i.id));
          for (const r of removed) {
              updates.push(voidOrderItem(r.id, voidReason || "Batch Removed"));
          }
          await Promise.all(updates);
          toast.success("Order Updated");
      } catch (e) {
          toast.error("Update Failed: " + e.message);
      } finally {
          setLoading(false);
          setIsBatchEditing(false);
          setIsVoidModalOpen(false);
          setItemToVoid(null);
      }
  };

  const handleCheckoutWrapper = async (sessionId, method, amount) => {
        if (onCheckout) {
            const res = await onCheckout(sessionId, method, amount);
            if (res?.success) {
                setIsPaymentModalOpen(false);
                return true; 
            } else {
                toast.error("Checkout Failed: " + (res?.error?.message || "Unknown"));
                return false;
            }
        } else {
            toast.error("Checkout function not provided");
            return false;
        }
  }

  return {
    state: {
        loading,
        localItems,
        pendingItems,
        confirmedItems,
        activeItems,
        totalAmount,
        isMenuOpen,
        isPaymentModalOpen,
        isVoidModalOpen,
        itemToVoid,
        isBatchEditing,
        batchItems
    },
    setters: {
        setIsMenuOpen,
        setIsPaymentModalOpen,
        setIsVoidModalOpen,
        setBatchItems
    },
    actions: {
        handleStartSession,
        handleCloseTable,
        handleConfirmOrder,
        handleStartPreparing,
        handleMenuAdd,
        handleMenuRemove,
        onUpdateQty,
        onDeleteItem,
        handleConfirmVoid,
        handleStartBatchEdit,
        handleCancelBatchEdit,
        handleExecuteBatch,
        handleCheckoutWrapper
    }
  };
};
