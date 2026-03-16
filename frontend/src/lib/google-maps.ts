// Types pour Google Maps Places API
export interface GooglePlaceResult {
  place_id: string
  formatted_address: string
  name?: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  address_components: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
}

export interface GooglePlacePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export interface AddressGoogleProps {
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  'aria-label'?: string
  tabIndex?: number
}

export interface AddressGoogleWithAutoFillProps extends AddressGoogleProps {
  onEstablishmentNameChange?: (name: string) => void
  onCountryChange?: (country: string) => void
  onCityChange?: (city: string) => void
  onPostalCodeChange?: (postalCode: string) => void
  onAddressChange?: (address?: string) => void // Added this line
  currentEstablishmentName?: string
  currentCountry?: string
  useEstablishmentName?: boolean
  getPreciseAddress?: boolean
}

export interface AddressGoogleRef {
  focus: () => void
  blur: () => void
}
