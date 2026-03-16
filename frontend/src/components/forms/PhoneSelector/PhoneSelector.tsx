import * as React from "react";
import CountrySelector from "./CountrySelector";

interface PhoneSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const PhoneSelector: React.FC<PhoneSelectorProps> = ({ className, ...props }) => {
  return (
    <main
      role="main"
      className={`flex flex-col text-base font-medium text-black max-w-[147px] ${className}`}
      {...props}
    >
      <CountrySelector />
    </main>
  );
}

export default PhoneSelector;