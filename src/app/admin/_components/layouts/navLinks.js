import {
  RiHome6Line,
  RiPieChartLine,
  RiMailLine,
  RiNotification3Line,
  RiLayoutMasonryLine,
  RiLayoutGridLine,
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
  // {
  //   name: "Orders",
  //   path: "/admin/orders",
  //   icon: RiPieChartLine,
  // },
  {
    name: "Offers",
    path: "/admin/offers",
    icon: BiSolidOffer,
  },
  // {
  //   name: "Messages",
  //   path: "/admin/messages",
  //   icon: RiMailLine,
  // },
  // {
  //   name: "Notifications",
  //   path: "/admin/notifications",
  //   icon: RiNotification3Line,
  // },
  {
    name: "Tables",
    path: "/admin/tables",
    icon: RiLayoutGridLine,
  },
  {
    name: "Templates", 
    path: "/admin/templates",
    icon: RiLayoutMasonryLine,
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: RiSettings4Line,
  },
];