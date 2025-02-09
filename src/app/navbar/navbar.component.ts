import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../user.service'; // Import UserService

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // Fixed styleUrls property
})
export class NavbarComponent implements OnInit {
  image: any = null;
  user: any = null;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.userService.getUser().subscribe(user => {
      this.user = user;
      this.image = user?.profileImageUrl;
    });
  }

  navigateToHome() {
    this.router.navigate(['home']);
  }

  navigateToFriends() {
    this.router.navigate(['friends']);
  }

  navigateToProfile() {
    this.router.navigate(['profile']);
  }

  logout() {
    if (this.user) {
      this.userService.setUser(null); // This removes the user from localStorage
      this.router.navigate(['/login']); // Redirect to login
    }
  }
}
