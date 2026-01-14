import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Pets Care';

  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar tokens, mas NÃO limpar tokens persistentes
    this.verifyTokens();
  }

  private verifyTokens(): void {
    // NÃO limpar tokens persistentes (removeremos essa limpeza)
    // Em vez disso, verificar se o token é válido
    this.authService.checkTokenExpiration();
    console.log('Verificação de tokens concluída');
  }
}