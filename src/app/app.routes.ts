import { Routes } from '@angular/router';
import { TicketListComponent } from './features/tickets/ticket-list/ticket-list';
import { TicketFormComponent } from './features/tickets/ticket-form/ticket-form';

export const routes: Routes = [
  { path: '', component: TicketListComponent },
  { path: 'create', component: TicketFormComponent }
];
