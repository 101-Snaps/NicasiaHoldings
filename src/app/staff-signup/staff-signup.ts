import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';  // ✅ import stays here
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-staff-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],  // ✅ added inside decorator
  templateUrl: './staff-signup.html',
  styleUrls: ['./staff-signup.css']
})
export class StaffSignupComponent {

  constructor(private userService: UserService, private router: Router) {}

  staffForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    surname: new FormControl('', [Validators.required]),
    cell: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    staffCode: new FormControl('', [Validators.required])
  });

  onSubmit(): void {
    if (this.staffForm.valid) {
      const payload = { ...this.staffForm.value, role: 'STAFF' };
      this.userService.register(payload).subscribe({
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
