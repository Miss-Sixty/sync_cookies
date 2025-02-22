export interface Cookie {
  value: string;
}

export interface ListItem {
  host: string;
  cookie: string[];
  availableCookies?: Cookie[];
  checkAll?: boolean;
  isIndeterminate?: boolean;
}

export interface FormData {
  targetHost: string;
  list: ListItem[];
}

export interface CookieRule {
  targetHost: string;
  list: ListItem[];
} 