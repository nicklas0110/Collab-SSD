import { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { DashboardComponent } from './dashboard/components/dashboard/dashboard.component';
import { ProfileDetailsComponent } from './profile/components/profile-details/profile-details.component';
import { MessageListComponent } from './messages/components/message-list/message-list.component';
import { CollaborationListComponent } from './collaboration/components/collaboration-list/collaboration-list.component';
import { authGuard } from './auth/guards/auth.guard';
import { RegisterComponent } from './auth/components/register/register.component';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [authGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileDetailsComponent, canActivate: [authGuard] },
  { path: 'messages', component: MessageListComponent, canActivate: [authGuard] },
  { path: 'collaborations', component: CollaborationListComponent, canActivate: [authGuard] },
  {
    path: 'admin',
    loadComponent: () => 
      import('./admin/components/admin-dashboard/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, adminGuard]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
