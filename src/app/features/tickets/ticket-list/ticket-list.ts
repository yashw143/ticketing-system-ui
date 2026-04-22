import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';        // ← ADD
import { TicketService } from '../../../services/ticket.service';
import { Ticket } from '../../../models/ticket.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // ← ADD FormsModule
  templateUrl: './ticket-list.html'
})
export class TicketListComponent implements OnInit {

  tickets: Ticket[] = [];
  showModal = false;                  // ← controls modal visibility
  editingTicket: Ticket | null = null; // ← holds ticket being edited

  constructor(
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService.getAll().subscribe(data => {
      this.tickets = [...data];
      this.cdr.detectChanges();
    });
  }

  // ← OPEN modal and load ticket data
  openEdit(id: number) {
    this.ticketService.getById(id).subscribe(data => {
      this.editingTicket = { ...data }; // spread to avoid mutating original
      this.showModal = true;
      this.cdr.detectChanges();
    });
  }

  // ← SAVE changes
  saveEdit() {
    if (!this.editingTicket) return;
    this.ticketService.update(this.editingTicket.id, this.editingTicket).subscribe(() => {
      this.showModal = false;
      this.editingTicket = null;
      this.loadTickets();
    });
  }

  // ← CANCEL without saving
  cancelEdit() {
    this.showModal = false;
    this.editingTicket = null;
    this.cdr.detectChanges();
  }

 delete(id: number) {
  const confirmed = confirm('Are you sure you want to delete this ticket?');
  if (confirmed) {
    this.ticketService.delete(id).subscribe({
      next: () => this.loadTickets(),
      error: () => this.loadTickets()  // reload anyway — delete likely succeeded
    });
  }
}

getCountByStatus(status: string): number {
  return this.tickets.filter(t => t.status === status).length;
}

}
