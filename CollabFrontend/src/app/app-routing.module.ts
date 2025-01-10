const routes: Routes = [
  // ... other routes
  { 
    path: 'collaborations/new', 
    component: CollaborationCreateComponent,
    canActivate: [AuthGuard]
  },
  // ... other routes
];