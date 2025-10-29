import { render, useKeyboard } from "@opentui/react";
import { useState, useEffect } from "react";

import { Header } from "./components/Header";
import { Menu } from "./components/Menu";
import { Footer } from "./components/Footer";
import { ScanView } from "./components/ScanView";
import { PairedDevicesView } from "./components/PairedDevicesView";
import { DeviceDetailView } from "./components/DeviceDetailView";
import { menuOptions } from "./data/menuOptions";
import type { AppStatus, BluetoothStatus, BluetoothDevice, Screen } from "./types";
import {
  checkBluetoothStatus,
  toggleBluetooth,
  scanForDevices,
  connectToDevice,
  disconnectFromDevice,
  pairDevice,
  removeDevice,
  getDeviceInfo,
  getPairedDevices,
  trustDevice,
} from "./services/bluetooth";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [status, setStatus] = useState<AppStatus>("ready");
  const [bluetoothStatus, setBluetoothStatus] = useState<BluetoothStatus>("unknown");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedDevices, setScannedDevices] = useState<BluetoothDevice[]>([]);
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [scanAbortController, setScanAbortController] = useState<AbortController | null>(null);
  const [previousScreen, setPreviousScreen] = useState<Screen>("main");
  const scanDuration = 10000; // 10 seconds

  // Paired devices state
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);
  const [selectedPairedIndex, setSelectedPairedIndex] = useState(0);
  const [isLoadingPaired, setIsLoadingPaired] = useState(false);

  // Check Bluetooth status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const result = await checkBluetoothStatus();

      result.match(
        (btStatus) => {
          setBluetoothStatus(btStatus);
          setErrorMessage(null);
        },
        (error) => {
          setBluetoothStatus("unknown");
          setErrorMessage(error.message);
          setStatus("error");
        }
      );
    };

    checkStatus();
  }, []);

  const handlePowerToggle = async () => {
    setStatus("ready");
    setErrorMessage(null);

    const toggleResult = await toggleBluetooth(bluetoothStatus);

    await toggleResult.match(
      async () => {
        // Toggle successful, re-check the status
        const statusResult = await checkBluetoothStatus();

        statusResult.match(
          (newStatus) => {
            setBluetoothStatus(newStatus);
            setStatus("ready");
          },
          (error) => {
            setErrorMessage(error.message);
            setStatus("error");
          }
        );
      },
      (error) => {
        setErrorMessage(error.message);
        setStatus("error");
      }
    );
  };

  const handleScan = async () => {
    // Check if Bluetooth is enabled
    if (bluetoothStatus !== "enabled") {
      setErrorMessage("Bluetooth must be enabled to scan for devices");
      setStatus("error");
      return;
    }

    setCurrentScreen("scan");
    setIsScanning(true);
    setScanProgress(0);
    setScannedDevices([]);
    setErrorMessage(null);
    setStatus("scanning");

    // Create abort controller for this scan
    const abortController = new AbortController();
    setScanAbortController(abortController);

    const result = await scanForDevices(
      scanDuration,
      (progress) => {
        setScanProgress(progress);
      },
      (device) => {
        // Real-time device discovery - add device to list as it's found
        setScannedDevices((prev) => {
          // Check if device already exists
          const exists = prev.some((d) => d.address === device.address);
          if (exists) {
            return prev;
          }
          return [...prev, device];
        });
      },
      abortController.signal
    );

    result.match(
      (devices) => {
        // Update with final device list (in case any were missed)
        setScannedDevices(devices);
        setIsScanning(false);
        setScanAbortController(null);
        setStatus("ready");
      },
      (error) => {
        setErrorMessage(error.message);
        setIsScanning(false);
        setScanAbortController(null);
        setStatus("error");
      }
    );
  };

  const handleStopScan = () => {
    if (scanAbortController) {
      scanAbortController.abort();
      setIsScanning(false);
      setScanAbortController(null);
      setStatus("ready");
    }
  };

  const handleListPaired = async () => {
    // Check if Bluetooth is enabled
    if (bluetoothStatus !== "enabled") {
      setErrorMessage("Bluetooth must be enabled to list paired devices");
      setStatus("error");
      return;
    }

    setCurrentScreen("pairedDevices");
    setIsLoadingPaired(true);
    setPairedDevices([]);
    setSelectedPairedIndex(0);
    setErrorMessage(null);
    setStatus("scanning");

    const result = await getPairedDevices();

    result.match(
      (devices) => {
        setPairedDevices(devices);
        setIsLoadingPaired(false);
        setStatus("ready");
      },
      (error) => {
        setErrorMessage(error.message);
        setIsLoadingPaired(false);
        setStatus("error");
      }
    );
  };

  const handleBackToMain = () => {
    setCurrentScreen("main");
    setSelectedIndex(0);
    setSelectedDeviceIndex(0);
    setSelectedPairedIndex(0);
    setSelectedDevice(null);
    setErrorMessage(null);
  };

  const handleBackToScan = () => {
    setCurrentScreen("scan");
    setSelectedDevice(null);
    setErrorMessage(null);
  };

  const handleBackToPaired = () => {
    setCurrentScreen("pairedDevices");
    setSelectedDevice(null);
    setErrorMessage(null);
  };

  const handleViewDevice = async (device: BluetoothDevice, fromScreen?: Screen) => {
    // Show loading state
    setStatus("connecting");
    setErrorMessage(null);
    if (fromScreen) {
      setPreviousScreen(fromScreen);
    }
    setCurrentScreen("deviceDetail");
    setSelectedDevice(device);

    // Fetch fresh device info
    const freshInfo = await getDeviceInfo(device.address);

    freshInfo.match(
      (updatedDevice) => {
        setSelectedDevice(updatedDevice);
        setStatus("ready");
      },
      (error) => {
        // Keep the stale device info but show error
        setErrorMessage(`Could not refresh device info: ${error.message}`);
        setStatus("error");
      }
    );
  };

  const handleDeviceAction = async (action: "connect" | "disconnect" | "pair" | "remove" | "trust") => {
    if (!selectedDevice) return;

    setStatus("connecting");
    setErrorMessage(null);

    let result;
    switch (action) {
      case "connect":
        result = await connectToDevice(selectedDevice.address);
        break;
      case "disconnect":
        result = await disconnectFromDevice(selectedDevice.address);
        break;
      case "pair":
        result = await pairDevice(selectedDevice.address);
        break;
      case "remove":
        result = await removeDevice(selectedDevice.address);
        break;
      case "trust":
        result = await trustDevice(selectedDevice.address);
        break;
    }

    result.match(
      async () => {
        // Refresh device info after action
        const freshInfo = await getDeviceInfo(selectedDevice.address);
        freshInfo.match(
          (updatedDevice) => {
            setSelectedDevice(updatedDevice);
            setStatus("ready");
          },
          (error) => {
            setErrorMessage(`Action succeeded but could not refresh: ${error.message}`);
            setStatus("error");
          }
        );
      },
      (error) => {
        setErrorMessage(error.message);
        setStatus("error");
      }
    );
  };

  useKeyboard((key) => {
    if (key.name === "escape" || (key.name === "q" && !key.ctrl)) {
      if (currentScreen === "main") {
        process.exit(0);
      } else if (currentScreen === "deviceDetail") {
        // Go back to previous screen (scan or pairedDevices)
        if (previousScreen === "pairedDevices") {
          handleBackToPaired();
        } else {
          handleBackToScan();
        }
      } else {
        handleBackToMain();
      }
      return;
    }

    // Main menu navigation
    if (currentScreen === "main") {
      if (key.name === "down" || key.name === "j") {
        setSelectedIndex((prev) => (prev + 1) % menuOptions.length);
      }

      if (key.name === "up" || key.name === "k") {
        setSelectedIndex((prev) =>
          prev === 0 ? menuOptions.length - 1 : prev - 1
        );
      }

      if (key.name === "return") {
        const selected = menuOptions[selectedIndex];
        if (selected?.value === "exit") {
          process.exit(0);
        } else if (selected?.value === "power") {
          handlePowerToggle();
        } else if (selected?.value === "scan") {
          handleScan();
        } else if (selected?.value === "list") {
          handleListPaired();
        }
      }
    }

    // Scan screen navigation
    if (currentScreen === "scan") {
      // Stop scan with 's' key
      if (key.name === "s" && isScanning) {
        handleStopScan();
      }

      // Restart scan with 'r' key
      if (key.name === "r" && !isScanning) {
        handleScan();
      }

      // Navigate devices (even while scanning)
      if (scannedDevices.length > 0) {
        if (key.name === "down" || key.name === "j") {
          setSelectedDeviceIndex((prev) => (prev + 1) % scannedDevices.length);
        }

        if (key.name === "up" || key.name === "k") {
          setSelectedDeviceIndex((prev) =>
            prev === 0 ? scannedDevices.length - 1 : prev - 1
          );
        }

        if (key.name === "return") {
          const device = scannedDevices[selectedDeviceIndex];
          if (device) {
            handleViewDevice(device, "scan");
          }
        }
      }
    }

    // Paired devices screen navigation
    if (currentScreen === "pairedDevices") {
      // Refresh with 'r' key
      if (key.name === "r" && !isLoadingPaired) {
        handleListPaired();
      }

      // Navigate devices
      if (pairedDevices.length > 0) {
        if (key.name === "down" || key.name === "j") {
          setSelectedPairedIndex((prev) => (prev + 1) % pairedDevices.length);
        }

        if (key.name === "up" || key.name === "k") {
          setSelectedPairedIndex((prev) =>
            prev === 0 ? pairedDevices.length - 1 : prev - 1
          );
        }

        if (key.name === "return") {
          const device = pairedDevices[selectedPairedIndex];
          if (device) {
            handleViewDevice(device, "pairedDevices");
          }
        }
      }
    }

    // Device detail screen actions
    if (currentScreen === "deviceDetail" && selectedDevice) {
      if (key.name === "c" && !selectedDevice.connected) {
        handleDeviceAction("connect");
      } else if (key.name === "d" && selectedDevice.connected) {
        handleDeviceAction("disconnect");
      } else if (key.name === "p" && !selectedDevice.paired) {
        handleDeviceAction("pair");
      } else if (key.name === "r" && selectedDevice.paired) {
        handleDeviceAction("remove");
      } else if (key.name === "t" && !selectedDevice.trusted) {
        handleDeviceAction("trust");
      }
    }
  });

  // Render appropriate screen
  if (currentScreen === "scan") {
    return (
      <ScanView
        isScanning={isScanning}
        progress={scanProgress}
        duration={scanDuration}
        devices={scannedDevices}
        selectedDeviceIndex={selectedDeviceIndex}
        onBack={handleBackToMain}
      />
    );
  }

  if (currentScreen === "pairedDevices") {
    return (
      <PairedDevicesView
        isLoading={isLoadingPaired}
        devices={pairedDevices}
        selectedDeviceIndex={selectedPairedIndex}
        onBack={handleBackToMain}
      />
    );
  }

  if (currentScreen === "deviceDetail" && selectedDevice) {
    const handleBack = previousScreen === "pairedDevices" ? handleBackToPaired : handleBackToScan;
    return (
      <DeviceDetailView
        device={selectedDevice}
        isConnecting={status === "connecting"}
        onConnect={() => handleDeviceAction("connect")}
        onDisconnect={() => handleDeviceAction("disconnect")}
        onPair={() => handleDeviceAction("pair")}
        onRemove={() => handleDeviceAction("remove")}
        onTrust={() => handleDeviceAction("trust")}
        onBack={handleBack}
      />
    );
  }

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <Header bluetoothStatus={bluetoothStatus} />
      <Menu options={menuOptions} selectedIndex={selectedIndex} />
      <Footer status={status} />
      {errorMessage && (
        <box marginTop={1}>
          <text fg="red">Error: {errorMessage}</text>
        </box>
      )}
    </box>
  );
}

render(<App />);
