"use client";

import { useEffect } from "react";
import { FaPrint } from "react-icons/fa";
import toast from "react-hot-toast";

// Hooks
import { useOrderDrawerLogic } from "@/app/hooks/useOrderDrawerLogic";

// Sub-Components
import DrawerHeader from "./DrawerHeader";
import DrawerFooter from "./DrawerFooter";
import DrawerEmptyState from "./DrawerEmptyState";
import PendingOrderList from "./PendingOrderList";
import ConfirmedOrderList from "./ConfirmedOrderList";
import ActiveOrderList from "./ActiveOrderList";

// Shared Modals (Outside of this folder)
import MenuModal from "../MenuModal";
import PaymentModal from "../PaymentModal";
import VoidReasonModal from "../VoidReasonModal";

export default function OrderDrawer({ 
    table, 
    session, 
    isOpen, 
    onClose, 
    role = "waiter", 
    onCheckout 
}) {
    const { state, setters, actions } = useOrderDrawerLogic(session, table, onCheckout, role);
    const {
        loading, localItems, pendingItems, confirmedItems, activeItems, totalAmount,
        isMenuOpen, isPaymentModalOpen, isVoidModalOpen, itemToVoid, isBatchEditing, batchItems
    } = state;

    // Scroll Lock
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen || !table) return null;

    return (
        <>
            <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity animate-in fade-in" />

            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#1F1D2B] z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                
                <DrawerHeader
                    table={table}
                    session={session}
                    onClose={onClose}
                    onOpenMenu={() => setters.setIsMenuOpen(true)}
                    onCloseTable={actions.handleForceCloseTable}
                />

                {role === 'cashier' && (
                    <div className="bg-[#252836] p-2 flex justify-end px-4 border-b border-white/5">
                        <button 
                            onClick={() => toast('Print feature coming soon', { icon: '🖨️' })}
                            className="flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-gray-300 transition-colors"
                        >
                            <FaPrint /> Print Bill
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-8 bg-[#1F1D2B]">
                    {!session ? (
                        <DrawerEmptyState 
                            onStartSession={actions.handleStartSession} 
                            loading={loading} 
                        />
                    ) : (
                        <>
                            {/* 1. Pending Items (Both roles see them differently) */}
                            <PendingOrderList
                                items={pendingItems}
                                role={role}
                                loading={loading}
                                onUpdateQty={actions.onUpdateQty}
                                onDelete={actions.onDeleteItem}
                                onConfirm={
                                    role === 'cashier' 
                                        ? actions.handleCashierInstantSend 
                                        : actions.handleConfirmOrder
                                }
                            />

                            {/* 2. Confirmed Items (Cashier specific usually) */}
                            <ConfirmedOrderList
                                items={confirmedItems}
                                role={role}
                                loading={loading}
                                onUpdateQty={actions.onUpdateQty}
                                onDelete={actions.onDeleteItem}
                                onStartPreparing={actions.handleStartPreparing}
                            />

                            {/* 3. Active/Served Items (Both) */}
                            <ActiveOrderList
                                // Waiter: Merged (Confirmed + Active)
                                items={role === 'waiter' ? confirmedItems.concat(activeItems) : activeItems}
                                role={role}
                                isBatchEditing={isBatchEditing}
                                batchItems={batchItems}
                                onEditOrder={actions.handleStartBatchEdit}
                                onCancelEdit={actions.handleCancelBatchEdit}
                                onSaveEdit={actions.handleExecuteBatch}
                                onUpdateBatchQty={(id, qty) => setters.setBatchItems(p => p.map(i => i.id === id ? {...i, quantity: qty} : i))}
                                onDeleteBatchItem={(id) => setters.setBatchItems(p => p.filter(i => i.id !== id))}
                                onUpdateQty={actions.onUpdateQty}
                                onDelete={actions.onDeleteItem}
                            />
                        </>
                    )}
                </div>

                {session && (
                    <DrawerFooter
                        totalAmount={totalAmount}
                        onCloseTable={actions.handlePaymentRequest}
                        loading={loading}
                    />
                )}
            </div>

            {/* MODALS */}
            <MenuModal
                isOpen={isMenuOpen}
                onClose={() => setters.setIsMenuOpen(false)}
                cartItems={localItems}
                onAdd={actions.handleMenuAdd}
                onRemove={actions.handleMenuRemove}
                restaurantId={session?.restaurant_id}
            />

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setters.setIsPaymentModalOpen(false)}
                session={session ? {...session, table } : null}
                onCheckout={async (sid, method, amt) => {
                    const success = await actions.handleCheckoutWrapper(sid, method, amt);
                    if (success) onClose();
                }}
            />

            <VoidReasonModal
                isOpen={isVoidModalOpen}
                onClose={() => setters.setIsVoidModalOpen(false)}
                onConfirm={actions.handleConfirmVoid}
                item={itemToVoid}
            />
        </>
    );
}
