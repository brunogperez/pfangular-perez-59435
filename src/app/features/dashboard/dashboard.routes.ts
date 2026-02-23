import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { clientFeature } from './clients/store/client.reducer';
import { ClientEffects } from './clients/store/client.effects';
import { userFeature } from './users/store/user.reducer';
import { UserEffects } from './users/store/user.effects';
import { productFeature } from './products/store/product.reducer';
import { ProductEffects } from './products/store/product.effects';
import { inscriptionFeature } from './inscriptions/store/inscription.reducer';
import { InscriptionEffects } from './inscriptions/store/inscription.effects';
import { HomeComponent } from './home/home.component';
import { ClientsComponent } from './clients/clients.component';
import { ClientDetailComponent } from './clients/client-detail/client-detail.component';
import { UsersComponent } from './users/users.component';
import { UserDetailComponent } from './users/user-detail/user-detail.component';
import { ProductsComponent } from './products/products.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { InscriptionsComponent } from './inscriptions/inscriptions.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'users',
    canActivate: [roleGuard],
    providers: [
      provideState(userFeature),
      provideEffects(UserEffects),
    ],
    children: [
      { path: '', component: UsersComponent },
      { path: ':id/detail', component: UserDetailComponent },
    ],
  },
  {
    path: 'clients',
    providers: [
      provideState(clientFeature),
      provideEffects(ClientEffects),
      provideState(inscriptionFeature),
      provideEffects(InscriptionEffects),
      provideState(productFeature),
      provideEffects(ProductEffects),
    ],
    children: [
      { path: '', component: ClientsComponent },
      { path: ':id/detail', component: ClientDetailComponent },
    ],
  },
  {
    path: 'products',
    providers: [
      provideState(productFeature),
      provideEffects(ProductEffects),
      provideState(inscriptionFeature),
      provideEffects(InscriptionEffects),
      provideState(clientFeature),
      provideEffects(ClientEffects),
    ],
    children: [
      { path: '', component: ProductsComponent },
      { path: ':id/detail', component: ProductDetailComponent },
    ],
  },
  {
    path: 'inscriptions',
    providers: [
      provideState(inscriptionFeature),
      provideEffects(InscriptionEffects),
      provideState(clientFeature),
      provideEffects(ClientEffects),
      provideState(productFeature),
      provideEffects(ProductEffects),
    ],
    children: [
      { path: '', component: InscriptionsComponent },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
