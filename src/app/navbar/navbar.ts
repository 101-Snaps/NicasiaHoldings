import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {

  isLoggedIn = false;
  userRole   = '';
  userName   = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.refresh();
    // Re-check auth state on every navigation
    this.router.events.subscribe(() => this.refresh());
  }

  refresh() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.authService.getUser();
      this.userRole = user?.role ?? '';
      this.userName = user?.name ?? user?.email ?? '';
    } else {
      this.userRole = '';
      this.userName = '';
    }
  }

  onLogout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userRole   = '';
    this.userName   = '';
  }
}
