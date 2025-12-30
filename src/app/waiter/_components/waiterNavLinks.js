import {
  RiLayoutGridLine, // Dashboard (Tables)
  RiHistoryLine, // Order History
  RiUserSettingsLine, // Profile
  RiLogoutBoxRLine,
} from "react-icons/ri";

export const WAITER_LINKS = [
  {
    name: "Floor",
    path: "/waiter/dashboard",
    icon: RiLayoutGridLine,
  },
  // {
  //   name: "History",
  //   path: "/waiter/history", // (اگه بعدا خواستی اضافه کنی)
  //   icon: RiHistoryLine,
  // },
  // {
  //   name: "Profile",
  //   path: "/waiter/profile", // (برای تغییر پسورد و...)
  //   icon: RiUserSettingsLine,
  // },
];
