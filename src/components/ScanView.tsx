import { TextAttributes } from "@opentui/core";
import type { BluetoothDevice } from "../types";
import { DeviceList } from "./DeviceList";

type ScanViewProps = {
  isScanning: boolean;
  progress: number;
  duration: number;
  devices: BluetoothDevice[];
  selectedDeviceIndex: number;
  onBack: () => void;
};

function ProgressBar({ progress, total }: { progress: number; total: number }) {
  const percentage = Math.min(100, Math.floor((progress / total) * 100));
  const barWidth = 40;
  const filledWidth = Math.floor((barWidth * percentage) / 100);
  const emptyWidth = barWidth - filledWidth;

  return (
    <box flexDirection="column" marginBottom={1}>
      <text fg="cyan">
        Scanning... {percentage}%
      </text>
      <text>
        <span fg="green">{"█".repeat(filledWidth)}</span>
        <span fg="gray" attributes={TextAttributes.DIM}>
          {"░".repeat(emptyWidth)}
        </span>
      </text>
      <text attributes={TextAttributes.DIM} fg="gray">
        {(progress / 1000).toFixed(1)}s / {(total / 1000).toFixed(1)}s
      </text>
    </box>
  );
}

export function ScanView({ isScanning, progress, duration, devices, selectedDeviceIndex, onBack }: ScanViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      {/* Header */}
      <box flexDirection="column" marginBottom={1}>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          ╔════════════════════════════════════╗
        </text>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          ║        Scanning for Devices        ║
        </text>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          ╚════════════════════════════════════╝
        </text>
      </box>

      {/* Progress bar */}
      {isScanning && <ProgressBar progress={progress} total={duration} />}

      {/* Status */}
      <text attributes={TextAttributes.BOLD} marginBottom={1}>
        {isScanning ? "Scanning..." : "Scan Complete"} ({devices.length} device{devices.length !== 1 ? "s" : ""} found)
      </text>

      {/* Device list */}
      <DeviceList devices={devices} selectedIndex={selectedDeviceIndex} showEmpty={!isScanning} />

      {/* Instructions */}
      <box marginTop={1}>
        <text attributes={TextAttributes.DIM} fg="gray">
          {isScanning
            ? "Press [S] to stop scan • ↑/↓ to navigate • Enter to view • Esc/q to go back"
            : "Press [R] to rescan • ↑/↓ to navigate • Enter to view • Esc/q to go back"}
        </text>
      </box>
    </box>
  );
}
