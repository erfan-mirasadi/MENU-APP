import { FaClock, FaCheck } from "react-icons/fa";
import OrderSection from "./OrderSection";
import SwipeableOrderItem from "./SwipeableOrderItem";

export default function PendingOrderList({ 
    items, 
    role, 
    loading, 
    onUpdateQty, 
    onDelete, 
    onConfirm 
}) {
    if (items.length === 0) return null;

    // WAITER VIEW
    if (role === 'waiter') {
        return (
            <OrderSection
                title="New Orders (To Confirm)"
                count={items.length}
                accentColor="orange"
                icon={<FaClock />}
            >
                <div className="space-y-3">
                    {items.map((item) => (
                        <SwipeableOrderItem
                            key={item.id}
                            item={item}
                            isPending={true}
                            onUpdateQty={onUpdateQty}
                            onDelete={onDelete}
                        />
                    ))}
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="w-full mt-4 py-4 bg-[#ea7c69] hover:bg-[#d96b58] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-orange-900/30"
                    >
                        <FaCheck className="text-xl" /> CONFIRM & SEND TO KITCHEN
                    </button>
                </div>
            </OrderSection>
        );
    }

    // CASHIER VIEW
    if (role === 'cashier') {
        return (
            <OrderSection
                title="Pending (Waiter Review)"
                count={items.length}
                accentColor="gray"
                icon={<FaClock />}
            >
                <div className="space-y-3 opacity-80">
                    {items.map(item => (
                        <SwipeableOrderItem key={item.id} item={item} isPending={true} onUpdateQty={onUpdateQty} onDelete={onDelete} />
                    ))}
                    <button
                        onClick={onConfirm}
                        className="w-full mt-4 py-4 bg-[#ea7c69] hover:bg-[#d96b58] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-orange-900/30"
                    >
                        <FaCheck className="text-xl" /> SEND TO KITCHEN
                    </button>
                </div>
            </OrderSection>
        );
    }
    
    return null;
}
