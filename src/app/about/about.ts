import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class About implements OnInit {  // ← Make sure it's 'About', not 'AboutComponent'
  
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.checkScrollPosition();
    }, 100);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.checkScrollPosition();
  }

  private checkScrollPosition(): void {
    const reveals = document.querySelectorAll('.reveal');
    
    for (let i = 0; i < reveals.length; i++) {
      const windowHeight = window.innerHeight;
      const elementTop = reveals[i].getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < windowHeight - elementVisible) {
        reveals[i].classList.add('active');
      }
    }
  }
}