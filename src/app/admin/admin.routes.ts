import { Routes } from '@angular/router';
import { authGuard } from '../core/guards';
import {
  AdminRouterComponent, DashboardComponent,
  HistoryComponent,
  InventoryComponent,
  ProductsComponent,
  ProvidersComponent,
  RequisitionComponent
} from './containers';

export const adminRoutes: Routes = [{
  path: '',
  component: AdminRouterComponent,
  canActivate: [authGuard],
  children: [
    {
      path: 'dashboard',
      title: 'Inicio',
      component: DashboardComponent
    },
    {
      path: 'inventory',
      title: 'Inventario',
      component: InventoryComponent
    },
    {
      path: 'products',
      title: 'Productos',
      component: ProductsComponent
    },
    {
      path: 'history/:id',
      title: 'Historial',
      component: HistoryComponent
    },
    {
      path: 'providers',
      title: 'Proveedores',
      component: ProvidersComponent
    },
    {
      path: 'requisitions',
      title: 'Requisiciones',
      component: RequisitionComponent
    }
  ]
}];
