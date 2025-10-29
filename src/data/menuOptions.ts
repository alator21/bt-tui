import type { MenuOption } from "../types";

export const menuOptions: MenuOption[] = [
  { label: "Scan for devices", value: "scan" },
  { label: "List paired devices", value: "list" },
  { label: "Connect to device", value: "connect" },
  { label: "Disconnect from device", value: "disconnect" },
  { label: "Power on/off", value: "power" },
  { label: "Settings", value: "settings" },
  { label: "Exit", value: "exit" },
];
