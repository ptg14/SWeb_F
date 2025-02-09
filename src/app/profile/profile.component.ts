import { Component, OnInit } from '@angular/core';
import { PostComponent } from '../post/post.component';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { headers } from '../util/app.constants';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

interface Post {
  id: number;
  authorImage: string;
  authorName: string;
  postDate: string;
  postContent: string;
  postImage: string;
  comments: PostComment[];
  inProfile: boolean;
}

interface PostComment {
  authorImage: string;
  authorName: string;
  content: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PostComponent, NgFor, FormsModule, NgIf, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  posts: Post[] = [];
  user: any = null;

  editMode: boolean = false;
  name: string = '';
  email: string = '';
  password: string = '';
  phone: string = '';
  address: string = '';
  profileImage: File | null = null;
  profileImagePreview: string | ArrayBuffer | null = null; // New property

  loading: boolean = false; // Add this variable

  constructor(private http: HttpClient, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUser().subscribe(user => {
      this.user = user;
      if (this.user) {
        this.name = this.user.name;
        this.email = this.user.email;
        this.phone = this.user.phone;
        this.address = this.user.address;

        this.FetchPosts();
      }
    });
  }

  FetchPosts() {
    if (this.user) {
      this.http.get(`${environment.BASE_URL}/posts/user/${this.user.id}`, { headers })
        .subscribe((response: any) => {
          console.log('Backend response:', response.body);
          this.posts = response.body.map((post: any) => ({
            id: post.id,
            authorImage: post.profileImageUrl,
            authorName: post.authorName || 'Unknown',
            postDate: new Date(post.publishedOn).toLocaleString(),
            postContent: post.content,
            postImage: post.postImageUrl,
            comments: post.comments.map((comment: any) => ({
              commentId: comment.id,
              content: comment.content,
              authorName: comment.author.name || 'Unknown',
              authorImage: comment.author.profileImageUrl,
              postId: post.id,
              isAuth: comment.author.id === this.user?.id,
            })),
            inProfile: true,
          }));
        });
    }
  }

  // File selection handler
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileImage = file;

      // Create a FileReader to read the file
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result; // Set the preview URL
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  }

  // Update profile information
  updateProfile() {
    if (!this.user || !this.user.id) {
      console.error('User not found');
      return;
    }

    const formData = new FormData();
    formData.append('Name', this.name);
    formData.append('Email', this.email);
    formData.append('Password', this.password); // Password can be blank if not updating
    formData.append('Phone', this.phone);
    formData.append('Address', this.address);

    if (this.profileImage) {
      formData.append('ProfileImage', this.profileImage);
    }

    this.loading = true; // Set loading to true

    this.http.put(`${environment.BASE_URL}/users/${this.user.id}`, formData, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Backend response:', response);

          if(response.statusCode === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Profile Updated',
              text: 'Your profile has been updated successfully!',
            });

            // Update local storage with new user data
            const updatedUser = {
              ...this.user,
              name: this.name,
              email: this.email,
              phone: this.phone,
              address: this.address,
              profileImageUrl: response.body
            };
            this.userService.setUser(updatedUser); // Update user in UserService
            this.editMode = false; // Exit edit mode
          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Profile Update Failed',
              text: 'An error occurred while updating your profile!',
            });
          }
        },
        error: (error) => {
          console.error('Error updating profile', error);
          Swal.fire({
            icon: 'error',
            title: 'Profile Update Failed',
            text: 'An error occurred while updating your profile!',
          });
        },
        complete: () => {
          this.loading = false; // Set loading to false when complete
        }
      });
  }

  // Toggle edit mode
  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  // Handle post deletion
  onPostDeleted(postId: number) {
    this.posts = this.posts.filter(post => post.id !== postId);
  }
}
