import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {Angulartics2, Angulartics2Module} from 'angulartics2';
import {Angulartics2GoogleTagManager} from 'angulartics2/gtm';


import {AppComponent} from './app.component';
import {BadgrCommonModule, COMMON_IMPORTS} from './common/badgr-common.module';
import {InitialRedirectComponent} from './initial-redirect.component';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouteReuseStrategy, RouterModule, Routes} from '@angular/router';
import {ForwardRouteComponent} from './common/pages/forward-route.component';
import {BadgrRouteReuseStrategy} from './common/util/route-reuse-strategy';
import {ProfileModule} from './profile/profile.module';
import {AuthModule} from './auth/auth.module';
import {AuthGuard} from './common/guards/auth.guard';
import {RecipientBadgeApiService} from './recipient/services/recipient-badges-api.service';
import {AppConfigService} from './common/app-config.service';
import {initializeTheme} from '../theming/theme-setup';
import {timeoutPromise} from './common/util/promise-util';

// Force AuthModule and ProfileModule to get included in the main module. We don't want them lazy loaded because
// they basically always need to be present. We have have functions that return them, but use strings in the Routes
// because of https://github.com/angular/angular-cli/issues/4192
export function authModule() {
	return AuthModule;
}

export function profileModule() {
	return ProfileModule;
}

const ROUTE_CONFIG: Routes = [
	{
		path: '',
		redirectTo: '/initial-redirect',
		pathMatch: 'full',
	},
	{
		path: 'initial-redirect',
		component: InitialRedirectComponent
	},
	{
		path: 'forward',
		component: ForwardRouteComponent
	},
	{
		path: 'auth',
		loadChildren: './auth/auth.module#AuthModule'
	},
	{
		path: 'signup',
		loadChildren: './signup/signup.module#SignupModule'
	},
	{
		path: 'recipient',
		loadChildren: './recipient/recipient.module#RecipientModule',
		canActivate: [AuthGuard]
	},
	{
		path: 'issuer',
		loadChildren: './issuer/issuer.module#IssuerModule',
		canActivate: [AuthGuard]
	},
	{
		path: 'profile',
		loadChildren: './profile/profile.module#ProfileModule',
		canActivate: [AuthGuard]
	},
	{
		path: 'public',
		loadChildren: './public/public.module#PublicModule'
	},
	// Legacy Auth Redirects
	{
		path: 'login',
		redirectTo: '/auth/login',
		pathMatch: 'full',
	},
	{
		path: 'login/:name',
		redirectTo: '/auth/login/:name',
		pathMatch: 'full',
	},
	{
		path: 'login/:name/:email',
		redirectTo: '/auth/login/:name/:email',
		pathMatch: 'full',
	},
	{
		path: 'change-password/:token',
		redirectTo: '/auth/change-password/:token',
		pathMatch: 'full',
	},
	// catchall
	{
		'path': '**',
		redirectTo: '/initial-redirect',
	},
];

export const appInitializerFn = (configService: AppConfigService) => {
	return async () => {
		const configPromise = configService.initializeConfig();

		// Expose the configuration to external scripts for debugging and testing.
		window['badgrConfigPromise'] = configPromise;

		const config = await configPromise;

		window['badgrConfig'] = config;

		await timeoutPromise(1000);

		initializeTheme(configService);
	};
};

@NgModule({
	imports: [
		...COMMON_IMPORTS,
		BrowserModule,
		RouterModule.forRoot(ROUTE_CONFIG),
		Angulartics2Module.forRoot(),
		BadgrCommonModule.forRoot(),
		BrowserAnimationsModule
	],
	declarations: [
		AppComponent,
		InitialRedirectComponent
	],
	bootstrap: [
		AppComponent,
	],
	providers: [
		Angulartics2,
		Angulartics2GoogleTagManager,
		RecipientBadgeApiService,
		{provide: RouteReuseStrategy, useClass: BadgrRouteReuseStrategy},
		{
			provide: APP_INITIALIZER,
			useFactory: appInitializerFn,
			multi: true,
			deps: [AppConfigService]
		}
	]
})
export class AppModule {
}
