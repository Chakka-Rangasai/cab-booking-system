import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export function CorsInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Clone the request and add CORS headers
  const corsRequest = req.clone({
    setHeaders: {
      'Content-Type': 'application/json'
    }
  });

  return next(corsRequest);
}
