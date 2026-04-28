import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,

  // ✅ Re-added HttpClientModule ONLY for stats (safe, controlled usage)
  imports: [CommonModule, FormsModule, HttpClientModule],

  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  // =========================
  // 🔹 USER + UI STATE
  // =========================
  userName: string = '';
  searchTerm: string = '';
  selectedFilter: string = 'All';
  isLoading = true;

  // =========================
  // 🔹 STATS (NEW)
  // =========================
  api = environment.apiUrl;

  appCount: number | null = null;
  savedCount: number | null = null;
  profileCompletion: number | null = null;

  // =========================
  // 🔹 JOB DATA (UNCHANGED)
  // =========================
  jobs: any[] = [];

  private readonly fallbackJobs = [
    {
      title: 'Insurance Learnership with AON',
      company: 'AON South Africa',
      location: 'Johannesburg',
      salary: 'R6,500/month',
      deadline: '15 April 2026',
      type: 'Learnership',
      description: 'Jumpstart your career in the insurance industry with this comprehensive 12-month learnership programme.',
      requirements: [
        'Grade 12 certificate (Matric)',
        'Age: 18-35 years',
        'South African citizen',
        'Strong communication skills',
        'Basic computer literacy'
      ]
    },
    {
      title: 'Financial Administration Learnership',
      company: 'Various Financial Institutions',
      location: 'Pretoria & Johannesburg',
      salary: 'R4,500/month',
      deadline: '30 April 2026',
      type: 'Learnership',
      description: 'Develop essential skills in financial administration including bookkeeping and financial reporting.',
      requirements: [
        'Grade 12 certificate',
        'Age: 18-30 years',
        'Mathematics or Accounting advantageous',
        'Computer skills (MS Office)'
      ]
    },
    {
      title: 'Graduate Programme - Human Resources',
      company: 'Leading Corporate Institutions',
      location: 'Cape Town',
      salary: 'R8,000/month',
      deadline: '20 April 2026',
      type: 'Graduate Programme',
      description: '12-month graduate programme designed to develop future HR professionals.',
      requirements: [
        "Bachelor's degree in HR, Psychology, or related field",
        'Recent graduate (within last 2 years)',
        'Strong interpersonal skills'
      ]
    },
    {
      title: 'IT Support Technician Learnership',
      company: 'Technology Solutions Provider',
      location: 'Durban',
      salary: 'R5,000/month',
      deadline: '10 May 2026',
      type: 'Learnership',
      description: 'Build your IT career with hands-on experience in technical support and network management.',
      requirements: [
        'Grade 12 certificate with Mathematics',
        'Age: 18-30 years',
        'Basic understanding of computer systems'
      ]
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient // ✅ Added safely
  ) {}

  ngOnInit() {
    // ✅ USER
    const user = this.authService.getUser();
    this.userName = user?.name || user?.email || 'there';

    // ✅ JOBS (unchanged, still no API → no 403 risk)
    this.jobs = this.fallbackJobs;
    this.isLoading = false;

    // ✅ STATS (separate, safe API call)
    this.loadApplicationCount();

    // Leave these null → UI shows "Coming soon"
    // this.loadSavedJobs();
    // this.loadProfileCompletion();
  }

  // =========================
  // 🔹 STATS METHODS
  // =========================

  private loadApplicationCount(): void {
    this.http.get<any[]>(`${this.api}/applications/mine`).subscribe({
      next: (apps) => {
        this.appCount = Array.isArray(apps) ? apps.length : 0;
      },
      error: (err) => {
        console.warn('Applications API failed:', err);
        this.appCount = 0; // fallback (still better than fake data)
      }
    });
  }

  loadSavedJobs(): void {
    this.http.get<any[]>(`${this.api}/jobs/saved`).subscribe({
      next: (jobs) => this.savedCount = jobs.length,
      error: () => this.savedCount = 0
    });
  }

  loadProfileCompletion(): void {
    this.http.get<any>(`${this.api}/profile/me`).subscribe({
      next: (profile) => this.profileCompletion = this.calculateProfileCompletion(profile),
      error: () => this.profileCompletion = 0
    });
  }

  private calculateProfileCompletion(profile: any): number {
    if (!profile) return 0;

    const fields = ['name', 'email', 'phone', 'cv', 'skills'];
    const completed = fields.filter(field => !!profile[field]).length;

    return Math.round((completed / fields.length) * 100);
  }

  // =========================
  // 🔹 EXISTING METHODS
  // =========================

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  filteredJobs() {
    let result = this.jobs;

    if (this.selectedFilter !== 'All') {
      result = result.filter(job => job.type === this.selectedFilter);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(job =>
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term)
      );
    }

    return result;
  }

  filterVacancies(type: string) {
    this.selectedFilter = type;
  }

  apply(job: any) {
    localStorage.setItem('selectedJob', JSON.stringify(job));
    this.router.navigate(['/apply']);
  }

  applyForJob(job: any) {
    localStorage.setItem('selectedJob', JSON.stringify(job));
    this.router.navigate(['/apply']);
  }

  filteredVacancies() {
    return this.filteredJobs();
  }
}
