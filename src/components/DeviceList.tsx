import { TextAttributes } from "@opentui/core";
import type { BluetoothDevice } from "../types";

type DeviceListProps = {
  devices: BluetoothDevice[];
  selectedIndex?: number;
  showEmpty?: boolean;
};

function getDeviceIcon(device: BluetoothDevice): string {
  if (device.icon) {
    const iconMap: Record<string, string> = {
      "audio-card": "🎧",
      "computer": "💻",
      "phone": "📱",
      "input-keyboard": "⌨️",
      "input-mouse": "🖱️",
      "input-gaming": "🎮",
    };
    return iconMap[device.icon] || "📟";
  }
  return "📟";
}

export function DeviceList({ devices, selectedIndex, showEmpty = true }: DeviceListProps) {
  if (devices.length === 0 && showEmpty) {
    return (
      <box marginTop={1}>
        <text attributes={TextAttributes.DIM} fg="gray">
          No devices found
        </text>
      </box>
    );
  }

  return (
    <box flexDirection="column" marginTop={1}>
      {devices.map((device, index) => {
        const isSelected = selectedIndex !== undefined && index === selectedIndex;
        const displayName = device.name || "Unknown Device";
        const icon = getDeviceIcon(device);

        return (
          <box key={device.address} marginBottom={1} flexDirection="column">
            <text
              attributes={isSelected ? TextAttributes.BOLD : TextAttributes.NONE}
              fg={isSelected ? "green" : "white"}
            >
              {isSelected ? "► " : "  "}
              {icon} {displayName}
            </text>
            <box flexDirection="column" marginLeft={2}>
              <text attributes={TextAttributes.DIM} fg="gray">
                {device.address}
                {device.rssi !== undefined ? ` (${device.rssi} dBm)` : ""}
                {device.paired ? " [Paired]" : ""}
                {device.connected ? " [Connected]" : ""}
              </text>
            </box>
          </box>
        );
      })}
    </box>
  );
}
