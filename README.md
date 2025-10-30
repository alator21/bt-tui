# bt-tui

A modern, interactive Bluetooth Terminal User Interface for Linux.

Manage your Bluetooth devices directly from the terminal with a beautiful, keyboard-driven interface built with [OpenTUI](https://opentui.org) and React.

## Features

- **Power Management**: Toggle Bluetooth on/off
- **Device Scanning**: Real-time device discovery with progress indicator
- **Device Management**:
  - View paired and discovered devices
  - Connect/disconnect devices
  - Pair/unpair devices
  - Trust/untrust devices
- **Settings**:
  - Configure scan duration (5s, 10s, 20s, 30s)
  - Toggle discoverable mode
  - Toggle pairable mode
  - Auto-trust on pair
- **Keyboard-driven**: Vim-style navigation (j/k or arrow keys)
- **Live Updates**: Real-time device information and status

## Prerequisites

- Linux operating system
- `bluetoothctl` (part of BlueZ package)
- [Bun](https://bun.sh) runtime

### Installing BlueZ

```bash
# Debian/Ubuntu
sudo apt install bluez

# Arch Linux
sudo pacman -S bluez

# Fedora
sudo dnf install bluez
```

## Installation

```bash
bun install
```

## Usage

### Development Mode

Run with auto-reload on file changes:

```bash
bun run dev
```

### Direct Execution

```bash
bun run src/index.tsx
```

### Build Executable

Build a standalone binary:

```bash
bun run build
```

This creates a `bt-tui` executable in the current directory that you can run directly:

```bash
./bt-tui
```

## Keyboard Controls

### Main Menu
- `↑/k` or `↓/j`: Navigate menu
- `Enter`: Select option
- `q` or `Esc`: Exit application

### Scan View
- `↑/k` or `↓/j`: Navigate device list
- `Enter`: View device details
- `s`: Stop scanning (while scan is active)
- `r`: Restart scan
- `q` or `Esc`: Back to main menu

### Paired Devices View
- `↑/k` or `↓/j`: Navigate device list
- `Enter`: View device details
- `r`: Refresh device list
- `q` or `Esc`: Back to main menu

### Device Detail View
- `c`: Connect to device
- `d`: Disconnect from device
- `p`: Pair with device
- `r`: Remove (unpair) device
- `t`: Trust device
- `q` or `Esc`: Back to previous screen

### Settings View
- `1`: Toggle discoverable mode
- `2`: Toggle pairable mode
- `3`: Cycle scan duration
- `4`: Toggle auto-trust on pair
- `q` or `Esc`: Back to main menu

## Project Structure

```
bt-tui/
├── src/
│   ├── components/       # UI components
│   ├── services/         # Bluetooth service layer
│   │   └── bluetooth.ts  # bluetoothctl integration
│   ├── data/             # Static data (menu options)
│   ├── types.ts          # TypeScript type definitions
│   └── index.tsx         # Main application
├── package.json
└── README.md
```

## Architecture

The application uses:
- **OpenTUI**: Terminal UI framework with React-like API
- **neverthrow**: Result type for functional error handling
- **bluetoothctl**: Linux Bluetooth management via spawned processes
- **Bun**: Fast JavaScript runtime and build tool

## Development

This project was created using `bun create tui`. [create-tui](https://git.new/create-tui) is the easiest way to get started with OpenTUI.

### Tech Stack

- TypeScript
- React (for OpenTUI)
- Bun runtime
- BlueZ (bluetoothctl)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
