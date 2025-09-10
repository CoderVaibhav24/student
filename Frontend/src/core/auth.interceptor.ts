import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';

/**
 * Adds withCredentials for our API requests so cookies flow.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApi = req.url.startsWith(environment.apiUrl);
  const cloned = isApi ? req.clone({ withCredentials: true }) : req;
  return next(cloned);
};
