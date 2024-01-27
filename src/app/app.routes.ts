import { Routes } from '@angular/router';
import { SearchBarComponent } from './ui/search-bar/search-bar-component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/search-bar/search-bar-component').then(
        (m) => m.SearchBarComponent
      ),
  },
];
