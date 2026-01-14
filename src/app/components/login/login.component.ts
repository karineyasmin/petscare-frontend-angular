import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isRegistering: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  hidePassword: boolean = true;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['user', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): {[key: string]: any} | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;
    
    if (this.isRegistering) {
      if (this.registerForm.valid) {
        const registerData = {
          username: this.registerForm.value.username,
          password: this.registerForm.value.password,
          role: this.registerForm.value.role
        };
        
        console.log('Enviando dados de registro:', registerData);
        
        this.authService.register(registerData).subscribe({
          next: (response) => {
            console.log('Registro bem-sucedido:', response);
            this.successMessage = 'Registro realizado com sucesso! Faça login.';
            this.isRegistering = false;
            this.registerForm.reset({
              role: 'user'
            });
            this.loading = false;
          },
          error: (error) => {
            console.error('Erro no registro:', error);
            this.errorMessage = error.message || 'Erro ao registrar usuário.';
            this.loading = false;
          }
        });
      } else {
        this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
        this.loading = false;
      }
    } else {
      if (this.loginForm.valid) {
        const { username, password } = this.loginForm.value;
        
        console.log('Tentando login com:', username);
        
        this.authService.login(username, password).subscribe({
          next: (response) => {
            console.log('Login bem-sucedido:', response);
            // O token já foi armazenado no AuthService.login
            this.router.navigate(['/']);
            this.loading = false;
          },
          error: (error) => {
            console.error('Erro no login:', error);
            this.errorMessage = error.message;
            this.loading = false;
          }
        });
      } else {
        this.errorMessage = 'Por favor, preencha todos os campos.';
        this.loading = false;
      }
    }
  }

  toggleRegister(): void {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
    this.successMessage = '';
  }
}