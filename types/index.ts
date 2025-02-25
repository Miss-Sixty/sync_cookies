export interface Cookie {
  value: string;
}

export interface ListItem {
  host: string;
  cookie?: string[];
  availableCookies?: Cookie[];
}

export interface FormData {
  targetHost: string;
  getHosts: string[];
}

export interface CookieRule {
  targetHost: string;
  getHosts: string[];
  cookies?: string[];
} 