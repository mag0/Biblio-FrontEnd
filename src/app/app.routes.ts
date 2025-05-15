import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { OcrViewerComponent } from './components/ocr-viewer/ocr-viewer.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { FormTaskComponent } from './components/form-task/form-task.component';
import { TaskDetailComponent } from './components/task-detail/task-detail.component';
import { UsersViewComponent } from './components/users-view/users-view.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'upload', component: FileUploadComponent, canActivate: [AuthGuard] },
  { path: 'ocr-viewer/:id', component: OcrViewerComponent, canActivate: [AuthGuard] },
  { path: 'tasks', component: TasksComponent, canActivate: [AuthGuard] },
  { path: 'form-task', component: FormTaskComponent, canActivate: [AuthGuard] },
  { path: 'form-task/:id', component: FormTaskComponent, canActivate: [AuthGuard] },
  { path: 'task-detail/:id', component: TaskDetailComponent, canActivate: [AuthGuard] },
  { path: 'users-view', component: UsersViewComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];
