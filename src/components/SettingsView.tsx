import { TextAttributes } from "@opentui/core";

type SettingsViewProps = {
  isLoading: boolean;
  isDiscoverable: boolean;
  isPairable: boolean;
  scanDuration: number;
  autoTrustOnPair: boolean;
  onToggleDiscoverable: () => void;
  onTogglePairable: () => void;
  onChangeScanDuration: (duration: number) => void;
  onToggleAutoTrust: () => void;
  onBack: () => void;
};

export function SettingsView({
  isLoading,
  isDiscoverable,
  isPairable,
  scanDuration,
  autoTrustOnPair,
  onToggleDiscoverable,
  onTogglePairable,
  onChangeScanDuration,
  onToggleAutoTrust,
  onBack,
}: SettingsViewProps) {
  const scanDurations = [5000, 10000, 20000, 30000];
  const currentDurationIndex = scanDurations.indexOf(scanDuration);

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      {/* Header */}
      <box flexDirection="column" marginBottom={1}>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          ╔════════════════════════════════════╗
        </text>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          ║              Settings              ║
        </text>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          ╚════════════════════════════════════╝
        </text>
      </box>

      {isLoading ? (
        <text fg="yellow" marginBottom={1}>
          Loading settings...
        </text>
      ) : (
        <box flexDirection="column" marginBottom={2}>
          {/* Discoverable Mode */}
          <text attributes={TextAttributes.BOLD} marginBottom={1}>
            Bluetooth Adapter Settings:
          </text>

          <box flexDirection="column" marginBottom={1} marginLeft={2}>
            <text marginBottom={1}>
              <span fg="cyan">[1]</span>
              <span> Discoverable Mode: </span>
              {isDiscoverable ? (
                <span fg="green" attributes={TextAttributes.BOLD}>
                  ON
                </span>
              ) : (
                <span fg="red">OFF</span>
              )}
            </text>
            <text attributes={TextAttributes.DIM} fg="gray" marginBottom={1} marginLeft={4}>
              Allow other devices to see this computer
            </text>

            <text marginBottom={1}>
              <span fg="cyan">[2]</span>
              <span> Pairable Mode: </span>
              {isPairable ? (
                <span fg="green" attributes={TextAttributes.BOLD}>
                  ON
                </span>
              ) : (
                <span fg="red">OFF</span>
              )}
            </text>
            <text attributes={TextAttributes.DIM} fg="gray" marginBottom={1} marginLeft={4}>
              Allow new devices to pair with this computer
            </text>
          </box>

          {/* App Settings */}
          <text attributes={TextAttributes.BOLD} marginBottom={1}>
            Application Settings:
          </text>

          <box flexDirection="column" marginBottom={1} marginLeft={2}>
            <text marginBottom={1}>
              <span fg="cyan">[3]</span>
              <span> Scan Duration: </span>
              <span fg="yellow" attributes={TextAttributes.BOLD}>
                {scanDuration / 1000}s
              </span>
            </text>
            <text attributes={TextAttributes.DIM} fg="gray" marginBottom={1} marginLeft={4}>
              Press [3] to cycle: 5s → 10s → 20s → 30s
            </text>

            <text marginBottom={1}>
              <span fg="cyan">[4]</span>
              <span> Auto-trust on Pair: </span>
              {autoTrustOnPair ? (
                <span fg="green" attributes={TextAttributes.BOLD}>
                  ON
                </span>
              ) : (
                <span fg="red">OFF</span>
              )}
            </text>
            <text attributes={TextAttributes.DIM} fg="gray" marginBottom={1} marginLeft={4}>
              Automatically trust devices after pairing (helps with audio)
            </text>
          </box>
        </box>
      )}

      {/* Instructions */}
      <box marginTop={1}>
        <text attributes={TextAttributes.DIM} fg="gray">
          Press [1-4] to toggle settings • Esc/q to go back
        </text>
      </box>
    </box>
  );
}
