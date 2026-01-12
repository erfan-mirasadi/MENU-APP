import { FaReceipt, FaCheck } from "react-icons/fa";
import OrderSection from "./OrderSection";
import SwipeableOrderItem from "./SwipeableOrderItem";

export default function ActiveOrderList({ 
    items, // Can be mixed (confirmed + active) for waiter
    role, 
    isBatchEditing,
    onEditOrder,
    onCancelEdit,
    onSaveEdit,
    batchItems,
    onUpdateBatchQty,
    onDeleteBatchItem,
    onUpdateQty,
    onDelete
}) {
    if (items.length === 0) return null;

    // WAITER VIEW (Confirmed + Active merged usually passed here)
    if (role === 'waiter') {
         return (
             <OrderSection
                 title="Sent to Kitchen"
                 count={items.length}
                 accentColor="blue"
                 icon={<FaReceipt />}
             >
                 <div className="space-y-3 opacity-90">
                     {items.map(item => (
                         <SwipeableOrderItem key={item.id} item={item} isPending={false} onUpdateQty={onUpdateQty} onDelete={onDelete} />
                     ))}
                 </div>
             </OrderSection>
         );
    }

    // CASHIER VIEW (Active only - Served/Kitchen)
    if (role === 'cashier') {
         return (
             <OrderSection
                 title="In Kitchen / Served"
                 count={items.length}
                 accentColor="green"
                 icon={<FaCheck />}
                 action={
                    !isBatchEditing && (
                        <button onClick={onEditOrder} className="text-sm font-bold text-green-500 hover:text-green-400 underline">
                            Edit Order
                        </button>
                    )
                 }
             >
                {isBatchEditing ? (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            {batchItems.map(item => (
                                <SwipeableOrderItem
                                    key={item.id}
                                    item={item}
                                    isPending={false}
                                    onUpdateQty={onUpdateBatchQty}
                                    onDelete={onDeleteBatchItem}
                                />
                            ))}
                        </div>
                        <div className="flex gap-3">
                           <button onClick={onCancelEdit} className="flex-1 py-3 bg-gray-700 text-gray-300 font-bold rounded-xl">Cancel</button>
                           <button onClick={onSaveEdit} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-900/40">Save Changes</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 opacity-90">
                        {items.map(item => (
                            <SwipeableOrderItem key={item.id} item={item} isPending={false} readOnly={true} />
                        ))}
                    </div>
                )}
             </OrderSection>
         );
    }
    
    return null;
}
