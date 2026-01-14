import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { BreedSearchComponent } from './components/breed-search/breed-search.component';
import { PetRegistrationComponent } from './components/pet-registration/pet-registration.component';
import { PetListComponent } from './components/pet-list/pet-list.component';
import { AppointmentCalendarComponent } from './components/appointment-calendar/appointment-calendar.component';
import { AppointmentDashboardComponent } from './components/appointment-dashboard/appointment-dashboard.component';
import { AppointmentListComponent } from './components/appointment-list/appointment-list.component';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'breed-search', component: BreedSearchComponent },
  { 
    path: 'pet-registration', 
    component: PetRegistrationComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'pet-list', 
    component: PetListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'appointment-calendar', 
    component: AppointmentCalendarComponent,
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'appointment-dashboard', 
    component: AppointmentDashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'appointment-list', 
    component: AppointmentListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'notifications', 
    component: NotificationListComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];