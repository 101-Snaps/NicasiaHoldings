import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router'; // ✅ ADD THIS

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule], // ✅ ADD THIS
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements AfterViewInit {

  @ViewChild('homeSection') homeSection!: ElementRef;

  ngAfterViewInit() {
    const home = this.homeSection.nativeElement;

    home.addEventListener('mousemove', (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      const blobs = home.querySelectorAll('.bg-animation span');
      const lines = home.querySelector('.jellyfish-lines') as HTMLElement;

      blobs.forEach((blob: HTMLElement, i: number) => {
        blob.style.transform = `translate(${x * (i + 1)}px, ${y * (i + 1)}px)`;
      });

      if (lines) {
        lines.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
      }
    });
  }
}