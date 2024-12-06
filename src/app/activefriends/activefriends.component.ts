import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgFor } from '@angular/common';
import { UserService } from '../user.service';
import { headers } from '../util/app.constants';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-activefriends',
  standalone: true,
  imports: [NgFor, HttpClientModule], // Import NgFor here
  templateUrl: './activefriends.component.html',
  styleUrls: ['./activefriends.component.css']
})
export class ActivefriendsComponent implements OnInit {
  activeFriends: { name: string; profileImageUrl: string }[] = [];
  userId: number | null = null;

  constructor(private http: HttpClient, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUser().subscribe(user => {
      this.userId = user?.id || null;
      if (this.userId !== null) {
        this.fetchActiveFriends();
      }
    });
  }

  fetchActiveFriends() {
    if (this.userId === null) {
      console.error('User ID is not available');
      return;
    }

    this.http.get(`${environment.BASE_URL}/follow-management/following/${this.userId}`, { headers }).subscribe((response: any) => {
      this.activeFriends = response.body.map((friend: any) => ({
        name: friend.name,
        profileImageUrl: friend.profileImageUrl,
      }));
    });
  }
}
