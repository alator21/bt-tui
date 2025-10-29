import { TextAttributes } from "@opentui/core";
import type { AppStatus } from "../types";

type FooterProps = {
  status: AppStatus;
};

const statusMessages: Record<AppStatus, string> = {
  ready: "Ready",
  scanning: "Scanning for devices...",
  connecting: "Connecting...",
  error: "Error occurred",
};

export function Footer({ status }: FooterProps) {
  return (
    <box marginTop={1}>
      <text attributes={TextAttributes.DIM} fg="gray">
        Status: {statusMessages[status]}
      </text>
    </box>
  );
}
