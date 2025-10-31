import { TextAttributes } from "@opentui/core";
import type { BluetoothStatus, BluetoothDevice } from "../types";

type HeaderProps = {
  bluetoothStatus: BluetoothStatus;
  connectedDevice?: BluetoothDevice | null;
};

const getStatusColor = (status: BluetoothStatus): string => {
  switch (status) {
    case "enabled":
      return "green";
    case "disabled":
      return "red";
    case "unknown":
      return "yellow";
  }
};

const getStatusIcon = (status: BluetoothStatus): string => {
  switch (status) {
    case "enabled":
      return "●";
    case "disabled":
      return "○";
    case "unknown":
      return "◐";
  }
};

export function Header({ bluetoothStatus, connectedDevice }: HeaderProps) {
  const statusColor = getStatusColor(bluetoothStatus);
  const statusIcon = getStatusIcon(bluetoothStatus);

  return (
    <box flexDirection="column" marginBottom={1}>
      <text attributes={TextAttributes.BOLD} fg="cyan">
        ╔════════════════════════════════════╗
      </text>
      <text attributes={TextAttributes.BOLD} fg="cyan">
        ║     Bluetooth Manager TUI          ║
      </text>
      <text attributes={TextAttributes.BOLD} fg="cyan">
        ╚════════════════════════════════════╝
      </text>
      <box marginTop={1}>
        <text attributes={TextAttributes.DIM}>Bluetooth: </text>
        <text attributes={TextAttributes.BOLD} fg={statusColor}>
          {statusIcon} {bluetoothStatus.toUpperCase()}
        </text>
      </box>
      {connectedDevice && (
        <box marginTop={0}>
          <text attributes={TextAttributes.DIM}>Connected: </text>
          <text attributes={TextAttributes.BOLD} fg="green">
            ♪ {connectedDevice.name || "Unknown Device"}
          </text>
        </box>
      )}
    </box>
  );
}
