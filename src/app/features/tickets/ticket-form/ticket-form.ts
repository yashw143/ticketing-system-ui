import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ticket-form.html'
})
export class TicketFormComponent {

  ticket = {
    title: '',
    description: '',
    status: 'Open'
  };

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private service: TicketService,
    private router: Router
  ) {}

  submit() {
    if (!this.ticket.title.trim()) {
      this.errorMessage = 'Title is required';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.service.create(this.ticket as any).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to create ticket. Please try again.';
        console.error(err);
      }
    });
  }
}
