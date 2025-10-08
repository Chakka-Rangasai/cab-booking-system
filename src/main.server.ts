import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
 
export default function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(App, appConfig, context);
}
export * from './app/app';