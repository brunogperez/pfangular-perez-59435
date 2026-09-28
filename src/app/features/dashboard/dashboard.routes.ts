import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { HomeComponent } from './home/home.component';
import { ResellersComponent } from './resellers/resellers.component';
import { EndCustomersComponent } from './end-customers/end-customers.component';
import { PlansComponent } from './plans/plans.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { CreditsComponent } from './credits/credits.component';
import {
  resellersFeatureName,
  resellersReducer,
} from '../../store/reducers/resellers.reducer';
import { ResellersEffects } from '../../store/effects/resellers.effects';
import {
  endCustomersFeatureName,
  endCustomersReducer,
} from '../../store/reducers/end-customers.reducer';
import { EndCustomersEffects } from '../../store/effects/end-customers.effects';
import {
  plansFeatureName,
  plansReducer,
} from '../../store/reducers/plans.reducer';
import { PlansEffects } from '../../store/effects/plans.effects';
import {
  subscriptionsFeatureName,
  subscriptionsReducer,
} from '../../store/reducers/subscriptions.reducer';
import { SubscriptionsEffects } from '../../store/effects/subscriptions.effects';
import {
  creditsFeatureName,
  creditsReducer,
} from '../../store/reducers/credits.reducer';
import { CreditsEffects } from '../../store/effects/credits.effects';
import { CreditsDetailComponent } from './credits/credits-detail/credits-detail.component';
import { roleGuard } from '../../core/guards';

export const DASHBOARD_ROUTES: Routes = [
  { path: 'home', component: HomeComponent },
  {
    path: 'resellers',
    component: ResellersComponent,
    canActivate: [roleGuard(['admin'])],
    providers: [
      provideState(resellersFeatureName, resellersReducer),
      provideEffects(ResellersEffects),
    ],
  },
  {
    path: 'end-customers',
    component: EndCustomersComponent,
    providers: [
      provideState(endCustomersFeatureName, endCustomersReducer),
      provideEffects(EndCustomersEffects),
    ],
  },
  {
    path: 'plans',
    component: PlansComponent,
    canActivate: [roleGuard(['admin'])],
    providers: [
      provideState(plansFeatureName, plansReducer),
      provideEffects(PlansEffects),
    ],
  },
  {
    path: 'subscriptions',
    component: SubscriptionsComponent,
    providers: [
      provideState(subscriptionsFeatureName, subscriptionsReducer),
      provideEffects(SubscriptionsEffects),
    ],
  },
  {
    path: 'credits',
    component: CreditsComponent,
    canActivate: [roleGuard(['admin'])],
    providers: [
      provideState(creditsFeatureName, creditsReducer),
      provideEffects(CreditsEffects),
    ],
  },
  {
    path: 'credits/:id',
    component: CreditsDetailComponent,
    canActivate: [roleGuard(['admin'])],
    providers: [
      provideState(creditsFeatureName, creditsReducer),
      provideEffects(CreditsEffects),
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', redirectTo: 'home' },
];
