export interface CountryCode {
    code: string;
    name: string;
    dialCode: string;
  }
  
  export const countries: CountryCode[] = [
    { code: "FR", name: "France", dialCode: "+33" },
    { code: "US", name: "United States", dialCode: "+1" },
    { code: "UK", name: "United Kingdom", dialCode: "+44" },
    { code: "CA", name: "Canada", dialCode: "+1" },
    { code: "AU", name: "Australia", dialCode: "+61" },
    { code: "DE", name: "Germany", dialCode: "+49" },
    { code: "IN", name: "India", dialCode: "+91" },
    { code: "BR", name: "Brazil", dialCode: "+55" },
    { code: "CN", name: "China", dialCode: "+86" },
    { code: "JP", name: "Japan", dialCode: "+81" },
    { code: "MX", name: "Mexico", dialCode: "+52" },
    { code: "IT", name: "Italy", dialCode: "+39" },
    { code: "ES", name: "Spain", dialCode: "+34" },
    { code: "RU", name: "Russia", dialCode: "+7" },
    { code: "ZA", name: "South Africa", dialCode: "+27" },
  ];