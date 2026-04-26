import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit, OnDestroy, AfterViewInit {

  private api    = `${environment.apiUrl}/admin`;
  private secApi = `${environment.apiUrl}/security`;
  private incApi = `${environment.apiUrl}/incidents`;
  private thrApi = `${environment.apiUrl}/threats`;
  private aiApi  = 'http://localhost:5000';

  private refreshInterval: any;
  private alertInterval:   any;
  private charts: Record<string, Chart> = {};

  // ── State ────────────────────────────────────────────────────────────
  staffUser: any     = null;
  activeTab          = 'overview';
  isLoading          = true;
  lastRefreshed      = new Date();

  // ── Data ─────────────────────────────────────────────────────────────
  stats: any         = {};
  systemHealth: any  = {};
  users: any[]       = [];
  applications: any[]= [];
  incidents: any[]   = [];
  threats: any[]     = [];
  logs: any[]        = [];
  alerts: any[]      = [];
  aiPredictions: any[]= [];

  // ── UI helpers ────────────────────────────────────────────────────────
  unreadAlertCount   = 0;
  showAlertPanel     = false;
  incidentSearch     = '';
  threatSearch       = '';
  userSearch         = '';

  // ── Incident form ────────────────────────────────────────────────────
  showIncidentForm   = false;
  editingIncidentId: number | null = null;
  incidentForm = new FormGroup({
    title:          new FormControl('', [Validators.required, Validators.minLength(3)]),
    description:    new FormControl(''),
    severity:       new FormControl('', Validators.required),
    type:           new FormControl('', Validators.required),
    status:         new FormControl('OPEN'),
    affectedSystem: new FormControl(''),
    reportedBy:     new FormControl('')
  });

  // ── Threat form ───────────────────────────────────────────────────────
  showThreatForm     = false;
  editingThreatId: number | null = null;
  threatForm = new FormGroup({
    name:        new FormControl('', [Validators.required, Validators.minLength(2)]),
    category:    new FormControl('', Validators.required),
    description: new FormControl(''),
    status:      new FormControl('ACTIVE'),
    source:      new FormControl('')
  });

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────

  ngOnInit() {
    this.staffUser = this.authService.getUser();
    if (!this.authService.isStaff()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadAll();
    this.refreshInterval = setInterval(() => {
      this.loadStats(); this.loadHealth();
      this.loadIncidents(); this.loadThreats();
      this.lastRefreshed = new Date();
    }, 15000);
    this.alertInterval = setInterval(() => this.loadAlerts(), 8000);
  }

  ngAfterViewInit() {
    setTimeout(() => this.buildCharts(), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
    clearInterval(this.alertInterval);
    Object.values(this.charts).forEach(c => c.destroy());
  }

  // ── Load all ──────────────────────────────────────────────────────────

  loadAll() {
    this.isLoading = true;
    Promise.all([
      this.loadStats(),
      this.loadHealth(),
      this.loadUsers(),
      this.loadApplications(),
      this.loadIncidents(),
      this.loadThreats(),
      this.loadLogs(),
      this.loadAlerts(),
      this.loadAiPredictions()
    ]).finally(() => { this.isLoading = false; });
  }

  private get<T>(url: string): Promise<T> {
    return this.http.get<T>(url).toPromise() as Promise<T>;
  }

  loadStats()        { return this.get<any>(`${this.api}/stats`).then(d => { this.stats = d; }); }
  loadHealth()       { return this.get<any>(`${this.api}/health`).then(d => { this.systemHealth = d; }); }
  loadUsers()        { return this.get<any[]>(`${this.api}/users`).then(d => { this.users = d ?? []; }); }
  loadApplications() { return this.get<any[]>(`${this.api}/applications`).then(d => { this.applications = d ?? []; }); }
  loadIncidents()    { return this.get<any[]>(this.incApi).then(d => { this.incidents = d ?? []; this.updateCharts(); }); }
  loadThreats()      { return this.get<any[]>(this.thrApi).then(d => { this.threats = d ?? []; this.updateCharts(); }); }
  loadLogs()         { return this.get<any[]>(`${this.secApi}/logs`).then(d => { this.logs = d ?? []; }); }
  loadAlerts()       {
    return this.get<any[]>(`${this.secApi}/alerts`).then(d => {
      this.alerts = d ?? [];
      this.unreadAlertCount = this.alerts.filter(a => a.status === 'UNREAD').length;
    });
  }
  loadAiPredictions() {
  return this.get<any[]>(`${this.aiApi}/predict`)
    .then(d => {
      console.log("AI RESPONSE:", d);   // ✅ ADD THIS
      this.aiPredictions = d ?? [];
    })
    .catch((err) => {
      console.error("AI ERROR:", err); // ✅ ADD THIS
      this.aiPredictions = [];
    });
}

  // ── Filtered views ────────────────────────────────────────────────────

  get filteredIncidents() {
    const q = this.incidentSearch.toLowerCase();
    return this.incidents.filter(i =>
      !q || i.title?.toLowerCase().includes(q) ||
            i.type?.toLowerCase().includes(q) ||
            i.severity?.toLowerCase().includes(q)
    );
  }

  get filteredThreats() {
    const q = this.threatSearch.toLowerCase();
    return this.threats.filter(t =>
      !q || t.name?.toLowerCase().includes(q) ||
            t.category?.toLowerCase().includes(q)
    );
  }

  get filteredUsers() {
    const q = this.userSearch.toLowerCase();
    return this.users.filter(u =>
      !q || u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
    );
  }

  // ── Charts ────────────────────────────────────────────────────────────

  buildCharts() {
    this.buildSeverityChart();
    this.buildTypeChart();
    this.buildThreatRiskChart();
    this.buildActivityChart();
  }

  private destroyChart(key: string) {
    if (this.charts[key]) { this.charts[key].destroy(); delete this.charts[key]; }
  }

  buildSeverityChart() {
    const ctx = document.getElementById('severityChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.destroyChart('severity');
    const counts: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    this.incidents.forEach(i => { if (counts[i.severity] !== undefined) counts[i.severity]++; });
    this.charts['severity'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(counts),
        datasets: [{ data: Object.values(counts), backgroundColor: ['#22c55e','#f59e0b','#f97316','#ef4444'], borderWidth: 0 }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }

  buildTypeChart() {
    const ctx = document.getElementById('typeChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.destroyChart('type');
    const counts: Record<string, number> = {};
    this.incidents.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1; });
    this.charts['type'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(counts),
        datasets: [{ label: 'Count', data: Object.values(counts), backgroundColor: '#6366f1', borderRadius: 6 }]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
  }

  buildThreatRiskChart() {
    const ctx = document.getElementById('threatRiskChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.destroyChart('threatRisk');
    const counts: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    this.threats.forEach(t => { if (counts[t.riskLevel] !== undefined) counts[t.riskLevel]++; });
    this.charts['threatRisk'] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(counts),
        datasets: [{ data: Object.values(counts), backgroundColor: ['#22c55e','#f59e0b','#f97316','#ef4444'], borderWidth: 0 }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }

  buildActivityChart() {
    const ctx = document.getElementById('activityChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.destroyChart('activity');
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    const incByDay = last7.map(day => this.incidents.filter(i => i.createdAt?.startsWith(day)).length);
    const thrByDay = last7.map(day => this.threats.filter(t => t.detectedAt?.startsWith(day)).length);
    this.charts['activity'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: last7.map(d => d.slice(5)),
        datasets: [
          { label: 'Incidents', data: incByDay, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', tension: 0.4, fill: true },
          { label: 'Threats',   data: thrByDay, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)',  tension: 0.4, fill: true }
        ]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
  }

  updateCharts() {
    if (Object.keys(this.charts).length > 0) {
      this.buildSeverityChart();
      this.buildTypeChart();
      this.buildThreatRiskChart();
      this.buildActivityChart();
    }
  }

  // ── Incident CRUD ─────────────────────────────────────────────────────

  openCreateIncident() {
    this.editingIncidentId = null;
    this.incidentForm.reset({ status: 'OPEN' });
    this.showIncidentForm = true;
  }

  openEditIncident(inc: any) {
    this.editingIncidentId = inc.id;
    this.incidentForm.patchValue(inc);
    this.showIncidentForm = true;
  }

  saveIncident() {
    if (this.incidentForm.invalid) { this.incidentForm.markAllAsTouched(); return; }
    const body = this.incidentForm.value;
    const req = this.editingIncidentId
      ? this.http.put(`${this.incApi}/${this.editingIncidentId}`, body)
      : this.http.post(this.incApi, body);

    req.subscribe({
      next: () => { this.showIncidentForm = false; this.loadIncidents(); },
      error: (e) => alert(e.error?.message || 'Save failed')
    });
  }

  deleteIncident(id: number) {
    if (!confirm('Delete this incident?')) return;
    this.http.delete(`${this.incApi}/${id}`).subscribe({
      next: () => this.loadIncidents(),
      error: (e) => alert(e.error?.message || 'Delete failed')
    });
  }

  // ── Threat CRUD ───────────────────────────────────────────────────────

  openCreateThreat() {
    this.editingThreatId = null;
    this.threatForm.reset({ status: 'ACTIVE' });
    this.showThreatForm = true;
  }

  openEditThreat(t: any) {
    this.editingThreatId = t.id;
    this.threatForm.patchValue(t);
    this.showThreatForm = true;
  }

  saveThreat() {
    if (this.threatForm.invalid) { this.threatForm.markAllAsTouched(); return; }
    const body = this.threatForm.value;
    const req = this.editingThreatId
      ? this.http.put(`${this.thrApi}/${this.editingThreatId}`, body)
      : this.http.post(this.thrApi, body);

    req.subscribe({
      next: () => { this.showThreatForm = false; this.loadThreats(); },
      error: (e) => alert(e.error?.message || 'Save failed')
    });
  }

  deleteThreat(id: number) {
    if (!confirm('Delete this threat?')) return;
    this.http.delete(`${this.thrApi}/${id}`).subscribe({
      next: () => this.loadThreats(),
      error: (e) => alert(e.error?.message || 'Delete failed')
    });
  }

  // ── Users ─────────────────────────────────────────────────────────────

  deleteUser(id: number) {
    if (!confirm('Permanently delete this user?')) return;
    this.http.delete(`${this.api}/users/${id}`).subscribe({
      next: () => this.loadUsers(),
      error: (e) => alert(e.error?.message || 'Delete failed')
    });
  }

  // ── Alerts ────────────────────────────────────────────────────────────

  markAlertRead(id: number) {
    this.http.put(`${this.secApi}/alerts/${id}/read`, {}).subscribe({
      next: () => this.loadAlerts()
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  setTab(tab: string) { this.activeTab = tab; }

  severityClass(s: string): string {
    return { CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }[s] ?? '';
  }

  logout() { this.authService.logout(); }
}
