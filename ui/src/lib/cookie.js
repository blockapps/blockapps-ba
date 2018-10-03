import Cookies from 'universal-cookie';
import { APP_TOKEN_COOKIE_NAME } from '../environment';
const cookies = new Cookies();

export function getOauthCookie() {
  return cookies.get(APP_TOKEN_COOKIE_NAME);
} 