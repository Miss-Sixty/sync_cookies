export interface Cookie {
  name: string;
  value: string;
}

export interface ListItem {
  host: string;
  cookie?: string[];
  availableCookies?: Cookie[];
}

export interface GetHosts {
  host: string;
  cookies: Cookie[];
  settings: {
    edit: boolean;
    checkAll: boolean;
    isIndeterminate: boolean;
    selectedCookies: string[];
  };
}

export interface CookieRule {
  targetHost: string;
  getHosts: GetHosts[];
}
