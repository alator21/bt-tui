import { TextAttributes } from "@opentui/core";
import type { BluetoothStatus } from "../types";

type HeaderProps = {
  bluetoothStatus: BluetoothStatus;
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

export function Header({ bluetoothStatus }: HeaderProps) {
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
    </box>
  );
}
