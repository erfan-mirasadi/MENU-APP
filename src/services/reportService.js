import { supabase } from "@/lib/supabase";

const getDateRanges = (range) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let currentStart, previousStart, previousEnd;

  switch (range) {
    case "Today":
      currentStart = today;
      previousStart = new Date(today);
      previousStart.setDate(today.getDate() - 1); // Yesterday
      previousEnd = today;
      break;
    case "Week":
      currentStart = new Date(today);
      currentStart.setDate(today.getDate() - 7);
      previousStart = new Date(currentStart);
      previousStart.setDate(currentStart.getDate() - 7); // Previous 7 days
      previousEnd = currentStart;
      break;
    case "Month":
      currentStart = new Date(today);
      currentStart.setMonth(today.getMonth() - 1);
      previousStart = new Date(currentStart);
      previousStart.setMonth(currentStart.getMonth() - 1); // Previous month
      previousEnd = currentStart;
      break;
    default: // Default to Month
      currentStart = new Date(today);
      currentStart.setMonth(today.getMonth() - 1);
      previousStart = new Date(currentStart);
      previousStart.setMonth(currentStart.getMonth() - 1);
      previousEnd = currentStart;
  }
  return { 
      currentStart: currentStart.toISOString(), 
      previousStart: previousStart.toISOString(), 
      previousEnd: previousEnd.toISOString() 
  };
};

// Helper to calculate percentage change
const calculateTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

export const reportService = {
  async getStats(range) {
    const { currentStart, previousStart, previousEnd } = getDateRanges(range);

    // 1. Fetch Current Data
    const { data: currentItems, error: currentError } = await supabase
      .from("order_items")
      .select("quantity, unit_price_at_order")
      .neq("status", "cancelled")
      .gte("created_at", currentStart);

    const { count: currentCustomers } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", currentStart);

    // 2. Fetch Previous Data
    const { data: previousItems } = await supabase
      .from("order_items")
      .select("quantity, unit_price_at_order")
      .neq("status", "cancelled")
      .gte("created_at", previousStart)
      .lt("created_at", previousEnd);

    const { count: previousCustomers } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", previousStart)
      .lt("created_at", previousEnd);

    // 3. Calculate Aggregates
    const calculateMetrics = (items) => {
        if (!items) return { revenue: 0, dishes: 0 };
        return items.reduce((acc, item) => ({
            revenue: acc.revenue + (item.quantity * (parseFloat(item.unit_price_at_order) || 0)),
            dishes: acc.dishes + item.quantity
        }), { revenue: 0, dishes: 0 });
    };

    const currentMetrics = calculateMetrics(currentItems);
    const previousMetrics = calculateMetrics(previousItems);

    return {
      revenue: {
          value: currentMetrics.revenue,
          trend: calculateTrend(currentMetrics.revenue, previousMetrics.revenue)
      },
      dishes: {
          value: currentMetrics.dishes,
          trend: calculateTrend(currentMetrics.dishes, previousMetrics.dishes)
      },
      customers: {
          value: currentCustomers || 0,
          trend: calculateTrend(currentCustomers || 0, previousCustomers || 0)
      }
    };
  },

  async getRecentOrders(range) {
    const { currentStart } = getDateRanges(range);
    const startDate = currentStart;

    // 1. Fetch orders without trying to join profiles on the missing FK
    const { data: orders, error } = await supabase
      .from("order_items")
      .select(`
        *,
        products (title, image_url)
      `)
      .gte("created_at", startDate)
      .order("created_at", { ascending: false })
      .limit(10); 

    if (error) {
      console.error("Error fetching recent orders:", error);
      return [];
    }

    if (!orders || orders.length === 0) return [];

    // 2. Extract distinct guest/user IDs to fetch their names manually
    const headerIds = [
        ...new Set(
            orders
            .map(o => o.added_by_guest_id)
            .filter(id => id) // remove nulls
        )
    ];

    let profilesMap = {};

    if (headerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", headerIds);
        
        if (!profilesError && profiles) {
            profiles.forEach(p => {
                profilesMap[p.id] = p.full_name;
            });
        }
    }

    // 3. Map orders to UI format
    return orders.map(order => ({
      id: order.id,
      customer: profilesMap[order.added_by_guest_id] || "Guest",
      avatar: null, 
      menu: order.products?.title?.en || "Unknown Item",
      total: (order.quantity * (parseFloat(order.unit_price_at_order) || 0)),
      status: order.status,
      created_at: order.created_at
    }));
  },

  async getTopSellingItems(range) {
     const { currentStart } = getDateRanges(range);
     
     // Supabase doesn't support aggregate "SUM(quantity) GROUP BY product_id" easily with SDK without RPC.
     // We'll fetch items and aggregate in JS for simplicity unless dataset is huge (Cashier dashboard implies daily active usage, shouldn't be massive in one day/week for client side agg).
     
     const { data, error } = await supabase
       .from("order_items")
       .select(`
         quantity,
         product_id,
         products (title, image_url)
       `)
       .neq("status", "cancelled")
       .gte("created_at", currentStart);

     if (error) return [];

     const aggregation = {};
     data.forEach(item => {
        const pid = item.product_id;
        if (!aggregation[pid]) {
            aggregation[pid] = {
                name: item.products?.title?.en || "Unknown",
                image: item.products?.image_url,
                count: 0
            };
        }
        aggregation[pid].count += item.quantity;
     });

     // Convert to array and sort
     return Object.values(aggregation)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
  },

  async getOrderTypes(range) {
      const { currentStart } = getDateRanges(range);
      
      // User said: "sessions table lacks type column, assume ALL are Dine In"
      // Return structure for Radial Chart: { 'Dine In': X, 'To Go': 0, 'Delivery': 0 }
      
      const { count, error } = await supabase
        .from("sessions")
        .select("*", { count: "exact", head: true })
        .gte("created_at", currentStart);

      return {
          "Dine In": count || 0,
          "To Go": 0,
          "Delivery": 0
      };
  }
};
