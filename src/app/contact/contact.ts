import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

declare const emailjs: any;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact {
  
  formData = {
    name: '',
    email: '',
    message: ''
  };

  isSending = false;
  messageSent = false;
  errorMessage = '';

  constructor() {
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
      emailjs.init("lw50ljNBeCM0ETYPX");
    }
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    
    this.isSending = true;
    this.errorMessage = '';

    const templateParams = {
      name: this.formData.name,
      email: this.formData.email,
      message: this.formData.message
    };

    try {
      // Send to HR
      await emailjs.send("service_v2ygg8l", "template_wa44doa", templateParams);
      
      // Send confirmation to user
      await emailjs.send("service_v2ygg8l", "template_b7fj77c", templateParams);
      
      this.messageSent = true;
      this.formData = { name: '', email: '', message: '' };
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        this.messageSent = false;
      }, 5000);
      
    } catch (error) {
      console.error('Email error:', error);
      this.errorMessage = 'Failed to send message. Please try again later.';
    } finally {
      this.isSending = false;
    }
  }
}