import { TextAttributes } from "@opentui/core";
import type { BluetoothDevice } from "../types";

type DeviceDetailViewProps = {
  device: BluetoothDevice;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onPair: () => void;
  onRemove: () => void;
  onTrust: () => void;
  onBack: () => void;
};

function getDeviceIcon(device: BluetoothDevice): string {
  if (device.icon) {
    const iconMap: Record<string, string> = {
      "audio-card": "[♪]",
      "computer": "[≡]",
      "phone": "[☎]",
      "input-keyboard": "[⌨]",
      "input-mouse": "[⌘]",
      "input-gaming": "[◊]",
    };
    return iconMap[device.icon] || "[•]";
  }
  return "[•]";
}

export function DeviceDetailView({
  device,
  isConnecting,
  onConnect,
  onDisconnect,
  onPair,
  onRemove,
  onTrust,
  onBack,
}: DeviceDetailViewProps) {
  const icon = getDeviceIcon(device);
  const displayName = device.name || "Unknown Device";

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      {/* Header */}
      <box flexDirection="column" marginBottom={1}>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          ╔════════════════════════════════════╗
        </text>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          ║         Device Information         ║
        </text>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          ╚════════════════════════════════════╝
        </text>
      </box>

      {/* Device Info */}
      <box flexDirection="column" marginBottom={2}>
        <text attributes={TextAttributes.BOLD} fg="white" marginBottom={1}>
          {icon} {displayName}
        </text>

        <text attributes={TextAttributes.DIM} fg="gray" marginBottom={1}>
          Address: {device.address}
        </text>

        {device.icon ? (
          <text attributes={TextAttributes.DIM} fg="gray" marginBottom={1}>
            Type: {device.icon}
          </text>
        ) : null}

        {device.rssi !== undefined ? (
          <text attributes={TextAttributes.DIM} fg="gray" marginBottom={1}>
            Signal Strength: {device.rssi} dBm
          </text>
        ) : null}

        <text marginBottom={1}>
          <span attributes={TextAttributes.DIM} fg="gray">
            Status:{" "}
          </span>
          {device.connected ? (
            <span fg="green" attributes={TextAttributes.BOLD}>
              Connected
            </span>
          ) : device.paired ? (
            <span fg="blue">Paired</span>
          ) : (
            <span fg="gray">Not Paired</span>
          )}
        </text>

        <text marginBottom={1}>
          <span attributes={TextAttributes.DIM} fg="gray">
            Trusted:{" "}
          </span>
          {device.trusted ? (
            <span fg="green">Yes</span>
          ) : (
            <span fg="yellow">No</span>
          )}
        </text>
      </box>

      {/* Actions */}
      <text attributes={TextAttributes.BOLD} marginBottom={1}>
        Available Actions:
      </text>

      <box flexDirection="column" marginBottom={1}>
        {!device.paired ? (
          <text marginBottom={1}>
            <span fg="blue">[P]</span> Pair device (establish trust - do this first)
          </text>
        ) : null}

        {!device.trusted ? (
          <text marginBottom={1}>
            <span fg="yellow">[T]</span> Trust device (helps with auto-connect and audio profiles)
          </text>
        ) : null}

        {device.paired && !device.connected ? (
          <text marginBottom={1}>
            <span fg="green">[C]</span> Connect to device (start using it)
          </text>
        ) : null}

        {device.connected ? (
          <text marginBottom={1}>
            <span fg="red">[D]</span> Disconnect (stop using, but stay paired)
          </text>
        ) : null}

        {device.paired ? (
          <text marginBottom={1}>
            <span fg="red">[R]</span> Remove (forget device completely)
          </text>
        ) : null}
      </box>

      {/* Help text */}
      {!device.paired ? (
        <box flexDirection="column" marginBottom={1} marginTop={1}>
          <text attributes={TextAttributes.DIM} fg="yellow">
            [i] First time? Press [P] to pair, then [T] to trust, then [C] to connect
          </text>
        </box>
      ) : null}

      {device.paired && !device.trusted ? (
        <box flexDirection="column" marginBottom={1} marginTop={1}>
          <text attributes={TextAttributes.DIM} fg="yellow">
            [i] Audio issues? Press [T] to trust device for better profile management
          </text>
        </box>
      ) : null}

      {/* Status message */}
      {isConnecting ? (
        <text fg="yellow" marginBottom={1}>
          Processing...
        </text>
      ) : null}

      {/* Instructions */}
      <box marginTop={1}>
        <text attributes={TextAttributes.DIM} fg="gray">
          Press the key in brackets to perform action, Esc/q to go back
        </text>
      </box>
    </box>
  );
}
