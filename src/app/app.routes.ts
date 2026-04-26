import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { SignupComponent } from './signup/signup';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { ApplyComponent } from './apply/apply';
import { StaffSignupComponent } from './staff-signup/staff-signup';
import { AdminComponent } from './admin/admin';
import { AuthGuard } from './guards/auth.guard';
import { StaffGuard } from './guards/staff.guard';

export const routes: Routes = [
  { path: '',           component: HomeComponent },
  { path: 'about',     component: About },
  { path: 'contact',   component: Contact },
  { path: 'signup',    component: SignupComponent },
  { path: 'login',     component: LoginComponent },
  { path: 'staff-signup', component: StaffSignupComponent },

  // Authenticated routes
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'apply',     component: ApplyComponent,     canActivate: [AuthGuard] },

  // Staff-only route
  { path: 'admin',     component: AdminComponent,     canActivate: [AuthGuard, StaffGuard] },

  { path: '**', redirectTo: '' }
];
