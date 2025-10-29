import { Result, ok, err, ResultAsync, errAsync } from "neverthrow";
import type { BluetoothStatus, BluetoothError, BluetoothDevice } from "../types";

/**
 * Execute a command and return the output
 */
async function executeCommand(
  command: string[]
): Promise<Result<string, BluetoothError>> {
  try {
    const proc = Bun.spawn(command, {
      stdout: "pipe",
      stderr: "pipe",
    });

    const output = await new Response(proc.stdout).text();
    const errorOutput = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      return err({
        type: "command_failed",
        message: errorOutput || `Command failed with exit code ${exitCode}`,
        exitCode,
      });
    }

    return ok(output);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("ENOENT") || error.message.includes("not found")) {
        return err({
          type: "command_not_found",
          message: `Command not found: ${command[0]}`,
        });
      }
      return err({
        type: "unknown_error",
        message: error.message,
      });
    }
    return err({
      type: "unknown_error",
      message: "Unknown error occurred",
    });
  }
}

/**
 * Parse bluetoothctl show output to determine status
 */
function parseBluetoothStatus(output: string): Result<BluetoothStatus, BluetoothError> {
  if (output.includes("Powered: yes")) {
    return ok("enabled");
  } else if (output.includes("Powered: no")) {
    return ok("disabled");
  }

  return err({
    type: "parse_error",
    message: "Could not parse Bluetooth status from output",
  });
}

/**
 * Parse rfkill output to determine status
 */
function parseRfkillStatus(output: string): Result<BluetoothStatus, BluetoothError> {
  const softBlocked = output.includes("Soft blocked: yes");
  const hardBlocked = output.includes("Hard blocked: yes");

  if (!softBlocked && !hardBlocked) {
    return ok("enabled");
  } else if (softBlocked || hardBlocked) {
    return ok("disabled");
  }

  return err({
    type: "parse_error",
    message: "Could not parse rfkill status from output",
  });
}

/**
 * Check if Bluetooth is enabled on the system
 * Uses bluetoothctl to check the Bluetooth adapter status
 */
export function checkBluetoothStatus(): ResultAsync<BluetoothStatus, BluetoothError> {
  return ResultAsync.fromPromise(
    (async () => {
      const commandResult = await executeCommand(["bluetoothctl", "show"]);
      if (commandResult.isErr()) {
        throw commandResult.error;
      }
      const parseResult = parseBluetoothStatus(commandResult.value);
      if (parseResult.isErr()) {
        throw parseResult.error;
      }
      return parseResult.value;
    })(),
    (e): BluetoothError => {
      const error = e as BluetoothError;
      return error;
    }
  ).orElse((error) => {
    // If bluetoothctl fails, try rfkill as fallback
    if (error.type === "command_not_found" || error.type === "command_failed") {
      return ResultAsync.fromPromise(
        (async () => {
          const commandResult = await executeCommand(["rfkill", "list", "bluetooth"]);
          if (commandResult.isErr()) {
            throw commandResult.error;
          }
          const parseResult = parseRfkillStatus(commandResult.value);
          if (parseResult.isErr()) {
            throw parseResult.error;
          }
          return parseResult.value;
        })(),
        (e): BluetoothError => e as BluetoothError
      );
    }
    return errAsync(error);
  });
}

/**
 * Enable Bluetooth on the system
 */
export function enableBluetooth(): ResultAsync<void, BluetoothError> {
  return ResultAsync.fromPromise(
    executeCommand(["bluetoothctl", "power", "on"]),
    (e) => ({
      type: "unknown_error" as const,
      message: String(e),
    })
  ).andThen((result) =>
    result.match(
      () => ok(undefined),
      (error) => err(error)
    )
  );
}

/**
 * Disable Bluetooth on the system
 */
export function disableBluetooth(): ResultAsync<void, BluetoothError> {
  return ResultAsync.fromPromise(
    executeCommand(["bluetoothctl", "power", "off"]),
    (e) => ({
      type: "unknown_error" as const,
      message: String(e),
    })
  ).andThen((result) =>
    result.match(
      () => ok(undefined),
      (error) => err(error)
    )
  );
}

/**
 * Toggle Bluetooth power state
 */
export function toggleBluetooth(
  currentStatus: BluetoothStatus
): ResultAsync<void, BluetoothError> {
  if (currentStatus === "enabled") {
    return disableBluetooth();
  } else {
    return enableBluetooth();
  }
}

/**
 * Parse device information from bluetoothctl info output
 */
function parseDeviceInfo(address: string, output: string): BluetoothDevice {
  const lines = output.split("\n");
  let name: string | null = null;
  let paired = false;
  let connected = false;
  let trusted = false;
  let rssi: number | undefined;
  let icon: string | undefined;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Name:")) {
      name = trimmed.substring(5).trim();
    } else if (trimmed.startsWith("Paired:")) {
      paired = trimmed.includes("yes");
    } else if (trimmed.startsWith("Connected:")) {
      connected = trimmed.includes("yes");
    } else if (trimmed.startsWith("Trusted:")) {
      trusted = trimmed.includes("yes");
    } else if (trimmed.startsWith("RSSI:")) {
      const rssiMatch = trimmed.match(/-?\d+/);
      if (rssiMatch) {
        rssi = parseInt(rssiMatch[0], 10);
      }
    } else if (trimmed.startsWith("Icon:")) {
      icon = trimmed.substring(5).trim();
    }
  }

  return {
    address,
    name,
    paired,
    connected,
    trusted,
    rssi,
    icon,
  };
}

/**
 * Get detailed information about a device
 */
export async function getDeviceInfo(address: string): Promise<Result<BluetoothDevice, BluetoothError>> {
  const result = await executeCommand(["bluetoothctl", "info", address]);

  return result.map((output) => parseDeviceInfo(address, output));
}

/**
 * Start Bluetooth scanning
 */
export function startScan(): ResultAsync<void, BluetoothError> {
  return ResultAsync.fromPromise(
    executeCommand(["bluetoothctl", "scan", "on"]),
    (e) => ({
      type: "unknown_error" as const,
      message: String(e),
    })
  ).andThen((result) =>
    result.match(
      () => ok(undefined),
      (error) => err(error)
    )
  );
}

/**
 * Stop Bluetooth scanning
 */
export function stopScan(): ResultAsync<void, BluetoothError> {
  return ResultAsync.fromPromise(
    executeCommand(["bluetoothctl", "scan", "off"]),
    (e) => ({
      type: "unknown_error" as const,
      message: String(e),
    })
  ).andThen((result) =>
    result.match(
      () => ok(undefined),
      (error) => err(error)
    )
  );
}

/**
 * Parse device address and name from bluetoothctl output line
 * Matches lines like: "[NEW] Device XX:XX:XX:XX:XX:XX DeviceName"
 */
function parseDeviceFromScanLine(line: string): { address: string; name: string | null } | null {
  // Remove ANSI color codes
  const cleanLine = line.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");

  // Match pattern: [NEW] or [CHG] followed by Device and MAC address
  const match = cleanLine.match(/\[(NEW|CHG)\]\s+Device\s+([0-9A-F:]{17})(?:\s+(.+))?/i);

  if (match && match[2]) {
    return {
      address: match[2],
      name: match[3] || null,
    };
  }

  return null;
}

/**
 * Get list of paired devices
 */
export function getPairedDevices(): ResultAsync<BluetoothDevice[], BluetoothError> {
  return ResultAsync.fromPromise(
    (async () => {
      // Get list of paired devices using bluetoothctl
      const devicesResult = await executeCommand(["bluetoothctl", "devices", "Paired"]);
      if (devicesResult.isErr()) {
        throw devicesResult.error;
      }

      const output = devicesResult.value;
      const lines = output.trim().split("\n").filter((line) => line.trim());

      // Parse device addresses from "Device XX:XX:XX:XX:XX:XX DeviceName" format
      const deviceAddresses: string[] = [];
      for (const line of lines) {
        const match = line.match(/Device\s+([0-9A-F:]{17})/i);
        if (match && match[1]) {
          deviceAddresses.push(match[1]);
        }
      }

      // Get detailed info for each device
      const devices: BluetoothDevice[] = [];
      for (const address of deviceAddresses) {
        const deviceInfo = await getDeviceInfo(address);
        if (deviceInfo.isOk()) {
          devices.push(deviceInfo.value);
        }
      }

      return devices;
    })(),
    (e): BluetoothError => e as BluetoothError
  );
}

/**
 * Get list of discovered devices by parsing scan output
 */
export function getDiscoveredDevices(): ResultAsync<BluetoothDevice[], BluetoothError> {
  return ResultAsync.fromPromise(
    (async () => {
      // Get list of devices - this includes all known devices
      const devicesResult = await executeCommand(["bluetoothctl", "devices"]);
      if (devicesResult.isErr()) {
        throw devicesResult.error;
      }

      const output = devicesResult.value;
      const lines = output.trim().split("\n").filter((line) => line.trim());

      // Parse device addresses from "Device XX:XX:XX:XX:XX:XX DeviceName" format
      const deviceAddresses: string[] = [];
      for (const line of lines) {
        const match = line.match(/Device\s+([0-9A-F:]{17})/i);
        if (match && match[1]) {
          deviceAddresses.push(match[1]);
        }
      }

      // Get detailed info for each device
      const devices: BluetoothDevice[] = [];
      for (const address of deviceAddresses) {
        const deviceInfo = await getDeviceInfo(address);
        if (deviceInfo.isOk()) {
          devices.push(deviceInfo.value);
        }
      }

      return devices;
    })(),
    (e): BluetoothError => e as BluetoothError
  );
}

/**
 * Scan for Bluetooth devices by capturing scan output in real-time
 * Uses bluetoothctl in interactive mode to capture device discoveries
 * @param durationMs - Duration to scan in milliseconds (default: 10000)
 * @param onProgress - Callback for progress updates
 * @param onDeviceFound - Callback when a new device is discovered
 * @param abortSignal - Optional signal to cancel the scan early
 */
export function scanForDevices(
  durationMs: number = 10000,
  onProgress?: (elapsed: number) => void,
  onDeviceFound?: (device: BluetoothDevice) => void,
  abortSignal?: AbortSignal
): ResultAsync<BluetoothDevice[], BluetoothError> {
  return ResultAsync.fromPromise(
    (async () => {
      // Start bluetoothctl in interactive mode
      const scanProcess = Bun.spawn(["bluetoothctl"], {
        stdin: "pipe",
        stdout: "pipe",
        stderr: "pipe",
      });

      const discoveredAddresses = new Set<string>();
      const devices: BluetoothDevice[] = [];

      // Write "scan on" command to stdin
      scanProcess.stdin.write("scan on\n");

      // Read stdout in background
      const reader = scanProcess.stdout.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Function to process scan output
      const processOutput = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Process complete lines
            const lines = buffer.split("\n");
            // Keep the last incomplete line in buffer
            buffer = lines.pop() || "";

            for (const line of lines) {
              const deviceInfo = parseDeviceFromScanLine(line);
              if (deviceInfo && !discoveredAddresses.has(deviceInfo.address)) {
                discoveredAddresses.add(deviceInfo.address);

                // Get detailed device info
                const detailedInfo = await getDeviceInfo(deviceInfo.address);
                if (detailedInfo.isOk()) {
                  devices.push(detailedInfo.value);
                  if (onDeviceFound) {
                    onDeviceFound(detailedInfo.value);
                  }
                }
              }
            }
          }
        } catch (error) {
          // Stream ended or error occurred
        }
      };

      // Start processing output
      const outputPromise = processOutput();

      // Wait for the scan duration with progress updates
      const startTime = Date.now();
      const progressInterval = onProgress ? setInterval(() => {
        const elapsed = Date.now() - startTime;
        onProgress(Math.min(elapsed, durationMs));
      }, 100) : null;

      // Setup abort handling
      const abortPromise = abortSignal
        ? new Promise<void>((resolve) => {
            if (abortSignal.aborted) {
              resolve();
            } else {
              abortSignal.addEventListener("abort", () => resolve(), { once: true });
            }
          })
        : new Promise<void>(() => {}); // Never resolves if no abort signal

      // Wait for either timeout or abort
      await Promise.race([
        new Promise((resolve) => setTimeout(resolve, durationMs)),
        abortPromise,
      ]);

      if (progressInterval) {
        clearInterval(progressInterval);
      }

      // Send "scan off" and "exit" commands
      try {
        scanProcess.stdin.write("scan off\n");
        scanProcess.stdin.write("exit\n");
        scanProcess.stdin.end();
      } catch (e) {
        // Ignore errors
      }

      // Wait a bit for final output to be processed
      await Promise.race([
        outputPromise,
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);

      // Ensure process is killed
      try {
        scanProcess.kill();
      } catch (e) {
        // Process might already be dead
      }

      return devices;
    })(),
    (e): BluetoothError => {
      if (e instanceof Error) {
        return {
          type: "unknown_error" as const,
          message: e.message,
        };
      }
      return e as BluetoothError;
    }
  );
}

/**
 * Connect to a Bluetooth device
 */
export function connectToDevice(address: string): ResultAsync<void, BluetoothError> {
  return ResultAsync.fromPromise(
    executeCommand(["bluetoothctl", "connect", address]),
    (e) => ({
      type: "unknown_error" as const,
      message: String(e),
    })
  ).andThen((result) =>
    result.match(
      () => ok(undefined),
      (error) => err(error)
    )
  );
}

/**
 * Disconnect from a Bluetooth device
 */
export function disconnectFromDevice(address: string): ResultAsync<void, BluetoothError> {
  return ResultAsync.fromPromise(
    executeCommand(["bluetoothctl", "disconnect", address]),
    (e) => ({
      type: "unknown_error" as const,
      message: String(e),
    })
  ).andThen((result) =>
    result.match(
      () => ok(undefined),
      (error) => err(error)
    )
  );
}

/**
 * Pair with a Bluetooth device
 */
export function pairDevice(address: string): ResultAsync<void, BluetoothError> {
  return ResultAsync.fromPromise(
    executeCommand(["bluetoothctl", "pair", address]),
    (e) => ({
      type: "unknown_error" as const,
      message: String(e),
    })
  ).andThen((result) =>
    result.match(
      () => ok(undefined),
      (error) => err(error)
    )
  );
}

/**
 * Trust a Bluetooth device
 */
export function trustDevice(address: string): ResultAsync<void, BluetoothError> {
  return ResultAsync.fromPromise(
    executeCommand(["bluetoothctl", "trust", address]),
    (e) => ({
      type: "unknown_error" as const,
      message: String(e),
    })
  ).andThen((result) =>
    result.match(
      () => ok(undefined),
      (error) => err(error)
    )
  );
}

/**
 * Remove (unpair) a Bluetooth device
 */
export function removeDevice(address: string): ResultAsync<void, BluetoothError> {
  return ResultAsync.fromPromise(
    executeCommand(["bluetoothctl", "remove", address]),
    (e) => ({
      type: "unknown_error" as const,
      message: String(e),
    })
  ).andThen((result) =>
    result.match(
      () => ok(undefined),
      (error) => err(error)
    )
  );
}
