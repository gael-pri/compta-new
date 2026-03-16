import * as React from "react";
import { CountryCode, countries } from "./countries";
import { useCountryFlag } from "./useCountryFlag";

function CountrySelector() {
  const [selectedCountry, setSelectedCountry] = React.useState<CountryCode>(
    countries[0]
  );
  const flagUrl = useCountryFlag(selectedCountry.code);

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex flex-1 gap-1 px-3.5 py-2.5 bg-white rounded-2xl size-full">
        <div className="flex gap-2 justify-center items-center h-full">
          <img
            src={flagUrl}
            alt={`Flag of ${selectedCountry.name}`}
            className="w-auto h-6"
            width={24}
            height={24}
          />
          <select
            aria-label="Select country code"
            value={selectedCountry.code}
            onChange={(e) =>
              setSelectedCountry(
                countries.find((country) => country.code === e.target.value)!
              )
            }
            className="self-stretch my-auto bg-transparent border-none text-black"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.code} ({country.dialCode})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default CountrySelector;