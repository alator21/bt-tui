import { TextAttributes } from "@opentui/core";
import type { BluetoothDevice } from "../types";
import { DeviceList } from "./DeviceList";

type PairedDevicesViewProps = {
  isLoading: boolean;
  devices: BluetoothDevice[];
  selectedDeviceIndex: number;
  onBack: () => void;
};

export function PairedDevicesView({ isLoading, devices, selectedDeviceIndex, onBack }: PairedDevicesViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      {/* Header */}
      <box flexDirection="column" marginBottom={1}>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          ╔════════════════════════════════════╗
        </text>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          ║         Paired Devices             ║
        </text>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          ╚════════════════════════════════════╝
        </text>
      </box>

      {/* Status */}
      <text attributes={TextAttributes.BOLD} marginBottom={1}>
        {isLoading ? "Loading..." : `Found ${devices.length} paired device${devices.length !== 1 ? "s" : ""}`}
      </text>

      {/* Device list */}
      <DeviceList devices={devices} selectedIndex={selectedDeviceIndex} showEmpty={!isLoading} />

      {/* Instructions */}
      <box marginTop={1}>
        <text attributes={TextAttributes.DIM} fg="gray">
          {isLoading
            ? "Please wait..."
            : "Press [R] to refresh • ↑/↓ to navigate • Enter to view • Esc/q to go back"}
        </text>
      </box>
    </box>
  );
}
