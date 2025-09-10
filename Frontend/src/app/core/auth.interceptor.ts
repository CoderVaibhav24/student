import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

// Send cookies to our API (so httpOnly JWT works)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApi = req.url.startsWith(environment.apiUrl);
  const clone = isApi ? req.clone({ withCredentials: true }) : req;
  return next(clone);
};
