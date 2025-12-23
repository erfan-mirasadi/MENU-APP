import {
  RiHome6Line,
  RiPieChartLine,
  RiMailLine,
  RiNotification3Line,
  RiLayoutMasonryLine,
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
    name: "Templates", // New Item for Appearance/Templates
    path: "/admin/templates",
    icon: RiLayoutMasonryLine,
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: RiSettings4Line,
  },
];

// export const navLinks = [
//   {
//     name: "Dashboard",
//     href: "/admin",
//     icon: "HomeIcon",
//     disabled: true
//   },
//   {
//     name: "Menu Management",
//     href: "/admin/dashboard",
//     icon: "MenuIcon",
//     disabled: false
//   },
//   {
//     name: "Orders",
//     href: "/admin/orders",
//     icon: "OrderIcon",
//     disabled: true
//   },
//   {
//     name: "Settings",
//     href: "/admin/settings",
//     icon: "CogIcon",
//     disabled: false
//   },
// ];
