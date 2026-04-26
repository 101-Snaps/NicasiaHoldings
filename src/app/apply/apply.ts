import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormsModule,
  FormGroup, FormControl, FormArray, Validators, AbstractControl
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApplyService } from './apply.service';

@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './apply.html',
  styleUrls: ['./apply.css']
})
export class ApplyComponent implements OnInit {

  selectedJob: any = null;
  isSubmitting = false;
  submitError  = '';
  cvFile:  File | null = null;
  idFile:  File | null = null;
  cvError  = '';
  idError  = '';

  applyForm = new FormGroup({
    full_name:          new FormControl('', [Validators.required, Validators.minLength(3)]),
    email:              new FormControl('', [Validators.required, Validators.email]),
    phone:              new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]),
    gender:             new FormControl('', Validators.required),
    nationality:        new FormControl('', Validators.required),
    id_number:          new FormControl('', [
                          Validators.required,
                          Validators.minLength(13),
                          Validators.maxLength(13),
                          Validators.pattern(/^[0-9]+$/)
                        ]),
    has_disability:     new FormControl(false),
    disability_details: new FormControl(''),
    education:          new FormArray([this.createEducation()]),
    experience:         new FormArray([this.createExperience()])
  });

  constructor(private router: Router, private applyService: ApplyService) {}

  ngOnInit() {
    const job = localStorage.getItem('selectedJob');
    if (job) {
      this.selectedJob = JSON.parse(job);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // ── FormArray helpers ─────────────────────────────────────────────────

  get educationArray(): FormArray {
    return this.applyForm.get('education') as FormArray;
  }

  get experienceArray(): FormArray {
    return this.applyForm.get('experience') as FormArray;
  }

  createEducation(): FormGroup {
    return new FormGroup({
      qualification: new FormControl('', Validators.required),
      institution:   new FormControl('', Validators.required),
      year:          new FormControl<number | null>(null, [
                       Validators.required,
                       Validators.min(1950),
                       Validators.max(new Date().getFullYear())
                     ])
    });
  }

  createExperience(): FormGroup {
    return new FormGroup({
      company:     new FormControl('', Validators.required),
      role:        new FormControl('', Validators.required),
      years:       new FormControl<number | null>(null, [
                     Validators.required,
                     Validators.min(0),
                     Validators.max(50)
                   ]),
      description: new FormControl('')
    });
  }

  addEducation(): void {
    this.educationArray.push(this.createEducation());
  }

  removeEducation(i: number): void {
    if (this.educationArray.length > 1) this.educationArray.removeAt(i);
  }

  addExperience(): void {
    this.experienceArray.push(this.createExperience());
  }

  removeExperience(i: number): void {
    if (this.experienceArray.length > 1) this.experienceArray.removeAt(i);
  }

  // ── Convenience getter for template ──────────────────────────────────

  f(name: string): AbstractControl {
    return this.applyForm.get(name)!;
  }

  // ── File handling ─────────────────────────────────────────────────────

  onCvSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.cvError = '';
    this.cvFile  = null;
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.cvError = 'CV must be a PDF file'; return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.cvError = 'CV must be smaller than 5 MB'; return;
    }
    this.cvFile = file;
  }

  onIdSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.idError = '';
    this.idFile  = null;
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.idError = 'ID document must be a PDF file'; return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.idError = 'ID document must be smaller than 5 MB'; return;
    }
    this.idFile = file;
  }

  // ── Submit ────────────────────────────────────────────────────────────

  onSubmit(): void {
    this.applyForm.markAllAsTouched();
    this.submitError = '';

    if (this.applyForm.invalid) {
      this.submitError = 'Please fill in all required fields correctly.';
      return;
    }
    if (!this.cvFile) { this.cvError = 'CV is required'; return; }
    if (!this.idFile) { this.idError = 'ID document is required'; return; }

    this.isSubmitting = true;

    // getRawValue() always returns concrete values (never undefined),
    // regardless of whether any controls are disabled. This resolves
    // TS2345: "any[] | undefined is not assignable to any[]" which
    // occurs because FormGroup.value marks array fields as potentially
    // undefined when controls can be disabled.
    const raw = this.applyForm.getRawValue();

    const data = {
      full_name:          raw.full_name,
      email:              raw.email,
      phone:              raw.phone,
      gender:             raw.gender,
      nationality:        raw.nationality,
      id_number:          raw.id_number,
      has_disability:     raw.has_disability,
      disability_details: raw.disability_details
    };

    this.applyService.submitApplication(
      data,
      raw.education   ?? [],   // fallback keeps TypeScript happy
      raw.experience  ?? [],
      this.selectedJob,
      this.cvFile,
      this.idFile
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        localStorage.removeItem('selectedJob');
        alert('Your application has been submitted successfully! 🎉');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.message || 'Submission failed. Please try again.';
      }
    });
  }
}
