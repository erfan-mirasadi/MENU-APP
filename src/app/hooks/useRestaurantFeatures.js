import { useRestaurantData } from "./useRestaurantData";
import { useCallback } from "react";

export const useRestaurantFeatures = () => {
    // Now just a consumer of the pre-calculated singleton state
    const { features, loading } = useRestaurantData();

    // Stable helper function
    const isEnabled = useCallback((feature) => {
        return !!features[feature];
    }, [features]);

    return {
        features,
        loading,
        isEnabled
    };
};
