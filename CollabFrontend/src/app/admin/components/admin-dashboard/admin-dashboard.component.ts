import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { AdminService } from '../../services/admin.service';
import { User } from '../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatTableModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['email', 'name', 'role'];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.adminService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }
} 