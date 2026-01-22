# Project Architecture / مستندات معماری پروژه

**Status:** Final Technical Reference / مرجع فنی نهایی
**Last Updated:** 2026-01-18

---

## 🇬🇧 English Documentation

### 1. Project Overview
This project is a high-scale **B2B SaaS Restaurant Management Platform** designed to support hundreds of restaurants simultaneously. It is not a single-tenant application; rather, it uses a multi-tenant architecture where all data is strictly isolated by `restaurant_id`.

**Key Technologies:**
*   **Framework:** Next.js (App Router)
*   **Database & Auth:** Supabase (PostgreSQL, Auth, Realtime/Websockets)
*   **3D Graphics:** Three.js (used for 3D Menus in the Client App and Cashier Dashboard)
*   **Styling:** TailwindCSS

### 2. Core Applications
The codebase is a monorepo containing 4 distinct applications, each serving a specific user role:

1.  **Client/User App (`/[slug]`):** End customers scan QR codes to view 3D menus and place group orders via synchronous carts.
2.  **Waiter App (`/waiter`):** Staff receive real-time notifications, manage table status, and confirm orders for the kitchen.
3.  **Cashier App (`/cashier`):** Cashiers validate orders, handle complex split-check payments, and finalize table sessions.
4.  **Kitchen App (`/chef`):** Chefs view incoming orders in real-time, grouped by table, and marks them as 'Ready' (served) or 'Preparing'.
5.  **Admin (Owner) App (`/admin`):** Owners manage menus, generate QR codes, view business analytics, and **toggle system modules**.

### 3. Codebase Architecture & Data Flow
The project follows a strict **Service-Repository Pattern** to ensure separation of concerns and maintainability.

#### A. Service Layer (`src/services/*.js`)
**All** interactions with Supabase (fetching, inserting, updating) occur exclusively within these service files. Components never call Supabase directly.
*   **`orderService.js`**: Handles `items` creation, status updates, and kitchen confirmation.
*   **`cashierService.js`**: Manages billing calculations and transaction recording.
*   **`waiterService.js`**: Optimized queries for the waiter dashboard.
*   **`sessionService.js`**: Manages the lifecycle of a dining session.
*   **Constraint:** Every function in these services **MUST** require and filter by `restaurant_id` to enforce multi-tenancy.

#### B. Custom Hooks (`src/hooks/*.js`)
React components consume data *only* via custom hooks, which in turn call the Service Layer.
*   **`useRealtimeOrders`**: Subscribes to Supabase channels to push updates to the UI without manual refreshing.
*   **`useCashierData`**: Aggregates data from multiple services to populate the cashier dashboard.

#### C. UI Components
Components are purely presentational logic. They receive data via hooks and trigger actions by calling exposed handler functions from those hooks.

### 4. Key Workflows

#### A. Real-time Logic & Table Locking
Supabase Realtime Channels are utilized to keep all users in sync.
*   **Cart Sync:** When multiple users scan the same QR code (`table_id`), they join the same `session`. Any change to `order_items` triggers a broadcast to all users in that session, updating their local cart state instantly.
*   **Table Locking:** To prevent "Double Booking" or "Ghost Orders," critical actions (like Checkout) verify the latest session status via an atomic database transaction or specific status checks before proceeding.

#### B. Checkout Logic (`CheckoutModal`)
The checkout process is a critical financial flow managed by the Cashier App:
1.  **Calculate Total:** The system sums all `confirmed` and `served` items for the session provided by `bills`.
2.  **Create Transaction:** A record is added to `transactions` table with method (Cash/Card).
3.  **Update Bill:** The `paid_amount` and `remaining_amount` in the `bills` table are updated.
4.  **Session Update:** If `remaining_amount` is 0, the `session` status updates to `closed`.
5.  **Close Table:** The `tables` record may be updated to reflect availability (visual change on dashboard).

### 5. Database Dictionary (Source of Truth)

| Table Name | Column Name | Data Type | Relationship / Note |
| :--- | :--- | :--- | :--- |
| **`restaurants`** | `id` | `uuid` | **Primary Key**. Root tenant record. |
| | `slug` | `text` | Unique URL identifier for the restaurant. |
| | `owner_id` | `uuid` | Link to `auth.users`. |
| **`profiles`** | `restaurant_id` | `uuid` | FK -> `restaurants.id`. Links global users to specific tenants. |
| | `role` | `text` | 'owner', 'waiter', 'cashier'. |
| **`tables`** | `qr_token` | `text` | Unique token embedded in the physical QR code. |
| | `layout_data` | `jsonb` | Coordinates for 3D floor plan visualization. |
| **`sessions`** | `status` | `text` | `ordering`, `waiting_payment`, `closed`. |
| | `last_active` | `timestamp` | Used for auto-closing stale sessions. |
| **`order_items`** | `session_id` | `uuid` | FK -> `sessions.id`. |
| | `product_id` | `uuid` | FK -> `products.id`. |
| | `unit_price_at_order` | `numeric` | **Critical:** Snapshots price at time of order to prevent history changes if menu price is edited. |
| | `status` | `text` | `draft`, `pending`, `confirmed`, `served`, `cancelled`. |
| **`bills`** | `session_id` | `uuid` | FK -> `sessions.id`. One bill per session. |
| | `total_amount` | `numeric` | Cached total. |
| | `remaining_amount` | `numeric` | Calculated field. |
| **`transactions`** | `bill_id` | `uuid` | FK -> `bills.id`. |
| | `amount` | `numeric` | Payment amount. |
| | `method` | `USER-DEFINED` | Cash, Card, etc. |
| **`products`** | `price` | `numeric` | Current menu price. |
| | `model_url` | `text` | URL to 3D GLB file. |
| **`activity_logs`** | `action` | `text` | e.g., 'VOID_ITEM', 'FORCE_CLOSE_TABLE'. |
| | `user_id` | `uuid` | Who performed the action (for audit). |
| | `details` | `jsonb` | Snapshot of data before change. |

### 6. Security & Multi-Tenancy Architecture
1.  **Strict Isolation:** *Every single* service function (`find`, `create`, `update`) MUST include a `WHERE restaurant_id = X` clause. We do not rely solely on client-side filtering.
2.  **Row Level Security (RLS):** Supabase RLS policies are the last line of defense, ensuring that a user from Restaurant A cannot query data from Restaurant B even if the API is exploited.
3.  **Auditing:** Sensitive actions (like deleting an order item after it has been cooked) are recorded in `activity_logs` with the actor's IP and User ID to prevent fraud.

### 7. Modular Feature System (Feature Flags)
The system supports enabling/disabling core modules per restaurant via the Admin Panel:
*   **Modules:** `waiter`, `cashier`, `kitchen`.
*   **Ordering System Logic:** The customer's ability to place orders (`ordering_enabled`) is **automatically derived**:
    *   **TRUE:** If at least one module (Waiter/Cashier/Kitchen) is enabled.
    *   **FALSE:** If ALL modules are disabled (Draft Mode / Wishlist only).
*   **Architecture:** Flags are stored in `restaurants.features` (JSONB) and consumed via `useRestaurantFeatures` hook and `FeatureGuard` component.

---

## 🇮🇷 مستندات فارسی (Persian Documentation)

### ۱. نمای کلی پروژه
این پروژه یک **پلتفرم مدیریت رستوران B2B SaaS** با مقیاس بالا است. معماری آن به صورت چند مستاجری (Multi-Tenant) بوده و تمامی داده‌ها بر اساس `restaurant_id` ایزوله می‌شوند.

### ۲. معماری کدبیس و جریان داده (Codebase Architecture)
ما از الگوی **Service-Repository** برای مدیریت داده‌ها استفاده می‌کنیم:

#### الف- لایه سرویس (`src/services/*.js`)
تمامی درخواست‌ها به Supabase (خواندن/نوشتن) **فقط** در این فایل‌ها انجام می‌شود. هیچ کامپوننتی مستقیماً با دیتابیس صحبت نمی‌کند.
*   **`orderService.js`**: مدیریت چرخه حیات سفارش.
*   **`cashierService.js`**: محاسبات مالی و تراکنش‌ها.
*   **نکته مهم:** تمام توابع این سرویس‌ها باید `restaurant_id` را به عنوان فیلتر اصلی دریافت کنند.

#### ب- هوک‌های اختصاصی (`src/hooks/*.js`)
کامپوننت‌های UI داده‌ها را از طریق هوک‌ها دریافت می‌کنند. مثلاً `useRealtimeOrders` برای دریافت تغییرات آنی سفارش‌ها بدون نیاز به رفرش صفحه استفاده می‌شود.

### ۳. دیکشنری دیتابیس (Database Dictionary)

| نام جدول | نام ستون | نوع داده | توضیحات / رابطه |
| :--- | :--- | :--- | :--- |
| **`restaurants`** | `id` | `uuid` | کلید اصلی. شناسه یکتای هر رستوران. |
| | `slug` | `text` | آدرس یکتا در URL. |
| **`tables`** | `qr_token` | `text` | توکن موجود در QR Code روی میز. |
| **`sessions`** | `status` | `text` | وضعیت نشست (`ordering`, `waiting_payment`, `closed`). |
| **`order_items`** | `product_id` | `uuid` | لینک به محصول. |
| | `unit_price_at_order` | `numeric` | **حیاتی:** قیمت محصول در لحظه ثبت سفارش ذخیره می‌شود تا تغییر قیمت منو روی سفارش‌های باز تاثیر نگذارد. |
| | `status` | `text` | وضعیت آیتم (`draft` پیش‌نویس, `confirmed` تایید شده, `served` سرو شده). |
| **`bills`** | `total_amount` | `numeric` | مبلغ کل صورتحساب. |
| | `remaining_amount` | `numeric` | مبلغ باقی‌مانده برای پرداخت. |
| **`transactions`** | `method` | `USER-DEFINED` | روش پرداخت (نقد، کارت). |
| **`activity_logs`** | `details` | `jsonb` | جزئیات دقیق عملیات حساس (مثلاً حذف غذا) برای جلوگیری از کلاهبرداری. |

### ۴. جریان‌های کاری کلیدی (Workflows)

#### الف- لاجیک Real-time و قفل کردن میز
*   **همگام‌سازی سبد خرید:** تمامی افرادی که QR یک میز را اسکن کنند، وارد یک `session` مشترک می‌شوند. به محض اینکه یک نفر آیتمی اضافه کند، Supabase Realtime آن را به سبد خرید بقیه افراد می‌فرستد.
*   **قفل کردن (Table Locking):** برای جلوگیری از تداخل (مثلاً پرداخت همزمان دو گارسون برای یک میز)، سیستم وضعیت سشن را قبل از هر تراکنش چک می‌کند.

#### ب- پروسه تسویه حساب (Checkout)
در `CheckoutModal` اتفاقات زیر می‌افتد:
1.  **محاسبه:** جمع کل آیتم‌های تایید شده/سرو شده.
2.  **تراکنش:** ثبت رکورد در `transactions`.
3.  **آپدیت صورتحساب:** کسر مبلغ پرداخت شده از `bills`.
4.  **خاتمه:** اگر مبلغ باقی‌مانده ۰ شد، وضعیت سشن به `closed` تغییر می‌کند و میز آزاد می‌شود.

### ۵. امنیت و چند مستاجری
1.  **ایزولاسیون:** تمامی توابع دیتابیس باید شرط `WHERE restaurant_id = ...` را داشته باشند.
2.  **Activity Logs:** تمامی عملیات حساس (مثل Void کردن سفارش) با ذکر نام کاربر و جزئیات در `activity_logs` ثبت می‌شود تا قابل پیگیری باشد.

### ۶. سیستم ماژولار (Modular Features)
ادمین می‌تواند ماژول‌های اصلی (گارسون، صندوقدار، آشپزخانه) را خاموش/روشن کند:
*   **منطق خودکار سفارش‌دهی:** قابلیت سفارش مشتری (`ordering_enabled`) به صورت خودکار محاسبه می‌شود:
    *   **روشن:** اگر حداقل یکی از ماژول‌ها روشن باشد.
    *   **خاموش:** اگر همه ماژول‌ها خاموش باشند (حالت نمایشی/Draft).
