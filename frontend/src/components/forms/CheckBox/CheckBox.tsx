import { cn } from "@lib/utils";
import type React from "react";
import { useEffect, useState } from "react";
import { presets } from "@styles/presets";

interface CheckBoxProps {
  label?: string;
  labelClass?: string;
  checkbox?: boolean;
  type?: "Checkbox" | "Check circle";
  borderColor?: string;
  bgColor?: string;
  checked?: boolean;
  disabled?: boolean;
  showLabel?: boolean;
  onChange?: (checked: boolean) => void;
}

// Fonction utilitaire pour résoudre une couleur venant de Plasmic
function resolveColor(color?: string | ((obj: any, path: any) => any)): string | undefined {
  return typeof color === "string" ? color : undefined;
}

const CheckBox: React.FC<CheckBoxProps> = ({ 
  label = "Checkbox label",
  labelClass,
  checkbox = false,
  type = "Checkbox",
  borderColor,
  bgColor,
  checked, 
  disabled,
  showLabel = true,
  onChange 
}) => {
  const [internalChecked, setInternalChecked] = useState(false);

  const isChecked =
  checked !== undefined
    ? checked
    : checkbox ?? internalChecked;

  useEffect(() => {
    if (checked !== undefined) {
      setInternalChecked(checked);
    } else if (checkbox !== undefined) {
      setInternalChecked(checkbox);
    }
  }, [checked, checkbox]);


  const resolvedBorderColor = resolveColor(borderColor) ?? "#D0D5DD";
  const resolvedBgColor = resolveColor(bgColor) ?? "transparent";

  const isControlledByPlasmic = checked !== undefined || checkbox !== undefined;

  const handleToggle = (newChecked: boolean) => {
    if (!isControlledByPlasmic) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked);
  };

  return (
    <div className={cn("inline-flex items-center group")}>
      <label 
        style={presets.checkboxLabel as React.CSSProperties}
        className={labelClass}
      >
        <input
          type="checkbox"
          className={cn(
            "peer p-[3px] size-5 cursor-pointer transition-all appearance-none outline-none shrink-0 flex items-center justify-center",
            type === "Checkbox" ? "rounded-md" : "rounded-full",
            disabled && "opacity-30"
          )}
          style={{
            border: `2px solid ${resolvedBorderColor}`,
            backgroundColor: isChecked ? resolvedBgColor : "transparent",
          }}
          disabled={disabled}
          checked={isChecked}
          onChange={(e) => {
            if (disabled) return;
            handleToggle(e.target.checked);
          }}
        />
        {showLabel && label}
      </label>
    </div>
  );
};

export default CheckBox;
