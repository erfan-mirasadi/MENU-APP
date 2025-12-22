import {
  RiHome6Line,
  RiPieChartLine,
  RiMailLine,
  RiNotification3Line,
  RiSettings4Line,
  RiLogoutBoxRLine,
} from "react-icons/ri";
import { BiSolidOffer } from "react-icons/bi";

export const NAV_LINKS = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: RiHome6Line,
  },
  {
    name: "Orders",
    path: "/admin/orders",
    icon: RiPieChartLine,
  },
  {
    name: "Offers",
    path: "/admin/offers",
    icon: BiSolidOffer,
  },
  {
    name: "Messages",
    path: "/admin/messages",
    icon: RiMailLine,
  },
  {
    name: "Notifications",
    path: "/admin/notifications",
    icon: RiNotification3Line,
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: RiSettings4Line,
  },
];
