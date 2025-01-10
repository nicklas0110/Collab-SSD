import { HttpInterceptorFn } from '@angular/common/http';

export const securityHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  const secureReq = req.clone({
    headers: req.headers
      .set('Content-Type', 'application/json')
      .set('X-Frame-Options', 'DENY')
      .set('X-Content-Type-Options', 'nosniff')
  });
  return next(secureReq);
};