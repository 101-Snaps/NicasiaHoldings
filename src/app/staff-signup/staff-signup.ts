import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { passwordMatchValidator } from '../signup/validators';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-staff-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './staff-signup.html',
  styleUrls: ['./staff-signup.css']
})
export class StaffSignupComponent {

  constructor(private authService: AuthService, private router: Router) {}

  staffForm = new FormGroup({
    name:            new FormControl('', [Validators.required, Validators.minLength(2)]),
    surname:         new FormControl('', [Validators.required]),
    cell:            new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]),
    email:           new FormControl('', [Validators.required, Validators.email]),
    password:        new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),  // FIX #1: was missing, broke the form and passwordMatchValidator
    staffCode:       new FormControl('', [Validators.required])
  }, { validators: passwordMatchValidator() });

  onSubmit(): void {
    if (this.staffForm.valid) {
      // FIX #2: destructure out confirmPassword so it is not sent to the API
      const { confirmPassword, ...rest } = this.staffForm.value;
      const payload = { ...rest, role: 'STAFF' };

      // FIX #3: switched from UserService to AuthService — single source of truth for auth calls
      this.authService.register(payload).subscribe({
        next: () => {
          alert('Staff account created successfully! You can now login.');
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          alert(err.error?.message || 'Registration failed. Check your access code.');
        }
      });
    } else {
      this.staffForm.markAllAsTouched();
    }
  }
}
