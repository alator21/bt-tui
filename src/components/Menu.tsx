import { TextAttributes } from "@opentui/core";
import type { MenuOption } from "../types";

type MenuProps = {
  options: MenuOption[];
  selectedIndex: number;
};

export function Menu({ options, selectedIndex }: MenuProps) {
  return (
    <box flexDirection="column" marginBottom={1}>
      <text attributes={TextAttributes.DIM} marginBottom={1}>
        Use ↑/↓ or j/k to navigate, Enter to select, q/Esc to quit
      </text>

      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        return (
          <box key={option.value} marginBottom={0}>
            <text
              attributes={isSelected ? TextAttributes.BOLD : TextAttributes.NONE}
              fg={isSelected ? "green" : undefined}
            >
              {isSelected ? "► " : "  "}
              {option.label}
            </text>
          </box>
        );
      })}
    </box>
  );
}
