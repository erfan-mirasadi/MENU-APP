import {
  RiHome6Line,
  RiLayoutMasonryLine,
  RiLayoutGridLine,
  RiSettings4Line,
} from "react-icons/ri";
import { BiSolidOffer } from "react-icons/bi";

export const NAV_LINKS = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: RiHome6Line,
  },
  {
    name: "Offers",
    path: "/admin/offers",
    icon: BiSolidOffer,
  },
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