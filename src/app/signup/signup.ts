import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  // FIX: Use AuthService instead of UserService — single service for all auth calls.
  // Added HttpClientModule so the component can make HTTP requests standalone.
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class SignupComponent implements AfterViewInit {

  @ViewChild('signupSection') signupSection!: ElementRef<HTMLElement>;

  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  signupForm = new FormGroup({
    name:     new FormControl('', [Validators.required, Validators.minLength(2)]),
    surname:  new FormControl('', [Validators.required, Validators.minLength(2)]),
    cell:     new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]),
    email:    new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  ngAfterViewInit(): void {
    if (!this.signupSection) return;
    const section = this.signupSection.nativeElement;
    section.addEventListener('mousemove', (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      const blobs = section.querySelectorAll('.bg-animation span') as NodeListOf<HTMLElement>;
      blobs.forEach((blob, i) => {
        blob.style.transform = `translate(${x * (i + 1)}px, ${y * (i + 1)}px)`;
      });
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // FIX: Use AuthService.register() — consolidates all auth HTTP calls
    // through one service, consistent with how login works.
    this.authService.register(this.signupForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Account created successfully! You can now sign in.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        alert(err.error?.message || 'Sign up failed. Please try again.');
      }
    });
  }
}
