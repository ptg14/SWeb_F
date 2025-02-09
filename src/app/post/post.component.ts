import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgFor } from '@angular/common';
import { CommentComponent } from '../comment/comment.component';
import { headers } from '../util/app.constants';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { environment } from '../../environments/environment';

interface PostComment {
  authorImage: string;
  authorName: string;
  content: string;
}

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommentComponent, NgFor, FormsModule, NgIf, HttpClientModule],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {
  @Input() authorImage: string = '';
  @Input() authorName: string = '';
  @Input() postDate: string = '';
  @Input() postContent: string = '';
  @Input() postImage: string = '';
  @Input() comments: any[] = [];
  @Input() postId: number = 0;
  @Input() InProfile: boolean = false;
  @Input() postAuthorName: string = '';
  @Input() postAuthorImage: string = '';

  @Output() postDeleted = new EventEmitter<number>();

  handleCommentDeleted(commentId: number) {
    this.comments = this.comments.filter(
      (comment) => comment.commentId !== commentId
    );
  }

  userId: number = 0;
  newCommentContent: string = '';
  isEditing: boolean = false;
  editedContent: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.userId = JSON.parse(userData).id;
      this.authorImage = JSON.parse(userData).profileImageUrl;
      this.authorName = JSON.parse(userData).name;
    }
  }

  postComment() {
    if (!this.newCommentContent.trim()) {
      console.error('Comment content is empty');
      return;
    }

    const requestBody = {
      content: this.newCommentContent,
      postId: this.postId,
      userId: this.userId,
    };

    this.http.post(`${environment.BASE_URL}/posts/comments`, requestBody, { headers }).subscribe({
      next: (response: any) => {
        console.log('Comment posted successfully', response);
        const newComment: PostComment = {
          authorImage: this.authorImage || 'assets/default.png',
          authorName: this.authorName,
          content: this.newCommentContent,
        };

        this.comments.push(newComment);
        this.newCommentContent = '';
      },
      error: (error) => {
        console.error('Error posting comment', error);
      },
    });
  }

  deletePost() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this post?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.http.delete(`${environment.BASE_URL}/posts/${this.postId}`, { headers }).subscribe({
          next: (response: any) => {
            Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
            this.postDeleted.emit(this.postId);
          },
          error: (error) => {
            Swal.fire('Error!', 'There was an error deleting your post.', 'error');
            console.error('Error deleting post', error);
          },
        });
      }
    });
  }

  updatePost(updatedContent: string) {
    if (!updatedContent.trim()) {
      console.error('Updated content is empty');
      return;
    }

    const requestBody = {
      content: updatedContent,
    };

    this.http.put(`${environment.BASE_URL}/posts/${this.postId}`, requestBody, { headers }).subscribe({
      next: (response: any) => {
        console.log('Post updated successfully', response);
        this.postContent = updatedContent;
        this.isEditing = false;
      },
      error: (error) => {
        console.error('Error updating post', error);
      },
    });
  }

  startEditing() {
    this.isEditing = true;
    this.editedContent = this.postContent;
  }

  saveEdit() {
    this.updatePost(this.editedContent);
  }

  cancelEdit() {
    this.isEditing = false;
  }
}
