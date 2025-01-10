import { HttpInterceptorFn } from '@angular/common/http';

export const securityHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  const secureReq = req.clone({
    headers: req.headers
      .set('Content-Type', 'application/json')
      .set('X-Frame-Options', 'DENY')
      .set('X-Content-Type-Options', 'nosniff')
      .set('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "frame-src 'self' https://www.google.com/recaptcha/",
        "connect-src 'self'"
      ].join('; '))
      .set('X-XSS-Protection', '1; mode=block')
      .set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
      .set('Referrer-Policy', 'strict-origin-when-cross-origin')
      .set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
      .set('Access-Control-Allow-Origin', 'https://localhost:4200')
      .set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      .set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization')
  });
  return next(secureReq);
};