import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { cn } from '@lib/utils'
import { AddressGoogleWithAutoFillProps, AddressGoogleRef } from './google-maps'

declare global {
  interface Window {
    google: typeof google
  }
}

export type ParsedAddress = {
  establishmentName: string
  streetNumber: string
  route: string
  postalCode: string
  city: string
  country: string
  formattedAddress: string
}

const findCity = (components: Array<{ long_name: string; types: string[] }>) => {
  return (
    components.find((c) => c.types.includes('locality'))?.long_name ||
    components.find((c) => c.types.includes('postal_town'))?.long_name ||
    components.find((c) => c.types.includes('administrative_area_level_2'))?.long_name ||
    components.find((c) => c.types.includes('administrative_area_level_1'))?.long_name ||
    ''
  )
}

export const getFullAddress = async (place: google.maps.places.PlaceResult, useEstablishmentName = false, getPreciseAddress = false): Promise<ParsedAddress> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error('Clé API Google Maps manquante');

  let streetNumber = '';
  let route = '';
  let postalCode = '';
  let city = '';
  let country = '';
  const establishmentName = place.name || '';

  if (place.place_id) {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=address_components,geometry&key=${apiKey}&language=fr&region=fr`;
      const response = await fetch(detailsUrl);

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      const detailsData = await response.json();
      if (detailsData.status === 'OK' && detailsData.result) {
        const comps = detailsData.result.address_components as Array<{ long_name: string; types: string[] }>;
        const find = (type: string) => comps.find(c => c.types.includes(type))?.long_name || '';
        streetNumber = find('street_number');
        route = find('route');
        postalCode = find('postal_code');
        city = findCity(comps);
        country = find('country');
      } else {
        console.error('Erreur dans les données retournées par Google Places:', detailsData);
      }
    } catch (error) {
      console.error('Erreur lors de la requête Google Places Details:', error);
    }
  }

  // fallback Geocoding
  if ((!streetNumber || !route) && place.geometry?.location) {
    try {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=fr&region=fr`;
      const geoData = await (await fetch(geoUrl)).json();
      if (geoData.status === 'OK' && geoData.results.length) {
        const comps = geoData.results[0].address_components as Array<{ long_name: string; types: string[] }>;
        const find = (type: string) => comps.find(c => c.types.includes(type))?.long_name || '';
        streetNumber ||= find('street_number');
        route ||= find('route');
        postalCode ||= find('postal_code');
        city ||= findCity(comps);
        country ||= find('country');
      }
    } catch (error) {
      console.error('Erreur lors de la requête Geocode fallback:', error);
    }
  }

  console.log('Precise adresse', getPreciseAddress)
  const formattedAddress = !getPreciseAddress &&
     useEstablishmentName && establishmentName
     ? `${establishmentName}${postalCode || city ? `, ${[postalCode, city].filter(Boolean).join(' ')}` : ''}`
     : 
    [streetNumber, route].filter(Boolean).join(' ') + (postalCode || city ? `, ${[postalCode, city].filter(Boolean).join(' ')}` : '');

  return { establishmentName, streetNumber, route, postalCode, city, country, formattedAddress };
};


const AddressGoogleWithAutoFill = forwardRef<AddressGoogleRef, AddressGoogleWithAutoFillProps>((props, ref) => {
  const {
    value = '',
    onChange, onBlur,
    onEstablishmentNameChange, onCountryChange, onCityChange, onPostalCodeChange, onAddressChange,
    placeholder = 'Ex: 123 rue de la Paix, 75001 Paris',
    disabled = false,
    className,
    id, name, 'aria-label': ariaLabel, tabIndex = 0,
    useEstablishmentName = true,
    getPreciseAddress
  } = props

  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dynamicUseEstablishmentName, setDynamicUseEstablishmentName] = useState(useEstablishmentName);
  const [dynamicGetPreciseAddress, setDynamicGetPreciseAddress] = useState(getPreciseAddress);

  // // Synchroniser avec la prop useEstablishmentName
  // useEffect(() => {
  //   console.log('Prop useEstablishmentName:', useEstablishmentName);
  //   //console.log('State dynamicUseEstablishmentName:', dynamicUseEstablishmentName);
  //   setDynamicUseEstablishmentName(useEstablishmentName);
  // }, [useEstablishmentName]);

  useEffect(() => {
    setDynamicGetPreciseAddress(getPreciseAddress);
  }, [getPreciseAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange?.(inputValue);
    setDynamicUseEstablishmentName(/^[^0-9]/.test(inputValue));
  };

  const callbacksRef = useRef({ onChange, onEstablishmentNameChange, onCountryChange, onCityChange, onPostalCodeChange, onAddressChange })
  useEffect(() => { callbacksRef.current = { onChange, onEstablishmentNameChange, onCountryChange, onCityChange, onPostalCodeChange, onAddressChange } }, [onChange, onEstablishmentNameChange, onCountryChange, onCityChange, onPostalCodeChange, onAddressChange])

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus(), blur: () => inputRef.current?.blur() }))

  // --- Google Autocomplete init ---
  useEffect(() => {
    let isMounted = true;

    const initGoogle = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey.length < 30) {
        setError('Clé API Google Maps manquante');
        return;
      }

      try {
        // Configure the API options
        setOptions({ key: apiKey, libraries: ['places'] });

        // Dynamically import the library
        await importLibrary('places');

        if (!window.google?.maps?.places || !inputRef.current) return;

        // Vérifiez si une instance existe déjà
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ['place_id', 'formatted_address', 'name', 'geometry', 'address_components'],
          types: dynamicUseEstablishmentName ? ['establishment'] : ['geocode'],
          componentRestrictions: { country: 'fr' },
        });

        autocompleteRef.current.addListener('place_changed', async () => {
          if (!isMounted) return;
          const place = autocompleteRef.current?.getPlace();
          if (!place) return;
          const addr = await getFullAddress(place, dynamicUseEstablishmentName, dynamicGetPreciseAddress);
          callbacksRef.current.onChange?.(addr.formattedAddress);
          callbacksRef.current.onAddressChange?.(addr.formattedAddress);
          callbacksRef.current.onCityChange?.(addr.city);
          callbacksRef.current.onPostalCodeChange?.(addr.postalCode);
          callbacksRef.current.onCountryChange?.(addr.country);
          callbacksRef.current.onEstablishmentNameChange?.(addr.establishmentName);
        });
      } catch (err) {
        console.error('Erreur Google Maps:', err);
        setError('Erreur lors du chargement de Google Maps');
      }
    };

    initGoogle();

    return () => {
      isMounted = false;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [dynamicUseEstablishmentName])

 // Dropdown fixe et repositionnement
  useEffect(() => {
    const handled = new Map<HTMLElement, () => void>()

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue
          if (node.classList.contains('pac-container')) {
            const dropdown = node
            const input = inputRef.current!
            const modal = input.closest('.modal')

            ;[window, modal].forEach((el) => {
              if (!el) return

              const adjust = () => {
                const rect = input.getBoundingClientRect()
                const top = el === window ? rect.bottom : rect.top - (modal as HTMLElement).getBoundingClientRect().top + input.offsetHeight
                const left = el === window ? rect.left : rect.left - (modal as HTMLElement).getBoundingClientRect().left
                dropdown.style.top = `${top}px`
                dropdown.style.left = `${left}px`
                dropdown.style.width = `${input.offsetWidth}px`
              }

              dropdown.style.position = 'absolute'
              dropdown.style.zIndex = '2147483647'
              dropdown.style.pointerEvents = 'auto'

              el.addEventListener('scroll', adjust)
              window.addEventListener('resize', adjust)
              adjust()

              handled.set(dropdown, () => {
                el.removeEventListener('scroll', adjust)
                window.removeEventListener('resize', adjust)
              })
            })
          }
        }
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      for (const cleanup of handled.values()) cleanup()
      handled.clear()
    }
  }, [])
  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        name={name}
        value={value}
        onChange={handleInputChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        tabIndex={tabIndex}
        autoComplete="off" 
        className={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)}
      />
      {error && <p className="mt-1 text-sm text-red-500" role="alert">{error}</p>}
    </div>
  )
})

AddressGoogleWithAutoFill.displayName = 'AddressGoogleWithAutoFill'
export { AddressGoogleWithAutoFill }
