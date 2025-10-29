export type MenuOption = {
  label: string;
  value: string;
};

export type AppStatus = "ready" | "scanning" | "connecting" | "error";

export type BluetoothStatus = "enabled" | "disabled" | "unknown";

export type BluetoothDevice = {
  address: string;
  name: string | null;
  paired: boolean;
  connected: boolean;
  trusted: boolean;
  rssi?: number;
  icon?: string;
};

export type Screen = "main" | "scan" | "pairedDevices" | "deviceDetail" | "settings";

// Error types for Bluetooth operations
export type BluetoothError =
  | { type: "command_not_found"; message: string }
  | { type: "command_failed"; message: string; exitCode?: number }
  | { type: "parse_error"; message: string }
  | { type: "unknown_error"; message: string };
