import * as React from "react";
import { AddressGoogleWithAutoFill } from '@lib/address-google';

import styles from "./InputComboSelect.module.css";
import { presets } from "@styles/presets";
import { ChevronUpIcon, ChevronDownIcon } from "../../icons/icons";

export interface InputComboSelectProps {
  value?: string;
  array?: { value: string; label: string }[];
  onChange?: (value: string) => void;
  className?: string;
  icon?: boolean;
  iconSlot?: React.ReactNode;
  time?: boolean;
  multiSelect?: boolean;
  multiSelectText?: string;
  googleAddress?: boolean;
  optionWidth?: string;
  placeholder?: string;
  defaultValue?: string;
}

function generateTimeOptions(): { value: string; label: string }[] {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      const time = `${formattedHour}:${formattedMinute}`;
      options.push({ value: time, label: time });
    }
  }
  return options;
}

function InputComboSelect_(
  props: InputComboSelectProps,
  ref: React.Ref<HTMLDivElement>
) {
  const {
    value,
    placeholder,
    array = [],
    onChange,
    className,
    icon = false,
    iconSlot,
    time = false,
    googleAddress = false,
    multiSelect = false,
    multiSelectText = 'Multiple values selected',
  } = props;

  const [open, setOpen] = React.useState(false);
  const [addressOptions, setAddressOptions] = React.useState(array);
  const [selectedValues, setSelectedValues] = React.useState<string[]>(
    Array.isArray(value) ? value : []
  );

  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setOpen(!open);
  const closeDropdown = () => setOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!multiSelect) {
      onChange?.(val);
    }
  };

  const handleSelect = (val: string) => {
    if (multiSelect) {
      const updatedValues = selectedValues.includes(val)
        ? selectedValues.filter((v) => v !== val)
        : [...selectedValues, val];
      setSelectedValues(updatedValues);
      onChange?.(updatedValues as any);
    } else {
      onChange?.(val);
      closeDropdown();
    }
  };

  const options = React.useMemo(() => {
    if (googleAddress) {
      return Array.isArray(addressOptions) ? addressOptions : [];
    }
    if (time) {
      return generateTimeOptions();
    }
    return Array.isArray(array) ? array : [];
  }, [googleAddress, time, addressOptions, array]);

  const selectedLabel = multiSelect
    ? selectedValues.length > 0
      ? multiSelectText
      : ''
    : options.find((option) => option.value === value)?.label || value || '';

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddressChange = (formattedAddress: string) => {
    setAddressOptions([{ value: formattedAddress, label: formattedAddress }]);
    onChange?.(formattedAddress);
  };

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} ${className}`} onClick={toggleDropdown}>
      {googleAddress ? (
        <AddressGoogleWithAutoFill
          value={value}
          onChange={handleAddressChange}
          placeholder="Entrez une adresse"
          className={styles.input}
        />
      ) : (
        <>
          {icon && <div className={styles.iconSlot}>{iconSlot}</div>}
          <input
            type="text"
            value={selectedLabel}
            onChange={handleInputChange}
            className={`${styles.input} ${time ? styles.inputTime : ''} ${presets.dropdownStyle.input}`}
            readOnly={!multiSelect}
            placeholder={placeholder}
          />
        </>
      )}
      <button type="button" className={styles.icon}>
        {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {open && (
        <div
          className={`${styles.dropdown} ${time ? styles.dropdownTime : ''}`}
          style={{ width: props.optionWidth || 'auto' }}
        >
          {options.map((option) => (
            <button
              key={`option-${option.value}`}
              type="button"
              className={`${styles.option} ${time ? styles.optionTime : ''} ${
                multiSelect
                  ? selectedValues.includes(option.value)
                    ? `${styles.selected} ${
                        time ? styles.optionTimeSelected : ''
                      }`
                    : ''
                  : value === option.value
                  ? `${styles.selected} ${
                      time ? styles.optionTimeSelected : ''
                    }`
                  : ''
              }`}
              style={{
                backgroundColor: multiSelect && selectedValues.includes(option.value) ? 'white' : undefined,
              }}
              onClick={() => handleSelect(option.value)}
              ref={(el) => {
                if (el && value === option.value) {
                  el.focus();
                }
              }}
            >
              {option.label}
              {(multiSelect
                ? selectedValues.includes(option.value)
                : value === option.value) && <span className={styles.checkmark}>✔</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const InputComboSelect = React.forwardRef(InputComboSelect_);
export default InputComboSelect;
