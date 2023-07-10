import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent {
  constructor(private authService: AuthenticationService) {

  }
  authMultivende() {
    this.authService.authetication().subscribe({
      next: (data) => {
        alert("Todo ok");
      },
      error: (err) => {
        window.location.href = err.url;
      },
    });
  }

}
